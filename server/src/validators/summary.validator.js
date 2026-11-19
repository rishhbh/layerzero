import { z } from 'zod';

export const webSummarySchema = z.object({
    url: z
        .string()
        .trim()
        .url("Invalid URL"),

    client: z.enum(
        ['gemini', 'groq', 'gemma', 'sarvam'],
        {
            error: "Invalid client model",
        }
    ),
});