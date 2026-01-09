import React from 'react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    format,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarEvent } from '../../types/calendar';
import { EVENT_CATEGORIES } from '../../types/calendar';

interface CalendarGridProps {
    currentDate: Date;
    events: CalendarEvent[];
    onDateClick: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
    currentDate,
    events,
    onDateClick,
    onEventClick,
}) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { locale: es });
    const calendarEnd = endOfWeek(monthEnd, { locale: es });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const getEventsForDay = (date: Date) => {
        return events.filter((event) => isSameDay(event.startDate, date));
    };

    return (
        <div>
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-text-secondary py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isDayToday = isToday(day);

                    return (
                        <div
                            key={day.toString()}
                            className={`min-h-24 p-2 rounded-lg border transition-all cursor-pointer ${isCurrentMonth
                                ? 'bg-bg-tertiary border-glass-white-5 hover:border-primary'
                                : 'bg-bg-secondary border-transparent opacity-50'
                                } ${isDayToday ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => onDateClick(day)}
                        >
                            <div
                                className={`text-sm font-semibold mb-1 ${isDayToday ? 'text-primary' : isCurrentMonth ? 'text-text-primary' : 'text-text-muted'
                                    }`}
                            >
                                {format(day, 'd')}
                            </div>

                            {/* Event indicators */}
                            <div className="space-y-1">
                                {dayEvents.slice(0, 3).map((event) => {
                                    const category = EVENT_CATEGORIES.find((c) => c.value === event.category);
                                    return (
                                        <div
                                            key={event.id}
                                            className="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                                            style={{
                                                backgroundColor: category?.color + '20',
                                                borderLeft: `3px solid ${category?.color}`,
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEventClick(event);
                                            }}
                                        >
                                            {event.title}
                                        </div>
                                    );
                                })}
                                {dayEvents.length > 3 && (
                                    <div className="text-xs text-text-muted px-2">+{dayEvents.length - 3} más</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarGrid;
