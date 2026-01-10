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
            <div className="grid grid-cols-7 gap-2 mb-3">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-text-muted uppercase py-2">
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
                            className={`min-h-28 p-3 rounded-lg border transition-all cursor-pointer ${isCurrentMonth
                                    ? 'bg-white dark:bg-bg-tertiary border-gray-200 dark:border-glass-white-5 hover:border-primary hover:shadow-sm'
                                    : 'bg-gray-50 dark:bg-bg-secondary border-transparent opacity-40'
                                } ${isDayToday ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                            onClick={() => onDateClick(day)}
                        >
                            <div
                                className={`text-sm font-semibold mb-2 ${isDayToday
                                        ? 'text-primary'
                                        : isCurrentMonth
                                            ? 'text-text-primary'
                                            : 'text-text-muted'
                                    }`}
                            >
                                {format(day, 'd')}
                            </div>

                            {/* Event indicators */}
                            <div className="space-y-1">
                                {dayEvents.slice(0, 2).map((event) => {
                                    const category = EVENT_CATEGORIES.find((c) => c.value === event.category);
                                    return (
                                        <div
                                            key={event.id}
                                            className="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                                            style={{
                                                backgroundColor: category?.color + '15',
                                                borderLeft: `3px solid ${category?.color}`,
                                                color: category?.color,
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
                                {dayEvents.length > 2 && (
                                    <div className="text-xs text-text-muted px-2 font-medium">
                                        +{dayEvents.length - 2} más
                                    </div>
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
