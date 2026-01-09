export type EventCategory = 'medical' | 'school' | 'work' | 'social' | 'maintenance' | 'other';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
    frequency: RecurrenceFrequency;
    interval: number; // e.g., every 2 weeks
    endDate?: Date;
    count?: number; // number of occurrences
}

export interface ReminderSettings {
    enabled: boolean;
    minutesBefore: number; // e.g., 30 minutes before
}

export interface CalendarEvent {
    id: string;
    userId: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    category: EventCategory;
    assignedTo: string[]; // Family member IDs
    isRecurring: boolean;
    recurrenceRule?: RecurrenceRule;
    location?: string;
    reminder?: ReminderSettings;
    color?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CalendarEventInput extends Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> { }

export const EVENT_CATEGORIES: { value: EventCategory; label: string; color: string; icon: string }[] = [
    { value: 'medical', label: 'Médico', color: '#ef4444', icon: 'Heart' },
    { value: 'school', label: 'Escolar', color: '#3b82f6', icon: 'GraduationCap' },
    { value: 'work', label: 'Trabajo', color: '#8b5cf6', icon: 'Briefcase' },
    { value: 'social', label: 'Social', color: '#ec4899', icon: 'Users' },
    { value: 'maintenance', label: 'Mantenimiento', color: '#f59e0b', icon: 'Wrench' },
    { value: 'other', label: 'Otro', color: '#6b7280', icon: 'Calendar' },
];
