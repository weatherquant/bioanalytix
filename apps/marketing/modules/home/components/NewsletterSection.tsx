"use client";

import { config } from "@config";
import { Button } from "@repo/ui/components/button";
import { ArrowRightIcon, DnaIcon } from "lucide-react";

export function NewsletterSection() {
	return (
		<section className="py-20 border-t bg-muted/30">
			<div className="container">
				<div className="max-w-3xl mx-auto text-center">
					<div className="size-12 mx-auto flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
						<DnaIcon className="size-6" />
					</div>

					<h2 className="mt-5 text-3xl font-medium lg:text-4xl">
						Your longevity is uncertain. Your planning doesn't have to ignore it.
					</h2>

					<p className="mt-4 max-w-2xl text-base leading-7 mx-auto text-muted-foreground">
						Start with your financial plan for free, or bring your existing genetic data
						into Bioanalytix Individual and begin exploring the longevity questions that
						may matter to your future.
					</p>

					<div className="mt-7 gap-3 flex flex-wrap justify-center">
						<Button size="lg" variant="primary" asChild>
							<a href={`${config.saasUrl}/signup?intent=dna`}>
								Use my DNA
								<ArrowRightIcon className="ml-2 size-4" />
							</a>
						</Button>

						<Button size="lg" variant="secondary" asChild>
							<a href={`${config.saasUrl}/signup`}>Start planning free</a>
						</Button>
					</div>

					<p className="mt-4 text-sm text-muted-foreground">
						Don't have DNA results? A Bioanalytix testing pathway is coming soon.
					</p>
				</div>
			</div>
		</section>
	);
}
