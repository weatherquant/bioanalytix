import { ORPCError } from "@orpc/server";
import { auth } from "@repo/auth";
import { createFeedback } from "@repo/database";
import { logger } from "@repo/logs";
import { z } from "zod";
import { publicProcedure } from "../../../orpc/procedures";
import { feedbackSchema } from "../types";

export const createFeedbackProcedure = publicProcedure
    .route({
        method: "POST",
        path: "/feedback",
        tags: ["Feedback"],
        summary: "Submit user feedback",
        description: "Submit feedback with optional contact information",
    })
    .input(feedbackSchema)
    .output(
        z.object({
            id: z.string(),
            message: z.string(),
        }),
    )
    .handler(async ({ input, context }) => {
        try {
            // Get session if available (for authenticated users)
            const session = await auth.api.getSession({
                headers: context.headers,
            });

            // Get IP address from headers if available
            const ipAddress = context.headers.get("x-forwarded-for") || 
                             context.headers.get("x-real-ip") || 
                             undefined;

            // Store feedback in database using the query function
            const feedback = await createFeedback({
                message: input.message,
                type: input.type,
                email: input.email,
                name: input.name,
                ipAddress,
                userId: session?.user.id,
            });

            return {
                id: feedback.id,
                message: "Feedback submitted successfully",
            };
        } catch (error) {
            logger.error("Failed to submit feedback:", error);
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Could not submit feedback",
            });
        }
    });