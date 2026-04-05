"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@saas/auth/hooks/use-session";
import { Button } from "@ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@ui/components/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ui/components/select";
import { Textarea } from "@ui/components/textarea";
import { cn } from "@ui/lib";
import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { orpc } from "@shared/lib/orpc-query-utils";
import { toast } from "sonner";

const feedbackSchema = z.object({
    message: z.string().min(10).max(1000),
    type: z.enum(["bug", "feature", "general"]).default("general"),
    email: z.string().email().optional(),
    name: z.string().min(2).max(100).optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export function FeedbackWidget({ className }: { className?: string }) {
    const t = useTranslations();
    const { user } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    const createFeedbackMutation = useMutation(
        orpc.feedback.create.mutationOptions(),
    );

    const form = useForm<FeedbackFormValues>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: {
            message: "",
            type: "general",
            email: "",
            name: "",
        },
    });

    const onSubmit = async (data: FeedbackFormValues) => {
        try {
            await createFeedbackMutation.mutateAsync({
                input: data,
            });

            setIsOpen(false);
            form.reset();
            toast.success(t("feedback.success.message"));
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast.error(t("feedback.error.message"));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "fixed bottom-4 right-4 z-50 shadow-lg",
                        className,
                    )}
                >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t("feedback.button")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("feedback.title")}</DialogTitle>
                </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("feedback.form.type.label")}
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={t(
                                                            "feedback.form.type.placeholder",
                                                        )}
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="general">
                                                    {t(
                                                        "feedback.form.type.options.general",
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="bug">
                                                    {t("feedback.form.type.options.bug")}
                                                </SelectItem>
                                                <SelectItem value="feature">
                                                    {t(
                                                        "feedback.form.type.options.feature",
                                                    )}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {!user && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("feedback.form.name.label")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={t(
                                                            "feedback.form.name.placeholder",
                                                        )}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("feedback.form.email.label")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={t(
                                                            "feedback.form.email.placeholder",
                                                        )}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("feedback.form.message.label")}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t(
                                                    "feedback.form.message.placeholder",
                                                )}
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                loading={createFeedbackMutation.isPending}
                            >
                                {t("feedback.form.submit")}
                            </Button>
                        </form>
                    </Form>
            </DialogContent>
        </Dialog>
    );
}