import { db } from "../client";

export async function createFeedback({
    message,
    type,
    email,
    name,
    ipAddress,
    userId,
}: {
    message: string;
    type: string;
    email?: string;
    name?: string;
    ipAddress?: string;
    userId?: string;
}) {
    return await db.feedback.create({
        data: {
            message,
            type,
            email,
            name,
            ipAddress,
            userId,
        },
    });
}
