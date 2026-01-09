import React, { useState } from 'react';
import type { CalendarEvent } from '../../types/calendar';
import { EVENT_CATEGORIES } from '../../types/calendar';
import type { FamilyMember } from '../../types/family';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search } from 'lucide-react';

interface EventListProps {
    events: CalendarEvent[];
    familyMembers: FamilyMember[];
    onEventClick: (event: CalendarEvent) => void;
}

const EventList: React.FC<EventListProps> = ({ events, familyMembers, onEventClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Filter events
    const filteredEvents = events.filter((event) => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || event.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Group events by date
    const groupedEvents = filteredEvents.reduce((groups, event) => {
        const dateKey = format(event.startDate, 'yyyy-MM-dd');
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(event);
        return groups;
    }, {} as Record<string, CalendarEvent[]>);

    const sortedDates = Object.keys(groupedEvents).sort();

    if (events.length === 0) {
        return (
            <div className="card-glass text-center py-12">
                <p className="text-text-secondary">No hay eventos en este mes</p>
                <p className="text-text-muted text-sm mt-2">Crea tu primer evento para comenzar</p>
            </div>
        );
    }

    return (
        <div className="card-glass">
            <h3 className="text-xl font-semibold mb-4">Lista de Eventos</h3>

            {/* Search and Filter */}
            <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        className="input pl-10"
                        placeholder="Buscar eventos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select
                        className="input pr-10"
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value || null)}
                    >
                        <option value="">Todas las categorías</option>
                        {EVENT_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Event List */}
            <div className="space-y-6">
                {sortedDates.length === 0 ? (
                    <p className="text-text-secondary text-center py-8">No se encontraron eventos</p>
                ) : (
                    sortedDates.map((dateKey) => {
                        const dateEvents = groupedEvents[dateKey];
                        const date = new Date(dateKey);

                        return (
                            <div key={dateKey}>
                                <h4 className="text-sm font-semibold text-text-secondary mb-3 capitalize">
                                    {format(date, 'EEEE, d MMMM', { locale: es })}
                                </h4>
                                <div className="space-y-2">
                                    {dateEvents.map((event) => {
                                        const category = EVENT_CATEGORIES.find((c) => c.value === event.category);
                                        const assignedMembers = familyMembers.filter((m) =>
                                            event.assignedTo?.includes(m.id)
                                        );

                                        return (
                                            <div
                                                key={event.id}
                                                className="p-4 bg-bg-tertiary border border-glass-white-5 rounded-lg hover:border-primary transition-all cursor-pointer"
                                                onClick={() => onEventClick(event)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className="w-1 h-full rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: category?.color }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-3 mb-2">
                                                            <h5 className="font-semibold">{event.title}</h5>
                                                            <span className="text-sm text-text-muted whitespace-nowrap">
                                                                {format(event.startDate, 'HH:mm')} - {format(event.endDate, 'HH:mm')}
                                                            </span>
                                                        </div>
                                                        {event.description && (
                                                            <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                                                                {event.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 text-xs text-text-muted">
                                                            {event.location && <span>📍 {event.location}</span>}
                                                            {assignedMembers.length > 0 && (
                                                                <div className="flex items-center gap-1">
                                                                    <span>👥</span>
                                                                    <span>{assignedMembers.map((m) => m.name).join(', ')}</span>
                                                                </div>
                                                            )}
                                                            <span
                                                                className="px-2 py-1 rounded"
                                                                style={{
                                                                    backgroundColor: category?.color + '20',
                                                                    color: category?.color,
                                                                }}
                                                            >
                                                                {category?.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default EventList;
