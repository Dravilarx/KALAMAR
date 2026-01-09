import React, { useState } from 'react';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';
import { aiService } from '../../services/aiService';
import type { CalendarEventInput } from '../../types/calendar';

interface AIAssistantModalProps {
    userId: string;
    onClose: () => void;
    onAddEvent: (eventData: Partial<CalendarEventInput>) => void;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ userId, onClose, onAddEvent }) => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || loading) return;

        setLoading(true);
        setError('');

        try {
            const parsedEvent = await aiService.parseEventFromText(text, userId);
            onAddEvent(parsedEvent);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al procesar el texto. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-glass-white-5">
                    <div className="flex items-center gap-2">
                        <Sparkles size={24} className="text-primary" />
                        <h2 className="text-2xl font-semibold">Asistente IA</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-glass-white-5 rounded-lg transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-text-secondary mb-4">
                        Dime qué evento quieres crear y yo me encargo de los detalles.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="relative">
                            <textarea
                                className="textarea pr-12 min-h-[120px]"
                                placeholder="Ejem: Cena familiar el próximo viernes a las 8pm en casa..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                className="absolute bottom-3 right-3 p-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all disabled:opacity-50"
                                disabled={!text.trim() || loading}
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </div>

                        {error && (
                            <p className="text-danger text-sm mt-2">{error}</p>
                        )}

                        <div className="mt-6 flex flex-wrap gap-2">
                            <span className="text-xs text-text-muted w-full mb-1">Sugerencias:</span>
                            {['Cita pediatra lunes 10am', 'Partido padel mañana 19:00', 'Cumpleaños Pedro 15 marzo'].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    className="text-xs px-3 py-1 bg-bg-tertiary border border-glass-white-5 rounded-full hover:border-primary transition-all"
                                    onClick={() => setText(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIAssistantModal;
