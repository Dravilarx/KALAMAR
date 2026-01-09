import { getGeminiModel } from '../config/gemini';
import type { CalendarEventInput } from '../types/calendar';
import { format } from 'date-fns';

export const aiService = {
    /**
     * Parses a natural language string into a CalendarEventInput object.
     */
    async parseEventFromText(text: string, userId: string, today: Date = new Date()): Promise<Partial<CalendarEventInput>> {
        const model = getGeminiModel();
        const prompt = `
            Eres un asistente de calendario familiar. Tu tarea es extraer información de eventos de un texto en lenguaje natural.
            Hoy es: ${format(today, 'EEEE, d MMMM yyyy HH:mm')}.
            
            Texto del usuario: "${text}"
            
            Devuelve un objeto JSON con los siguientes campos (si no están presentes, omítelos):
            - title: string
            - description: string
            - startDate: string (formato ISO 8601)
            - endDate: string (formato ISO 8601, si no se especifica, asume 1 hora de duración)
            - category: "medical" | "school" | "work" | "social" | "maintenance" | "other"
            - location: string
            
            Responde ÚNICAMENTE con el objeto JSON. No añadidas texto adicional.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const jsonText = response.text().trim().replace(/```json/g, '').replace(/```/g, '');
            const parsed = JSON.parse(jsonText);

            // Convert string dates to Date objects
            if (parsed.startDate) parsed.startDate = new Date(parsed.startDate);
            if (parsed.endDate) parsed.endDate = new Date(parsed.endDate);

            return {
                ...parsed,
                userId,
                isRecurring: false,
            };
        } catch (error) {
            console.error('Error parsing event with AI:', error);
            throw new Error('No pude entender el evento. Por favor intenta ser más específico.');
        }
    },

    /**
     * Generates a list of suggested tasks or events based on family patterns or common needs.
     */
    async getFamilySuggestions(familyContext: string): Promise<string[]> {
        const model = getGeminiModel();
        const prompt = `
            Basado en el contexto de esta familia: "${familyContext}"
            Sugiere 5 actividades o tareas importantes para el calendario familiar (ej: compras, mantenimiento, ocio).
            Responde con una lista simple de strings, una por línea.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^\d+\.\s*/, ''));
        } catch (error) {
            console.error('Error getting AI suggestions:', error);
            return [];
        }
    }
};
