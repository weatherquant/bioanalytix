import { FeedbackWidget } from "@modules/shared/components/FeedbackWidget";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <FeedbackWidget />
        </>
    );
}