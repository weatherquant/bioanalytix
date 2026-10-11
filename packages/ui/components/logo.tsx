import { cn } from "../lib";

export function Logo({
        withLabel = true,
        className,
}: {
        className?: string;
        withLabel?: boolean;
}) {
        return (
                <span
                        className={cn(
                                "flex items-center font-semibold leading-none text-foreground",
                                className,
                        )}
                >
                        <img
                                src="/images/bioanalytix-mark-orange-graphite.png"
                                alt=""
                                width={32}
                                height={48}
                                className="h-10 w-auto shrink-0 object-contain"
                        />

                        {withLabel && (
                                <span className="ml-2.5 hidden text-lg md:block">
                                        Bioanalytix
                                </span>
                        )}
                </span>
        );
}
