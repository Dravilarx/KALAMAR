import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { calendarService } from '../../services/calendarService';
import { familyService } from '../../services/familyService';
import type { CalendarEvent } from '../../types/calendar';
import type { FamilyMember } from '../../types/family';
import { startOfMonth, endOfMonth, addMonths, subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Users } from 'lucide-react';
import CalendarGrid from './CalendarGrid';
import EventModal from './EventModal';
import EventList from './EventList';
import FamilyManager from '../family/FamilyManager';
import AIAssistantModal from './AIAssistantModal';
import { Sparkles } from 'lucide-react';
import type { CalendarEventInput } from '../../types/calendar';

const CalendarModule: React.FC = () => {
    const { user } = useAuth();
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
                const start = startOfMonth(currentDate);
                const end = endOfMonth(currentDate);

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
    }, [user, currentDate]);

    const handlePreviousMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
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
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Calendario Familiar</h1>
                    <p className="text-text-secondary">Gestiona eventos y actividades del hogar</p>
                </div>
                <div className="flex gap-3">
                    <button
                        className="btn btn-ghost"
                        onClick={() => setShowAIModal(true)}
                    >
                        <Sparkles size={20} className="text-primary" />
                        <span>Asistente AI</span>
                    </button>
                    <button
                        className="btn btn-ghost"
                        onClick={() => setShowFamilyManager(true)}
                    >
                        <Users size={20} />
                        <span>Familia ({familyMembers.length})</span>
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setSelectedDate(new Date());
                            setSelectedEvent(null);
                            setShowEventModal(true);
                        }}
                    >
                        <Plus size={20} />
                        <span>Nuevo Evento</span>
                    </button>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="card-glass mb-6">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={handlePreviousMonth} className="btn btn-ghost btn-sm">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-semibold capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <button onClick={handleNextMonth} className="btn btn-ghost btn-sm">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <CalendarGrid
                    currentDate={currentDate}
                    events={events}
                    onDateClick={handleDateClick}
                    onEventClick={handleEventClick}
                />
            </div>

            {/* Event List */}
            <EventList
                events={events}
                familyMembers={familyMembers}
                onEventClick={handleEventClick}
            />

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
