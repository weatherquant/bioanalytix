// apps/saas/modules/bioanalytix/navigation.ts

import {
	Activity,
	Brain,
	ChartNoAxesCombined,
	CircleUserRound,
	Dna,
	FlaskConical,
	HeartPulse,
	Settings,
} from "lucide-react";

export const bioanalytixNavigation = [
	{
		title: "Overview",
		href: "/overview",
		icon: Activity,
	},
	{
		title: "My DNA",
		href: "/dna",
		icon: Dna,
	},
	{
		title: "Longevity",
		href: "/longevity",
		icon: HeartPulse,
	},
	{
		title: "Wealth",
		href: "/wealth",
		icon: ChartNoAxesCombined,
	},
	{
		title: "Plan",
		href: "/plan",
		icon: CircleUserRound,
	},
	{
		title: "Health",
		href: "/health",
		icon: Brain,
	},
	{
		title: "Research",
		href: "/research",
		icon: FlaskConical,
	},
	{
		title: "Settings",
		href: "/settings",
		icon: Settings,
	},
] as const;
