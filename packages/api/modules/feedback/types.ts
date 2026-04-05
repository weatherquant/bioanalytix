import { z } from "zod";

export const feedbackSchema = z.object({
    message: z.string().min(10).max(1000),
    type: z.enum(["bug", "feature", "general"]).default("general"),
    email: z.string().email().optional(),
    name: z.string().min(2).max(100).optional(),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;
