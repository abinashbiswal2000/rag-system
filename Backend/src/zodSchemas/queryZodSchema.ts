import { z } from "zod";

export const queryZodSchema = z.object({
    question: z.string().trim().min(1, "Question is required").max(500),
});