import React from 'react';
import {
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameDay,
    isToday,
    isSameHour,
    addHours,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarEvent } from '../../types/calendar';
import { EVENT_CATEGORIES } from '../../types/calendar';
import { MoreHorizontal, Users as UsersIcon } from 'lucide-react';

interface WeekViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onDateClick: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
    currentDate,
    events,
    onDateClick,
    onEventClick,
}) => {
    const weekStart = startOfWeek(currentDate, { locale: es });
    const weekEnd = endOfWeek(currentDate, { locale: es });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Hours from 6 AM to 11 PM
    const startHour = 6;
    const endHour = 23;
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

    // Current time indicator
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const showNowIndicator = currentHour >= startHour && currentHour <= endHour;

    const getEventsForDay = (day: Date) => {
        return events.filter((event) => isSameDay(event.startDate, day));
    };

    const getAllDayEvents = (day: Date) => {
        const dayEvents = getEventsForDay(day);
        return dayEvents.filter(event => {
            const duration = event.endDate.getTime() - event.startDate.getTime();
            const hours = duration / (1000 * 60 * 60);
            return hours >= 23; // Consider events 23+ hours as "all day"
        });
    };

    const getTimedEvents = (day: Date) => {
        const dayEvents = getEventsForDay(day);
        return dayEvents.filter(event => {
            const duration = event.endDate.getTime() - event.startDate.getTime();
            const hours = duration / (1000 * 60 * 60);
            return hours < 23;
        });
    };

    const getEventPosition = (event: CalendarEvent) => {
        const startHourNum = event.startDate.getHours();
        const startMinutes = event.startDate.getMinutes();
        const endHourNum = event.endDate.getHours();
        const endMinutes = event.endDate.getMinutes();

        const top = ((startHourNum - startHour) * 60 + startMinutes) * (60 / 60); // 60px per hour
        const duration = ((endHourNum - startHourNum) * 60 + (endMinutes - startMinutes));
        const height = Math.max(duration * (60 / 60), 40); // Minimum 40px height

        return { top, height };
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden">
            {/* Week Header with Days */}
            <div className="grid grid-cols-8 gap-0 border-b border-[var(--border-subtle)] glass sticky top-0 z-30">
                <div className="w-20 flex-shrink-0 border-r border-[var(--border-subtle)]"></div>
                {weekDays.map((day) => {
                    const isDayToday = isToday(day);
                    const allDayEvents = getAllDayEvents(day);

                    return (
                        <div key={day.toString()} className="flex flex-col min-w-0 border-l border-[var(--border-subtle)]">
                            {/* Day header */}
                            <div className={`text-center py-4 px-1 ${isDayToday ? 'bg-[var(--primary-glow)]' : ''}`}>
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${isDayToday ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>
                                    {format(day, 'EEE', { locale: es })}
                                </div>
                                <div className={`text-lg font-bold mt-1 tabular-nums ${isDayToday ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'
                                    }`}>
                                    {format(day, 'd')}
                                </div>
                            </div>

                            {/* All-day events */}
                            {allDayEvents.length > 0 && (
                                <div className="px-1.5 pb-2 space-y-1">
                                    {allDayEvents.map((event) => {
                                        const category = EVENT_CATEGORIES.find((c) => c.value === event.category);
                                        return (
                                            <div
                                                key={event.id}
                                                className="text-[10px] px-2 py-1.5 rounded-lg cursor-pointer hover:brightness-110 active:scale-95 transition-all font-semibold flex items-center justify-between group shadow-sm border border-[var(--glass-white-10)]"
                                                style={{
                                                    backgroundColor: category?.color + '30',
                                                    color: category?.color,
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEventClick(event);
                                                }}
                                            >
                                                <span className="truncate">{event.title}</span>
                                                <MoreHorizontal size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Time grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-8 gap-0 relative min-h-full">
                    {/* Time labels column */}
                    <div className="w-20 flex-shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
                        {hours.map((hour) => (
                            <div key={hour} className="h-20 flex items-start justify-end pr-3 pt-2 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">
                                {format(addHours(new Date().setHours(hour, 0, 0, 0), 0), 'HH:mm')}
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {weekDays.map((day) => {
                        const isDayToday = isToday(day);
                        const timedEvents = getTimedEvents(day);

                        return (
                            <div
                                key={day.toString()}
                                className={`relative border-l border-[var(--border-subtle)] ${isDayToday ? 'bg-[var(--primary-glow)]/5' : ''}`}
                            >
                                {/* Hour rows */}
                                {hours.map((hour) => (
                                    <div
                                        key={hour}
                                        className="h-20 border-b border-[var(--border-subtle)] hover:bg-[var(--glass-white-5)] cursor-pointer transition-colors"
                                        onClick={() => {
                                            const clickedDate = new Date(day);
                                            clickedDate.setHours(hour, 0, 0, 0);
                                            onDateClick(clickedDate);
                                        }}
                                    />
                                ))}

                                {/* Timed events */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {timedEvents.map((event) => {
                                        const { top, height } = getEventPosition(event);
                                        // Adjust top and height for 80px (h-20) instead of 60px
                                        const adjustedTop = (top / 60) * 80;
                                        const adjustedHeight = (height / 60) * 80;
                                        const category = EVENT_CATEGORIES.find((c) => c.value === event.category);

                                        return (
                                            <div
                                                key={event.id}
                                                className="absolute left-1 right-1 rounded-xl shadow-lg cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all pointer-events-auto group overflow-hidden border border-[var(--glass-white-15)] glass-elevated"
                                                style={{
                                                    top: `${adjustedTop + 4}px`,
                                                    height: `${adjustedHeight - 8}px`,
                                                    backgroundColor: category?.color + '15',
                                                    borderLeft: `4px solid ${category?.color}`,
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEventClick(event);
                                                }}
                                            >
                                                <div className="p-2.5 h-full flex flex-col">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <div className="font-bold text-xs leading-tight line-clamp-2 flex-1" style={{ color: category?.color }}>
                                                            {event.title}
                                                        </div>
                                                        <MoreHorizontal
                                                            size={14}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1"
                                                            style={{ color: category?.color }}
                                                        />
                                                    </div>
                                                    <div className="text-[10px] font-semibold opacity-80 mb-2" style={{ color: category?.color }}>
                                                        {format(event.startDate, 'HH:mm')} - {format(event.endDate, 'HH:mm')}
                                                    </div>
                                                    {event.assignedTo && event.assignedTo.length > 0 && (
                                                        <div className="mt-auto flex items-center gap-1.5">
                                                            <div className="flex -space-x-2">
                                                                {event.assignedTo.map((userId, idx) => (
                                                                    <div key={idx} className="w-5 h-5 rounded-full border border-[var(--bg-secondary)] bg-[var(--primary)] flex items-center justify-center text-[8px] text-white">
                                                                        {userId.charAt(0).toUpperCase()}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Current time indicator */}
                                {isDayToday && showNowIndicator && (
                                    <div
                                        className="absolute left-0 right-0 pointer-events-none z-20"
                                        style={{
                                            top: `${(((currentHour - startHour) * 60 + currentMinutes) / 60) * 80}px`,
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary-glow)] -ml-1.5 border-2 border-[var(--bg-primary)]"></div>
                                            <div className="flex-1 h-0.5 bg-gradient-to-r from-[var(--primary)] to-transparent"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WeekView;
