"use client";

import {
	Activity,
	Brain,
	ChartNoAxesCombined,
	CircleUserRound,
	Dna,
	FlaskConical,
	HeartPulse,
	Landmark,
	Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./BioanalytixShell.module.css";

const navigation = [
	{
		title: "Overview",
		href: "/v2/overview",
		icon: Activity,
	},
	{
		title: "My DNA",
		href: "/v2/dna",
		icon: Dna,
	},
	{
		title: "Longevity",
		href: "/v2/longevity",
		icon: HeartPulse,
	},
	{
		title: "Wealth",
		href: "/v2/wealth",
		icon: ChartNoAxesCombined,
	},
	{
		title: "Plan",
		href: "/v2/plan",
		icon: CircleUserRound,
	},
	{
		title: "Health",
		href: "/v2/health",
		icon: Brain,
	},
	{
		title: "Estate",
		href: "/v2/estate",
		icon: Landmark,
	},
	{
		title: "Research",
		href: "/v2/research",
		icon: FlaskConical,
	},
] as const;

export function AppSidebar() {
	const pathname = usePathname();

	return (
		<aside className={styles.sidebar}>
			<div className={styles.brand}>
				<Link href="/v2/overview" className={styles.brandLink}>
					<div className={styles.brandIcon}>
						<Dna size={18} />
					</div>

					<div>
						<p className={styles.brandName}>BIOANALYTIX</p>
						<p className={styles.brandDescription}>Longevity intelligence</p>
					</div>
				</Link>
			</div>

			<nav className={styles.navigation}>
				{navigation.map((item) => {
					const Icon = item.icon;

					const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

					return (
						<Link
							key={item.href}
							href={item.href}
							className={[styles.navLink, active ? styles.navLinkActive : ""].join(
								" ",
							)}
						>
							<Icon size={18} strokeWidth={1.8} />
							<span>{item.title}</span>
						</Link>
					);
				})}
			</nav>

			<div className={styles.sidebarFooter}>
				<Link href="/settings/general" className={styles.navLink}>
					<Settings size={18} strokeWidth={1.8} />
					<span>Settings</span>
				</Link>
			</div>
		</aside>
	);
}
