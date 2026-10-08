import type { ReactNode } from "react";

interface BioanalytixPageHeroProps {
	eyebrow: string;
	title: string;
	description: string;
	secondaryDescription?: string;
	visual: ReactNode;
}

export function BioanalytixPageHero({
	eyebrow,
	title,
	description,
	secondaryDescription,
	visual,
}: BioanalytixPageHeroProps) {
	return (
		<section className="border-blue-100/80 bg-blue-50/55 overflow-hidden rounded-3xl border">
			<div className="lg:grid-cols-[1fr_1.05fr] grid items-center">
				<div className="px-8 py-10 md:px-10 md:py-12">
					<div className="font-semibold text-blue-600 text-[11px] tracking-[0.22em] uppercase">
						{eyebrow}
					</div>

					<h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
						{title}
					</h2>

					<p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
						{description}
					</p>

					{secondaryDescription ? (
						<p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
							{secondaryDescription}
						</p>
					) : null}
				</div>

				<div className="px-4 pb-5 lg:px-6 lg:py-5">{visual}</div>
			</div>
		</section>
	);
}
