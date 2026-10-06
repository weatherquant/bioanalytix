import type {
	GeneticHighlight,
	GeneticHighlightDirection,
	GeneticProfile,
} from "../../../types/genetics";

export type PerformanceAreaId =
	| "muscle_function"
	| "exercise_response"
	| "metabolism_nutrition"
	| "recovery";

export interface PerformanceAreaDefinition {
	id: PerformanceAreaId;
	label: string;
	description: string;
}

export interface PerformanceFinding {
	id: string;
	area: PerformanceAreaDefinition;
	title: string;
	domain: string;
	category: GeneticHighlight["category"];
	direction: GeneticHighlightDirection;
	evidenceStrength: GeneticHighlight["evidenceStrength"];
	summary: string;
	explanation: string;
	model: GeneticHighlight["model"];
	limitations: string[];
	provenance: GeneticHighlight["provenance"];
}

export interface PerformanceAreaSummary {
	area: PerformanceAreaDefinition;
	findings: PerformanceFinding[];
}

export interface PerformanceProfileSummary {
	modelsInterpreted: number;
	performanceFindings: number;
	establishedOrStrongFindings: number;
	moderateFindings: number;
	limitedOrInsufficientFindings: number;
}

export interface PerformanceProfile {
	hasGeneticData: boolean;
	summary: PerformanceProfileSummary;
	areas: PerformanceAreaSummary[];
	findings: PerformanceFinding[];
	updatedAt?: string | null;
}

const PERFORMANCE_AREAS: Record<PerformanceAreaId, PerformanceAreaDefinition> = {
	muscle_function: {
		id: "muscle_function",
		label: "Muscle function",
		description:
			"Genetic evidence associated with muscle characteristics and physical performance traits.",
	},

	exercise_response: {
		id: "exercise_response",
		label: "Exercise response",
		description:
			"Genetic evidence associated with variation in physiological response to exercise.",
	},

	metabolism_nutrition: {
		id: "metabolism_nutrition",
		label: "Metabolism & nutrition",
		description:
			"Genetic evidence relevant to metabolism, nutrition and factors that may interact with physical performance.",
	},

	recovery: {
		id: "recovery",
		label: "Recovery",
		description: "Genetic evidence potentially relevant to recovery from physical activity.",
	},
};

function performanceAreaForHighlight(
	highlight: GeneticHighlight,
): PerformanceAreaDefinition | null {
	switch (highlight.model.id) {
		case "actn3-muscle-performance-v1":
			return PERFORMANCE_AREAS.muscle_function;

		default:
			return null;
	}
}

function toPerformanceFinding(
	highlight: GeneticHighlight,
	area: PerformanceAreaDefinition,
): PerformanceFinding {
	return {
		id: highlight.id,
		area,
		title: highlight.title,
		domain: highlight.domain,
		category: highlight.category,
		direction: highlight.direction,
		evidenceStrength: highlight.evidenceStrength,
		summary: highlight.summary,
		explanation: highlight.explanation,
		model: highlight.model,
		limitations: Array.from(new Set<string>(highlight.limitations)),
		provenance: highlight.provenance,
	};
}

export function buildPerformanceProfile(profile: GeneticProfile | null): PerformanceProfile {
	const hasGeneticData =
		profile?.upload?.status === "READY" ||
		Boolean(profile?.snps && Object.keys(profile.snps).length > 0);

	const highlights: GeneticHighlight[] = profile?.geneticHighlights ?? [];

	const findings = highlights.flatMap((highlight: GeneticHighlight): PerformanceFinding[] => {
		const area = performanceAreaForHighlight(highlight);

		return area ? [toPerformanceFinding(highlight, area)] : [];
	});

	const areaOrder: PerformanceAreaId[] = [
		"muscle_function",
		"exercise_response",
		"metabolism_nutrition",
		"recovery",
	];

	const areas: PerformanceAreaSummary[] = areaOrder
		.map((areaId): PerformanceAreaSummary => {
			const area = PERFORMANCE_AREAS[areaId];

			return {
				area,
				findings: findings.filter((finding) => finding.area.id === areaId),
			};
		})
		.filter((area) => area.findings.length > 0);

	return {
		hasGeneticData,

		summary: {
			modelsInterpreted: highlights.length,
			performanceFindings: findings.length,
			establishedOrStrongFindings: findings.filter(
				(finding) =>
					finding.evidenceStrength === "established" ||
					finding.evidenceStrength === "strong",
			).length,
			moderateFindings: findings.filter((finding) => finding.evidenceStrength === "moderate")
				.length,
			limitedOrInsufficientFindings: findings.filter(
				(finding) =>
					finding.evidenceStrength === "limited" ||
					finding.evidenceStrength === "insufficient",
			).length,
		},

		areas,
		findings,
		updatedAt: profile?.updatedAt ?? null,
	};
}
