import { z } from 'zod';

export const webSummarySchema = z.object({
    url: z
        .string()
        .trim()
        .url("Invalid URL"),

    client: z.enum(
        ['gemini', 'groq', 'cerebras', 'gemma', 'sarvam'],
        {
            error: "Invalid client model",
        }
    ),
});