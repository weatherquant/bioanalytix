import { ArrowRight, Brain, ChartNoAxesCombined, Dna, HeartPulse } from "lucide-react";
import Link from "next/link";

import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";

import styles from "../../../../modules/bioanalytix/components/BioanalytixShell.module.css";

const summaryCards = [
	{
		title: "Longevity",
		value: "—",
		description: "Complete your profile to estimate your longevity outlook.",
		href: "/v2/longevity",
		icon: HeartPulse,
	},
	{
		title: "Wealth",
		value: "—",
		description: "See whether your financial plan supports a longer life.",
		href: "/v2/wealth",
		icon: ChartNoAxesCombined,
	},
	{
		title: "Health",
		value: "—",
		description: "Understand the health risks most relevant to your profile.",
		href: "/v2/health",
		icon: Brain,
	},
];

export default function OverviewPage() {
	return (
		<>
			<AppHeader title="Overview" description="Your longevity, wealth and health outlook." />

			<PageShell>
				<section className={styles.hero}>
					<div className={styles.eyebrow}>
						<Dna size={15} />
						<span>Bioanalytix</span>
					</div>

					<h2 className={styles.heroTitle}>Plan for the life you may actually live.</h2>

					<p className={styles.heroDescription}>
						Combine your longevity profile, financial position and genetic insights to
						understand how your retirement plan may need to change.
					</p>
				</section>

				<section className={styles.summaryGrid}>
					{summaryCards.map((card) => {
						const Icon = card.icon;

						return (
							<Link key={card.title} href={card.href} className={styles.summaryCard}>
								<div className={styles.cardTop}>
									<div className={styles.cardIcon}>
										<Icon size={19} strokeWidth={1.8} />
									</div>

									<ArrowRight size={16} />
								</div>

								<div className={styles.cardBody}>
									<div className={styles.cardLabel}>{card.title}</div>

									<div className={styles.cardValue}>{card.value}</div>

									<p className={styles.cardDescription}>{card.description}</p>
								</div>
							</Link>
						);
					})}
				</section>

				<section className={styles.lowerGrid}>
					<div className={styles.panel}>
						<h3 className={styles.panelTitle}>Your plan</h3>

						<p className={styles.panelDescription}>
							Compare your current financial plan with longevity-aware alternatives.
						</p>

						<p className={styles.cardDescription}>
							Your retirement, spending, portfolio and estate assumptions will appear
							here once your profile is connected.
						</p>
					</div>

					<div className={styles.panel}>
						<h3 className={styles.panelTitle}>Next best action</h3>

						<p className={styles.panelDescription}>Build your Bioanalytix profile.</p>

						<Link href="/v2/dna" className={styles.navLink}>
							<Dna size={18} />
							<span>Add your DNA profile</span>
							<ArrowRight size={15} />
						</Link>
					</div>
				</section>
			</PageShell>
		</>
	);
}
