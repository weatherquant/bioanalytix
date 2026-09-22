import type {
	GeneticHighlight,
	GeneticHighlightDirection,
	GeneticProfile,
	GeneticPlanningRelevance,
} from "../../../types/genetics";

export type HealthAreaId =
	| "cardiovascular"
	| "metabolic"
	| "neurological"
	| "cancer"
	| "blood_clotting"
	| "vision"
	| "respiratory"
	| "other";

export interface HealthAreaDefinition {
	id: HealthAreaId;
	label: string;
	description: string;
}

export interface HealthFinding {
	id: string;
	area: HealthAreaDefinition;
	title: string;
	domain: string;
	category: GeneticHighlight["category"];
	direction: GeneticHighlightDirection;
	evidenceStrength: GeneticHighlight["evidenceStrength"];
	summary: string;
	explanation: string;
	planningRelevance: GeneticPlanningRelevance;
	model: GeneticHighlight["model"];
	limitations: string[];
	provenance: GeneticHighlight["provenance"];
}

export interface HealthAreaSummary {
	area: HealthAreaDefinition;
	findings: HealthFinding[];
	attentionCount: number;
	referenceCount: number;
	indeterminateCount: number;
}

export interface HealthProfileSummary {
	modelsInterpreted: number;
	healthFindings: number;
	attentionFindings: number;
	referenceFindings: number;
	indeterminateFindings: number;
}

export interface HealthProfile {
	hasGeneticData: boolean;
	summary: HealthProfileSummary;
	areas: HealthAreaSummary[];
	findings: HealthFinding[];
	updatedAt?: string | null;
}

const HEALTH_AREAS: Record<HealthAreaId, HealthAreaDefinition> = {
	cardiovascular: {
		id: "cardiovascular",
		label: "Heart & circulation",
		description:
			"Genetic findings relevant to cardiovascular health, cholesterol and related conditions.",
	},
	metabolic: {
		id: "metabolic",
		label: "Metabolic health",
		description:
			"Genetic findings relevant to glucose regulation, metabolism and related health conditions.",
	},
	neurological: {
		id: "neurological",
		label: "Brain & neurological health",
		description: "Genetic findings associated with neurological health and susceptibility.",
	},
	cancer: {
		id: "cancer",
		label: "Cancer susceptibility",
		description:
			"Selected genetic findings associated with inherited or increased cancer susceptibility.",
	},
	blood_clotting: {
		id: "blood_clotting",
		label: "Blood & clotting",
		description:
			"Genetic findings relevant to blood clotting and related inherited conditions.",
	},
	vision: {
		id: "vision",
		label: "Vision",
		description:
			"Genetic findings associated with eye health and susceptibility to selected conditions.",
	},
	respiratory: {
		id: "respiratory",
		label: "Lung & respiratory health",
		description:
			"Genetic findings relevant to respiratory health and selected inherited conditions.",
	},
	other: {
		id: "other",
		label: "Other health findings",
		description: "Other health-related genetic findings currently interpreted by Bioanalytix.",
	},
};

const HEALTH_CATEGORIES = new Set<GeneticHighlight["category"]>([
	"health_risk",
	"protective",
	"pharmacogenomic",
	"ageing_longevity",
]);

function healthAreaForHighlight(highlight: GeneticHighlight): HealthAreaDefinition {
	const searchable = [highlight.model.id, highlight.domain, highlight.title]
		.join(" ")
		.toLowerCase();

	if (
		searchable.includes("lpa") ||
		searchable.includes("apob") ||
		searchable.includes("cardio") ||
		searchable.includes("cholesterol") ||
		searchable.includes("hyperchol")
	) {
		return HEALTH_AREAS.cardiovascular;
	}

	if (
		searchable.includes("tcf7l2") ||
		searchable.includes("diabetes") ||
		searchable.includes("metabolic")
	) {
		return HEALTH_AREAS.metabolic;
	}

	if (
		searchable.includes("apoe") ||
		searchable.includes("lrrk2") ||
		searchable.includes("alzheimer") ||
		searchable.includes("parkinson") ||
		searchable.includes("neuro")
	) {
		return HEALTH_AREAS.neurological;
	}

	if (
		searchable.includes("brca") ||
		searchable.includes("mutyh") ||
		searchable.includes("cancer") ||
		searchable.includes("polyposis")
	) {
		return HEALTH_AREAS.cancer;
	}

	if (
		searchable.includes("factor-v") ||
		searchable.includes("factor v") ||
		searchable.includes("prothrombin") ||
		searchable.includes("f2-") ||
		searchable.includes("thromb") ||
		searchable.includes("clot")
	) {
		return HEALTH_AREAS.blood_clotting;
	}

	if (
		searchable.includes("amd") ||
		searchable.includes("macular") ||
		searchable.includes("vision") ||
		searchable.includes("eye")
	) {
		return HEALTH_AREAS.vision;
	}

	if (
		searchable.includes("serpina1") ||
		searchable.includes("antitrypsin") ||
		searchable.includes("respiratory") ||
		searchable.includes("lung")
	) {
		return HEALTH_AREAS.respiratory;
	}

	return HEALTH_AREAS.other;
}

function isHealthFinding(highlight: GeneticHighlight): boolean {
	return HEALTH_CATEGORIES.has(highlight.category) || highlight.category === "carrier";
}

function isAttentionFinding(finding: HealthFinding): boolean {
	return (
		finding.planningRelevance.level === "potential" ||
		finding.planningRelevance.level === "material" ||
		finding.category === "carrier" ||
		(finding.direction !== "reference" && finding.direction !== "indeterminate")
	);
}

function attentionRank(highlight: GeneticHighlight): number {
	if (highlight.planningRelevance.level === "material") {
		return 500;
	}

	if (highlight.planningRelevance.level === "potential") {
		return 400;
	}

	if (highlight.category === "carrier") {
		return 300;
	}

	if (highlight.direction !== "reference" && highlight.direction !== "indeterminate") {
		return 200;
	}

	if (highlight.direction === "reference") {
		return 100;
	}

	return 50;
}

function toHealthFinding(highlight: GeneticHighlight): HealthFinding {
	return {
		id: highlight.id,
		area: healthAreaForHighlight(highlight),
		title: highlight.title,
		domain: highlight.domain,
		category: highlight.category,
		direction: highlight.direction,
		evidenceStrength: highlight.evidenceStrength,
		summary: highlight.summary,
		explanation: highlight.explanation,
		planningRelevance: highlight.planningRelevance,
		model: highlight.model,
		limitations: Array.from(new Set<string>(highlight.limitations)),
		provenance: highlight.provenance,
	};
}

export function buildHealthProfile(profile: GeneticProfile | null): HealthProfile {
	const hasGeneticData =
		profile?.upload?.status === "READY" ||
		Boolean(profile?.snps && Object.keys(profile.snps).length > 0);

	const highlights: GeneticHighlight[] = profile?.geneticHighlights ?? [];

	const healthHighlights: GeneticHighlight[] = highlights
		.filter((highlight: GeneticHighlight) => isHealthFinding(highlight))
		.sort((a: GeneticHighlight, b: GeneticHighlight) => attentionRank(b) - attentionRank(a));

	const findings: HealthFinding[] = healthHighlights.map(toHealthFinding);

	const areaOrder: HealthAreaId[] = [
		"cardiovascular",
		"metabolic",
		"neurological",
		"cancer",
		"blood_clotting",
		"vision",
		"respiratory",
		"other",
	];

	const areas: HealthAreaSummary[] = areaOrder
		.map((areaId: HealthAreaId): HealthAreaSummary => {
			const area = HEALTH_AREAS[areaId];

			const areaFindings: HealthFinding[] = findings.filter(
				(finding: HealthFinding) => finding.area.id === areaId,
			);

			return {
				area,
				findings: areaFindings,
				attentionCount: areaFindings.filter(isAttentionFinding).length,
				referenceCount: areaFindings.filter(
					(finding: HealthFinding) => finding.direction === "reference",
				).length,
				indeterminateCount: areaFindings.filter(
					(finding: HealthFinding) => finding.direction === "indeterminate",
				).length,
			};
		})
		.filter((area: HealthAreaSummary) => area.findings.length > 0);

	return {
		hasGeneticData,

		summary: {
			modelsInterpreted: highlights.length,
			healthFindings: findings.length,
			attentionFindings: findings.filter(isAttentionFinding).length,
			referenceFindings: findings.filter(
				(finding: HealthFinding) => finding.direction === "reference",
			).length,
			indeterminateFindings: findings.filter(
				(finding: HealthFinding) => finding.direction === "indeterminate",
			).length,
		},

		areas,
		findings,
		updatedAt: profile?.updatedAt,
	};
}
