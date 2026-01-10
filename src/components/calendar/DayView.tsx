import React from 'react';
import { format, eachHourOfInterval, startOfDay, endOfDay, isSameHour, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarEvent } from '../../types/calendar';
import { EVENT_CATEGORIES } from '../../types/calendar';

interface DayViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onDateClick: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
}

const DayView: React.FC<DayViewProps> = ({
    currentDate,
    events,
    onDateClick,
    onEventClick,
}) => {
    const dayStart = startOfDay(currentDate);
    const dayEnd = endOfDay(currentDate);
    const hours = eachHourOfInterval({ start: dayStart, end: dayEnd });

    const getEventsForHour = (hour: Date) => {
        return events.filter((event) => {
            const eventHour = startOfDay(event.startDate).getTime() === startOfDay(currentDate).getTime()
                ? event.startDate.getHours()
                : -1;
            return eventHour === hour.getHours();
        });
    };

    return (
        <div className="space-y-2">
            {/* Day Header */}
            <div className="mb-4 pb-4 border-b border-glass-white-10">
                <h3 className="text-2xl font-bold capitalize">
                    {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </h3>
            </div>

            {/* Time slots */}
            <div className="space-y-1">
                {hours.map((hour) => {
                    const hourEvents = getEventsForHour(hour);
                    const timeStr = format(hour, 'HH:mm');

                    return (
                        <div
                            key={hour.toString()}
                            className="flex gap-4 min-h-16 group"
                        >
                            {/* Time label */}
                            <div className="w-20 flex-shrink-0 text-sm font-semibold text-text-secondary pt-1">
                                {timeStr}
                            </div>

                            {/* Event area */}
                            <div
                                className="flex-1 border-l-2 border-glass-white-5 pl-4 cursor-pointer hover:bg-bg-tertiary rounded-r-lg transition-all group-hover:border-primary"
                                onClick={() => {
                                    const clickedDate = new Date(currentDate);
                                    clickedDate.setHours(hour.getHours(), 0, 0, 0);
                                    onDateClick(clickedDate);
                                }}
                            >
                                {hourEvents.length > 0 ? (
                                    <div className="space-y-2 py-1">
                                        {hourEvents.map((event) => {
                                            const category = EVENT_CATEGORIES.find((c) => c.value === event.category);
                                            return (
                                                <div
                                                    key={event.id}
                                                    className="p-3 rounded-lg cursor-pointer hover:opacity-80 transition-all"
                                                    style={{
                                                        backgroundColor: category?.color + '20',
                                                        borderLeft: `4px solid ${category?.color}`,
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEventClick(event);
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-text-primary">
                                                                {event.title}
                                                            </div>
                                                            {event.description && (
                                                                <div className="text-sm text-text-secondary mt-1">
                                                                    {event.description}
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-text-muted mt-1">
                                                                {format(event.startDate, 'HH:mm')} - {format(event.endDate, 'HH:mm')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DayView;
