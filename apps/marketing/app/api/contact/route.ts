import { sendEmail } from "@repo/mail";
import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
        name: z.string().trim().min(1).max(100),
        email: z.email().max(254),
        message: z.string().trim().min(10).max(5000),
        website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
        try {
                const body = await request.json();
                const result = contactSchema.safeParse(body);

                if (!result.success) {
                        return NextResponse.json(
                                { error: "Invalid contact form submission." },
                                { status: 400 },
                        );
                }

                const { name, email, message } = result.data;

                const contactEmail = process.env.BIOANALYTIX_CONTACT_EMAIL;

                if (!contactEmail) {
                        console.error("BIOANALYTIX_CONTACT_EMAIL is not configured.");

                        return NextResponse.json(
                                { error: "Contact service is unavailable." },
                                { status: 503 },
                        );
                }

                const sent = await sendEmail({
                        to: contactEmail,
                        replyTo: email,
                        subject: `Bioanalytix enquiry from ${name}`,
                        text: [
                                "New Bioanalytix contact enquiry",
                                "",
                                `Name: ${name}`,
                                `Email: ${email}`,
                                "",
                                "Message:",
                                message,
                        ].join("\n"),
                });

                if (!sent) {
                        return NextResponse.json(
                                { error: "Unable to send contact enquiry." },
                                { status: 502 },
                        );
                }

                return NextResponse.json({ success: true });
        } catch {
                return NextResponse.json(
                        { error: "Unable to process contact enquiry." },
                        { status: 500 },
                );
        }
}
