import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { calendarService } from '../../services/calendarService';
import type { CalendarEvent, EventCategory } from '../../types/calendar';
import { EVENT_CATEGORIES } from '../../types/calendar';
import type { FamilyMember } from '../../types/family';
import { format } from 'date-fns';
import { X, Calendar, Clock, MapPin, Tag, Users as UsersIcon, Repeat } from 'lucide-react';
import type { CalendarEvent, EventCategory, CalendarEventInput, RecurrenceFrequency } from '../../types/calendar';

interface EventModalProps {
    event: CalendarEvent | null;
    initialDate: Date | null;
    initialData?: Partial<CalendarEventInput> | null;
    familyMembers: FamilyMember[];
    onClose: () => void;
    onSave: () => void;
}

const EventModal: React.FC<EventModalProps> = ({
    event,
    initialDate,
    familyMembers,
    onClose,
    onSave,
}) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [category, setCategory] = useState<EventCategory>('other');
    const [location, setLocation] = useState('');
    const [assignedTo, setAssignedTo] = useState<string[]>([]);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFrequency>('weekly');
    const [recurrenceInterval, setRecurrenceInterval] = useState(1);

    useEffect(() => {
        if (event) {
            setTitle(event.title);
            setDescription(event.description || '');
            setStartDate(format(event.startDate, 'yyyy-MM-dd'));
            setStartTime(format(event.startDate, 'HH:mm'));
            setEndDate(format(event.endDate, 'yyyy-MM-dd'));
            setEndTime(format(event.endDate, 'HH:mm'));
            setCategory(event.category);
            setLocation(event.location || '');
            setAssignedTo(event.assignedTo || []);
            setIsRecurring(event.isRecurring || false);
            if (event.recurrenceRule) {
                setRecurrenceFreq(event.recurrenceRule.frequency);
                setRecurrenceInterval(event.recurrenceRule.interval);
            }
        } else if (initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            if (initialData.startDate) {
                setStartDate(format(initialData.startDate, 'yyyy-MM-dd'));
                setStartTime(format(initialData.startDate, 'HH:mm'));
            }
            if (initialData.endDate) {
                setEndDate(format(initialData.endDate, 'yyyy-MM-dd'));
                setEndTime(format(initialData.endDate, 'HH:mm'));
            }
            if (initialData.category) setCategory(initialData.category);
            if (initialData.location) setLocation(initialData.location);
            setIsRecurring(initialData.isRecurring || false);
        } else if (initialDate) {
            const dateStr = format(initialDate, 'yyyy-MM-dd');
            setStartDate(dateStr);
            setEndDate(dateStr);
            setStartTime('09:00');
            setEndTime('10:00');
        }
    }, [event, initialDate, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError('');
        setLoading(true);

        try {
            const start = new Date(`${startDate}T${startTime}`);
            const end = new Date(`${endDate}T${endTime}`);

            if (end <= start) {
                setError('La fecha de fin debe ser posterior a la fecha de inicio');
                setLoading(false);
                return;
            }

            const eventData = {
                userId: user.uid,
                title,
                description,
                startDate: start,
                endDate: end,
                category,
                location,
                assignedTo,
                isRecurring,
                recurrenceRule: isRecurring ? {
                    frequency: recurrenceFreq,
                    interval: recurrenceInterval,
                } : undefined,
            };

            if (event) {
                await calendarService.updateEvent(event.id, eventData);
            } else {
                await calendarService.createEvent(user.uid, eventData);
            }

            onSave();
        } catch (err: any) {
            setError('Error al guardar el evento. Por favor intenta nuevamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!event || !confirm('¿Estás seguro de eliminar este evento?')) return;

        setLoading(true);
        try {
            await calendarService.deleteEvent(event.id);
            onSave();
        } catch (err) {
            setError('Error al eliminar el evento');
        } finally {
            setLoading(false);
        }
    };

    const toggleMemberAssignment = (memberId: string) => {
        setAssignedTo((prev) =>
            prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
        );
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-glass-white-5">
                    <h2 className="text-2xl font-semibold">{event ? 'Editar Evento' : 'Nuevo Evento'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-glass-white-5 rounded-lg transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-danger bg-opacity-10 border border-danger rounded-lg">
                            <p className="text-danger text-sm">{error}</p>
                        </div>
                    )}

                    {/* Title */}
                    <div className="form-group">
                        <label className="label">
                            <Tag size={16} className="inline mr-2" />
                            Título
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Ej: Cita médica, Reunión escolar..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label className="label">
                            <Calendar size={16} className="inline mr-2" />
                            Categoría
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {EVENT_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    className={`p-3 rounded-lg border transition-all ${category === cat.value
                                        ? 'border-2'
                                        : 'border-glass-white-5 hover:border-glass-white-10'
                                        }`}
                                    style={{
                                        borderColor: category === cat.value ? cat.color : undefined,
                                        backgroundColor: category === cat.value ? cat.color + '20' : undefined,
                                    }}
                                    onClick={() => setCategory(cat.value)}
                                >
                                    <div className="text-sm font-medium">{cat.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="label">
                                <Clock size={16} className="inline mr-2" />
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                className="input"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Hora Inicio</label>
                            <input
                                type="time"
                                className="input"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Fecha Fin</label>
                            <input
                                type="date"
                                className="input"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Hora Fin</label>
                            <input
                                type="time"
                                className="input"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="form-group">
                        <label className="label">
                            <MapPin size={16} className="inline mr-2" />
                            Ubicación (opcional)
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Ej: Hospital Regional, Colegio..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="label">Descripción (opcional)</label>
                        <textarea
                            className="textarea"
                            rows={3}
                            placeholder="Agrega detalles adicionales..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Assign to family members */}
                    {familyMembers.length > 0 && (
                        <div className="form-group">
                            <label className="label">
                                <UsersIcon size={16} className="inline mr-2" />
                                Asignar a
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {familyMembers.map((member) => (
                                    <button
                                        key={member.id}
                                        type="button"
                                        className={`px-4 py-2 rounded-lg border transition-all ${assignedTo.includes(member.id)
                                            ? 'border-2'
                                            : 'border-glass-white-5 hover:border-glass-white-10'
                                            }`}
                                        style={{
                                            borderColor: assignedTo.includes(member.id) ? member.color : undefined,
                                            backgroundColor: assignedTo.includes(member.id) ? member.color + '20' : undefined,
                                        }}
                                        onClick={() => toggleMemberAssignment(member.id)}
                                    >
                                        {member.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recurrence */}
                    <div className="form-group border-t border-glass-white-5 pt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-glass-white-10 bg-bg-tertiary text-primary focus:ring-primary"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                            />
                            <div className="flex items-center gap-2">
                                <Repeat size={16} className="text-text-secondary" />
                                <span className="font-semibold">Evento Recurrente</span>
                            </div>
                        </label>

                        {isRecurring && (
                            <div className="grid grid-cols-2 gap-4 mt-4 animate-fade-in">
                                <div>
                                    <label className="label">Frecuencia</label>
                                    <select
                                        className="input"
                                        value={recurrenceFreq}
                                        onChange={(e) => setRecurrenceFreq(e.target.value as RecurrenceFrequency)}
                                    >
                                        <option value="daily">Diario</option>
                                        <option value="weekly">Semanal</option>
                                        <option value="monthly">Mensual</option>
                                        <option value="yearly">Anual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Cada (intervalo)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        min="1"
                                        value={recurrenceInterval}
                                        onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        {event && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="btn btn-ghost text-danger"
                                disabled={loading}
                            >
                                Eliminar
                            </button>
                        )}
                        <div className="flex-1"></div>
                        <button type="button" onClick={onClose} className="btn btn-ghost" disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : event ? 'Actualizar' : 'Crear Evento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventModal;
