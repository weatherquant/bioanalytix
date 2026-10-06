import type { PortfolioStrategy } from "../simulation/types";

export type StandardPortfolioStrategyId =
	| "capital_stable"
	| "conservative"
	| "balanced"
	| "growth"
	| "high_growth";

export type PortfolioRiskLevel = "lower" | "low_moderate" | "moderate" | "higher" | "highest";

export interface StandardPortfolioStrategy {
	id: StandardPortfolioStrategyId;

	name: string;

	riskLevel: PortfolioRiskLevel;

	summary: string;

	growthDescription: string;

	defensiveDescription: string;

	cashDescription: string;

	strategy: PortfolioStrategy;
}

function allocation(growth: number, defensive: number, cash: number) {
	return {
		growth,
		defensive,
		cash,
	};
}

/**
 * Broad strategic portfolio choices for consumer planning.
 *
 * These are illustrative asset-allocation alternatives rather
 * than personalised investment recommendations.
 *
 * MVP deliberately avoids automatic retirement derisking.
 * The same strategic allocation is therefore maintained across
 * working, transition and retirement phases.
 *
 * Later product versions may allow users to explore explicit
 * glidepaths as a separate what-if assumption.
 */
export const STANDARD_PORTFOLIO_STRATEGIES: StandardPortfolioStrategy[] = [
	{
		id: "capital_stable",

		name: "Capital Stable",

		riskLevel: "lower",

		summary:
			"Greater emphasis on stability and capital preservation, with lower expected long-term growth.",

		growthDescription:
			"Broadly diversified growth assets, preferably through low-cost passive index exposure.",

		defensiveDescription:
			"A diversified portfolio of high-quality fixed-interest assets intended to reduce overall volatility.",

		cashDescription: "Cash and short-term deposits providing liquidity and stability.",

		strategy: {
			id: "capital_stable",
			name: "Capital Stable",

			workingAllocation: allocation(0.2, 0.65, 0.15),

			transitionAllocation: allocation(0.2, 0.65, 0.15),

			retirementAllocation: allocation(0.2, 0.65, 0.15),

			transitionYearsBeforeRetirement: 0,
		},
	},

	{
		id: "conservative",

		name: "Conservative",

		riskLevel: "low_moderate",

		summary:
			"A stronger emphasis on stability while retaining meaningful exposure to long-term growth.",

		growthDescription:
			"Broadly diversified growth assets, preferably through low-cost passive index exposure.",

		defensiveDescription:
			"A diversified portfolio of high-quality fixed-interest assets providing portfolio stability.",

		cashDescription: "A modest cash allocation supporting liquidity and near-term spending.",

		strategy: {
			id: "conservative",
			name: "Conservative",

			workingAllocation: allocation(0.4, 0.5, 0.1),

			transitionAllocation: allocation(0.4, 0.5, 0.1),

			retirementAllocation: allocation(0.4, 0.5, 0.1),

			transitionYearsBeforeRetirement: 0,
		},
	},

	{
		id: "balanced",

		name: "Balanced",

		riskLevel: "moderate",

		summary:
			"A balance between long-term growth potential and protection from market volatility.",

		growthDescription:
			"Broadly diversified growth assets, preferably through low-cost passive index exposure across Australian and global markets.",

		defensiveDescription:
			"A diversified high-quality fixed-interest portfolio intended to moderate market fluctuations.",

		cashDescription:
			"A small cash allocation providing liquidity without materially reducing long-term growth exposure.",

		strategy: {
			id: "balanced",
			name: "Balanced",

			workingAllocation: allocation(0.6, 0.35, 0.05),

			transitionAllocation: allocation(0.6, 0.35, 0.05),

			retirementAllocation: allocation(0.6, 0.35, 0.05),

			transitionYearsBeforeRetirement: 0,
		},
	},

	{
		id: "growth",

		name: "Growth",

		riskLevel: "higher",

		summary:
			"Higher exposure to long-term growth assets, accepting larger market fluctuations in pursuit of stronger long-term outcomes.",

		growthDescription:
			"A diversified growth portfolio, preferably implemented through low-cost passive index exposure across Australian and global markets.",

		defensiveDescription:
			"A smaller diversified fixed-interest allocation providing some stability during weaker markets.",

		cashDescription:
			"A small liquidity reserve rather than a major long-term investment allocation.",

		strategy: {
			id: "growth",
			name: "Growth",

			workingAllocation: allocation(0.7, 0.25, 0.05),

			transitionAllocation: allocation(0.7, 0.25, 0.05),

			retirementAllocation: allocation(0.7, 0.25, 0.05),

			transitionYearsBeforeRetirement: 0,
		},
	},

	{
		id: "high_growth",

		name: "High Growth",

		riskLevel: "highest",

		summary:
			"Maximum emphasis on long-term growth, with substantially larger short-term portfolio fluctuations.",

		growthDescription:
			"Broadly diversified growth assets, preferably implemented through low-cost passive index exposure rather than concentrated security selection.",

		defensiveDescription:
			"A small high-quality fixed-interest allocation providing limited defensive support.",

		cashDescription: "A small cash reserve for liquidity.",

		strategy: {
			id: "high_growth",
			name: "High Growth",

			workingAllocation: allocation(0.85, 0.1, 0.05),

			transitionAllocation: allocation(0.85, 0.1, 0.05),

			retirementAllocation: allocation(0.85, 0.1, 0.05),

			transitionYearsBeforeRetirement: 0,
		},
	},
];

export function standardPortfolioStrategy(
	id: StandardPortfolioStrategyId,
): StandardPortfolioStrategy {
	const strategy = STANDARD_PORTFOLIO_STRATEGIES.find((candidate) => candidate.id === id);

	if (!strategy) {
		throw new Error(`Unknown standard portfolio strategy: ${id}`);
	}

	return strategy;
}
