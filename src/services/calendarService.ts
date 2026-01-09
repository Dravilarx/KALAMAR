import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CalendarEvent, CalendarEventInput, RecurrenceFrequency } from '../types/calendar';
import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter, isSameDay, startOfDay } from 'date-fns';

const COLLECTION_NAME = 'calendarEvents';

// Convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: any): Date => {
    if (timestamp?.toDate) {
        return timestamp.toDate();
    }
    return new Date(timestamp);
};

// Convert Date to Firestore timestamp
const convertDateToTimestamp = (date: Date): Timestamp => {
    return Timestamp.fromDate(date);
};

// Convert Firestore document to CalendarEvent
const convertDocToEvent = (doc: any): CalendarEvent => {
    const data = doc.data();
    return {
        ...data,
        id: doc.id,
        startDate: convertTimestampToDate(data.startDate),
        endDate: convertTimestampToDate(data.endDate),
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
    } as CalendarEvent;
};

export const calendarService = {
    // Create a new event
    async createEvent(userId: string, eventInput: Omit<CalendarEventInput, 'userId'>): Promise<string> {
        const now = new Date();
        const eventData = {
            ...eventInput,
            userId,
            startDate: convertDateToTimestamp(eventInput.startDate),
            endDate: convertDateToTimestamp(eventInput.endDate),
            createdAt: convertDateToTimestamp(now),
            updatedAt: convertDateToTimestamp(now),
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), eventData);
        return docRef.id;
    },

    // Update an existing event
    async updateEvent(eventId: string, updates: Partial<CalendarEventInput>): Promise<void> {
        const updateData: any = {
            ...updates,
            updatedAt: convertDateToTimestamp(new Date()),
        };

        if (updates.startDate) {
            updateData.startDate = convertDateToTimestamp(updates.startDate);
        }
        if (updates.endDate) {
            updateData.endDate = convertDateToTimestamp(updates.endDate);
        }

        await updateDoc(doc(db, COLLECTION_NAME, eventId), updateData);
    },

    // Delete an event
    async deleteEvent(eventId: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTION_NAME, eventId));
    },

    // Get events by date range including recurring ones
    async getEventsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
        // 1. Get non-recurring events in range
        const qNormal = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            where('isRecurring', '==', false),
            where('startDate', '>=', convertDateToTimestamp(startDate)),
            where('startDate', '<=', convertDateToTimestamp(endDate)),
            orderBy('startDate', 'asc')
        );

        // 2. Get recurring events that might fall into the range
        // We query for events that started before the end of the range
        const qRecurring = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            where('isRecurring', '==', true),
            where('startDate', '<=', convertDateToTimestamp(endDate))
        );

        const [normalSnapshot, recurringSnapshot] = await Promise.all([
            getDocs(qNormal),
            getDocs(qRecurring)
        ]);

        const normalEvents = normalSnapshot.docs.map(convertDocToEvent);
        const recurringTemplates = recurringSnapshot.docs.map(convertDocToEvent);

        // 3. Expand recurring events
        const expandedRecurringEvents: CalendarEvent[] = [];

        recurringTemplates.forEach(template => {
            if (!template.recurrenceRule) return;

            const { frequency, interval, endDate: ruleEndDate, count } = template.recurrenceRule;
            let current = new Date(template.startDate);
            let durationMs = template.endDate.getTime() - template.startDate.getTime();
            let occurrences = 0;

            while (true) {
                // If we exceed rule end date or count, stop
                if (ruleEndDate && isAfter(startOfDay(current), startOfDay(ruleEndDate))) break;
                if (count && occurrences >= count) break;

                // If occurrence is within our requested range, add it
                if (!isAfter(current, endDate) && !isBefore(addDays(current, 0), startDate)) {
                    // Don't add if it's the original template date (avoid duplicates if first is in range)
                    // Actually, we skip expansion if we just use the virtual list.
                    expandedRecurringEvents.push({
                        ...template,
                        id: `${template.id}-${current.getTime()}`,
                        startDate: new Date(current),
                        endDate: new Date(current.getTime() + durationMs),
                    });
                }

                // If we've passed the requested range, stop expansion
                if (isAfter(current, endDate)) break;

                // Move to next occurrence
                switch (frequency) {
                    case 'daily': current = addDays(current, interval); break;
                    case 'weekly': current = addWeeks(current, interval); break;
                    case 'monthly': current = addMonths(current, interval); break;
                    case 'yearly': current = addYears(current, interval); break;
                    default: break;
                }
                occurrences++;

                // Safety break to prevent infinite loops
                if (occurrences > 1000) break;
            }
        });

        // Combine and sort
        return [...normalEvents, ...expandedRecurringEvents].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    },

    // Get upcoming events
    async getUpcomingEvents(userId: string, limit: number = 10): Promise<CalendarEvent[]> {
        const now = new Date();
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            where('startDate', '>=', convertDateToTimestamp(now)),
            orderBy('startDate', 'asc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.slice(0, limit).map(convertDocToEvent);
    },

    // Get all events for a user
    async getAllEvents(userId: string): Promise<CalendarEvent[]> {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            orderBy('startDate', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(convertDocToEvent);
    },

    // Real-time listener for events
    subscribeToEvents(
        userId: string,
        startDate: Date,
        endDate: Date,
        callback: (events: CalendarEvent[]) => void
    ): () => void {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            where('startDate', '>=', convertDateToTimestamp(startDate)),
            where('startDate', '<=', convertDateToTimestamp(endDate)),
            orderBy('startDate', 'asc')
        );

        return onSnapshot(q, (snapshot) => {
            const events = snapshot.docs.map(convertDocToEvent);
            callback(events);
        });
    },
};
