import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { calendarService } from '../../services/calendarService';
import { familyService } from '../../services/familyService';
import type { CalendarEvent } from '../../types/calendar';
import type { FamilyMember } from '../../types/family';
import { startOfMonth, endOfMonth, addMonths, subMonths, addDays, subDays, addWeeks, subWeeks, startOfWeek, endOfWeek, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Users, Calendar as CalendarIcon } from 'lucide-react';
import CalendarGrid from './CalendarGrid';
import DayView from './DayView';
import WeekView from './WeekView';
import EventModal from './EventModal';
import EventList from './EventList';
import FamilyManager from '../family/FamilyManager';
import AIAssistantModal from './AIAssistantModal';
import { Sparkles } from 'lucide-react';
import type { CalendarEventInput } from '../../types/calendar';

type ViewMode = 'day' | 'week' | 'month';

const CalendarModule: React.FC = () => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showFamilyManager, setShowFamilyManager] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiParsedData, setAiParsedData] = useState<Partial<CalendarEventInput> | null>(null);
    const [loading, setLoading] = useState(true);

    // Load events and family members
    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            setLoading(true);
            try {
                let start: Date;
                let end: Date;

                // Determine date range based on view mode
                if (viewMode === 'day') {
                    start = new Date(currentDate);
                    start.setHours(0, 0, 0, 0);
                    end = new Date(currentDate);
                    end.setHours(23, 59, 59, 999);
                } else if (viewMode === 'week') {
                    start = startOfWeek(currentDate, { locale: es });
                    end = endOfWeek(currentDate, { locale: es });
                } else {
                    start = startOfMonth(currentDate);
                    end = endOfMonth(currentDate);
                }

                const [eventsData, membersData] = await Promise.all([
                    calendarService.getEventsByDateRange(user.uid, start, end),
                    familyService.getFamilyMembers(user.uid),
                ]);

                setEvents(eventsData);
                setFamilyMembers(membersData);
            } catch (error) {
                console.error('Error loading calendar data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user, currentDate, viewMode]);

    const handlePrevious = () => {
        if (viewMode === 'day') {
            setCurrentDate(subDays(currentDate, 1));
        } else if (viewMode === 'week') {
            setCurrentDate(subWeeks(currentDate, 1));
        } else {
            setCurrentDate(subMonths(currentDate, 1));
        }
    };

    const handleNext = () => {
        if (viewMode === 'day') {
            setCurrentDate(addDays(currentDate, 1));
        } else if (viewMode === 'week') {
            setCurrentDate(addWeeks(currentDate, 1));
        } else {
            setCurrentDate(addMonths(currentDate, 1));
        }
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setSelectedEvent(null);
        setShowEventModal(true);
    };

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setSelectedDate(null);
        setShowEventModal(true);
    };

    const handleCloseModal = () => {
        setShowEventModal(false);
        setSelectedDate(null);
        setSelectedEvent(null);
        setAiParsedData(null);
    };

    const handleAIAddEvent = (data: Partial<CalendarEventInput>) => {
        setAiParsedData(data);
        setSelectedEvent(null);
        setSelectedDate(data.startDate || new Date());
        setShowEventModal(true);
    };

    const handleEventSaved = async () => {
        if (!user) return;

        // Reload events
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const eventsData = await calendarService.getEventsByDateRange(user.uid, start, end);
        setEvents(eventsData);
        handleCloseModal();
    };

    const handleFamilyUpdated = async () => {
        if (!user) return;
        const membersData = await familyService.getFamilyMembers(user.uid);
        setFamilyMembers(membersData);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-secondary">Cargando calendario...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Simple Header - Datewise Style */}
            <div className="px-8 py-6 bg-white border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            </div>

            {/* Calendar Navigation */}
            <div className="px-8 py-4 bg-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                    {/* Date Navigation */}
                    <div className="flex items-center gap-3">
                        <button onClick={handlePrevious} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronLeft size={20} className="text-gray-600" />
                        </button>
                        <h2 className="text-base font-semibold text-gray-900 min-w-[200px] text-center">
                            {viewMode === 'day' && format(currentDate, "MMMM, yyyy", { locale: es })}
                            {viewMode === 'week' && format(currentDate, "MMMM, yyyy", { locale: es })}
                            {viewMode === 'month' && format(currentDate, 'MMMM, yyyy', { locale: es })}
                        </h2>
                        <button onClick={handleNext} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronRight size={20} className="text-gray-600" />
                        </button>
                    </div>

                    {/* View Mode Selector - Datewise Style */}
                    <div className="flex items-center gap-2">
                        <select className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                            <option>PST</option>
                        </select>
                        <div className="flex gap-1">
                            <button
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'day'
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                onClick={() => setViewMode('day')}
                            >
                                Day
                            </button>
                            <button
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'week'
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                onClick={() => setViewMode('week')}
                            >
                                Week
                            </button>
                            <button
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'month'
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                onClick={() => setViewMode('month')}
                            >
                                Month
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Content */}
            <div className="flex-1 overflow-hidden bg-white">
                {/* Render appropriate view */}
                {viewMode === 'day' && (
                    <DayView
                        currentDate={currentDate}
                        events={events}
                        onDateClick={handleDateClick}
                        onEventClick={handleEventClick}
                    />
                )}
                {viewMode === 'week' && (
                    <WeekView
                        currentDate={currentDate}
                        events={events}
                        onDateClick={handleDateClick}
                        onEventClick={handleEventClick}
                    />
                )}
                {viewMode === 'month' && (
                    <CalendarGrid
                        currentDate={currentDate}
                        events={events}
                        onDateClick={handleDateClick}
                        onEventClick={handleEventClick}
                    />
                )}
            </div>

            {/* Event Modal */}
            {showEventModal && (
                <EventModal
                    event={selectedEvent}
                    initialDate={selectedDate}
                    initialData={aiParsedData}
                    familyMembers={familyMembers}
                    onClose={handleCloseModal}
                    onSave={handleEventSaved}
                />
            )}

            {/* AI Assistant Modal */}
            {showAIModal && (
                <AIAssistantModal
                    userId={user?.uid || ''}
                    onClose={() => setShowAIModal(false)}
                    onAddEvent={handleAIAddEvent}
                />
            )}

            {/* Family Manager Modal */}
            {showFamilyManager && (
                <FamilyManager
                    members={familyMembers}
                    onClose={() => setShowFamilyManager(false)}
                    onUpdate={handleFamilyUpdated}
                />
            )}
        </div>
    );
};

export default CalendarModule;
