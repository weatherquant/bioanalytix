"use client";

import {
	AlertTriangle,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Dna,
	FileUp,
	HeartPulse,
	Info,
	Leaf,
	Loader2,
	ShieldCheck,
	Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type {
	GeneticHighlight,
	GeneticProfile,
	GeneticPlanningRelevanceLevel,
} from "../../../types/genetics";
import { getGeneticProfile, uploadGeneticFile } from "./api";

type PlanningTheme = {
	id: "resilience" | "protection" | "estate";
	title: string;
	status: string;
	description: string;
	domains: string[];
};

function geneticHighlightsFromProfile(profile: GeneticProfile | null): GeneticHighlight[] {
	return profile?.geneticHighlights ?? [];
}

function relevanceForHighlight(highlight: GeneticHighlight) {
	return (
		highlight.planningRelevance ?? {
			level: "informational" as const,

			label: "For your awareness",

			meaning: "This genetic result is part of your Bioanalytix profile.",

			whyItMatters:
				"No specific financial-plan change is suggested from this result at present.",

			planningDomains: [] as string[],

			scenarioEligible: false,
		}
	);
}

function significanceScore(highlight: GeneticHighlight): number {
	const relevance = relevanceForHighlight(highlight);

	if (relevance.level === "material") {
		return 500;
	}

	if (relevance.level === "potential") {
		return 400;
	}

	if (highlight.category === "carrier") {
		return 300;
	}

	if (highlight.direction !== "reference") {
		return 200;
	}

	return 100;
}

function isKeyFinding(highlight: GeneticHighlight): boolean {
	const relevance = relevanceForHighlight(highlight);

	return (
		relevance.level !== "informational" ||
		highlight.category === "carrier" ||
		(highlight.direction !== "reference" && highlight.direction !== "indeterminate")
	);
}

function buildPlanningThemes(highlights: GeneticHighlight[]): PlanningTheme[] {
	const planningSensitiveHighlights = highlights.filter((highlight) => {
		const relevance = relevanceForHighlight(highlight);

		return relevance.level === "potential" || relevance.level === "material";
	});

	const domains = new Set(
		planningSensitiveHighlights.flatMap(
			(highlight) => relevanceForHighlight(highlight).planningDomains,
		),
	);

	const themes: PlanningTheme[] = [];

	const resilienceDomains = [
		"health_costs",
		"healthy_working_life",
		"income_interruption",
		"care_dependency",
		"partner_dependency",
		"longevity",
		"premature_mortality",
	];

	const relevantResilienceDomains = resilienceDomains.filter((domain) => domains.has(domain));

	if (relevantResilienceDomains.length > 0) {
		themes.push({
			id: "resilience",
			title: "Financial resilience",
			status: "Worth exploring",
			description:
				"Your genetic profile makes it worthwhile to test how comfortably your finances could absorb changes to health, care needs, working life or longevity.",
			domains: relevantResilienceDomains,
		});
	}

	if (domains.has("insurance")) {
		themes.push({
			id: "protection",
			title: "Protection & insurance",
			status: "Worth reviewing",
			description:
				"Your results make it reasonable to review whether your current protection still fits your income, responsibilities and the people who depend on you.",
			domains: ["insurance"],
		});
	}

	const estateDomains = ["estate", "family"].filter((domain) => domains.has(domain));

	if (estateDomains.length > 0) {
		themes.push({
			id: "estate",
			title: "Estate & family",
			status: "Worth considering",
			description:
				"Your genetic profile makes it worthwhile to consider whether your estate and family arrangements would still work well if circumstances changed.",
			domains: estateDomains,
		});
	}

	return themes;
}

function categoryLabel(highlight: GeneticHighlight): string {
	const relevance = relevanceForHighlight(highlight);

	if (relevance.level === "material") {
		return "Attention needed";
	}

	if (relevance.level === "potential") {
		return "Worth considering";
	}

	if (highlight.category === "carrier") {
		return "Carrier finding";
	}

	if (highlight.direction === "reference") {
		return "Reference";
	}

	switch (highlight.category) {
		case "ageing_longevity":
			return "Ageing / longevity";

		case "health_risk":
			return "Health finding";

		case "protective":
			return "Potential strength";

		case "trait":
			return "Trait";

		case "pharmacogenomic":
			return "Medication response";

		case "nutrition_metabolism":
			return "Nutrition / metabolism";

		default:
			return "Genetic finding";
	}
}

function shortTitle(highlight: GeneticHighlight): string {
	if (highlight.model.id === "f5-factor-v-leiden-vte") {
		return "Factor V Leiden";
	}

	if (highlight.model.id === "apoe-common-diplotype-v1") {
		return "APOE / Alzheimer susceptibility";
	}

	if (highlight.model.id === "hfe-common-genotype-v1") {
		return "HFE-related haemochromatosis";
	}

	if (highlight.model.id === "serpina1-common-genotype-v1") {
		return "SERPINA1 / alpha-1 antitrypsin";
	}

	return highlight.title;
}

function iconForHighlight(highlight: GeneticHighlight) {
	if (highlight.category === "carrier") {
		return <Users size={20} />;
	}

	if (highlight.category === "ageing_longevity") {
		return <Leaf size={20} />;
	}

	return <HeartPulse size={20} />;
}

export function DnaProfileClient() {
	const inputRef = useRef<HTMLInputElement>(null);

	const [profile, setProfile] = useState<GeneticProfile | null>(null);

	const [loading, setLoading] = useState(true);

	const [uploading, setUploading] = useState(false);

	const [error, setError] = useState<string | null>(null);

	const [expandedId, setExpandedId] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		async function load() {
			try {
				const result = await getGeneticProfile();

				if (active) {
					setProfile(result);
				}
			} catch {
				if (active) {
					setProfile(null);
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		}

		void load();

		return () => {
			active = false;
		};
	}, []);

	async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];

		if (!file) {
			return;
		}

		setUploading(true);
		setError(null);

		try {
			const result = await uploadGeneticFile(file);

			const refreshed = await getGeneticProfile();

			setProfile(refreshed ?? result);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to process your DNA file.");
		} finally {
			setUploading(false);

			if (inputRef.current) {
				inputRef.current.value = "";
			}
		}
	}

	const geneticHighlights = useMemo(() => geneticHighlightsFromProfile(profile), [profile]);

	const sortedHighlights = useMemo(
		() => [...geneticHighlights].sort((a, b) => significanceScore(b) - significanceScore(a)),
		[geneticHighlights],
	);

	const traitFindings = sortedHighlights.filter(
		(highlight) =>
			highlight.category === "trait" || highlight.category === "nutrition_metabolism",
	);

	const standoutFindings = sortedHighlights.filter(
		(highlight) => !traitFindings.includes(highlight) && isKeyFinding(highlight),
	);

	const otherFindings = sortedHighlights.filter(
		(highlight) => !traitFindings.includes(highlight) && !standoutFindings.includes(highlight),
	);

	const attentionCount = geneticHighlights.filter(
		(highlight) =>
			relevanceForHighlight(highlight).level === "potential" ||
			relevanceForHighlight(highlight).level === "material",
	).length;

	const carrierCount = geneticHighlights.filter(
		(highlight) => highlight.category === "carrier",
	).length;

	const traitCount = geneticHighlights.filter(
		(highlight) =>
			highlight.category === "trait" || highlight.category === "nutrition_metabolism",
	).length;

	const planningThemes = useMemo(
		() => buildPlanningThemes(geneticHighlights),
		[geneticHighlights],
	);

	const informationalCount = geneticHighlights.filter(
		(highlight) => relevanceForHighlight(highlight).level === "informational",
	).length;

	if (loading) {
		return (
			<div style={loadingStyle}>
				<Loader2 size={20} className="animate-spin" />

				<span>Loading your DNA profile…</span>
			</div>
		);
	}

	const hasDnaData =
		profile?.upload?.status === "READY" ||
		Boolean(profile?.snps && Object.keys(profile.snps).length > 0);

	if (!hasDnaData) {
		return (
			<div style={emptyCardStyle}>
				<div style={dnaIconStyle}>
					<Dna size={28} strokeWidth={1.7} />
				</div>

				<h2 style={emptyTitleStyle}>Discover what your DNA may reveal</h2>

				<p style={emptyDescriptionStyle}>
					Upload your genetic data to identify health, ageing, carrier and other genetic
					signals that may help inform your longer-term plan.
				</p>

				<input
					ref={inputRef}
					type="file"
					accept=".txt,.csv"
					onChange={handleFile}
					style={{
						display: "none",
					}}
				/>

				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					disabled={uploading}
					style={primaryButtonStyle}
				>
					{uploading ? (
						<Loader2 size={17} className="animate-spin" />
					) : (
						<FileUp size={17} />
					)}

					{uploading ? "Analysing DNA…" : "Upload DNA file"}
				</button>

				{error ? <p style={errorStyle}>{error}</p> : null}

				<div style={privacyStyle}>
					<ShieldCheck size={16} />

					<span>
						Bioanalytix analyses selected genetic markers using its current evidence
						library.
					</span>
				</div>
			</div>
		);
	}

	return (
		<>
			<section style={heroStyle}>
				<div style={heroContentStyle}>
					<div style={eyebrowStyle}>Your DNA. A brighter tomorrow.</div>

					<h1 style={heroTitleStyle}>Your genetics</h1>

					<p style={heroSubtitleStyle}>
						Turning genetic insight into a more informed financial future.
					</p>

					<p style={heroBodyStyle}>
						These results are based on your uploaded DNA data and current scientific
						evidence. They provide useful information about your health profile and,
						where relevant, help us consider potential planning implications.
					</p>
				</div>

				<div style={helixWrapStyle}>
					<DnaHeroGraphic />
				</div>
			</section>

			<section style={snapshotStyle}>
				<div style={snapshotHeaderStyle}>
					<div>
						<div style={snapshotEyebrowStyle}>Your genetic profile</div>

						<h2 style={snapshotTitleStyle}>
							A clearer picture of what makes you, you.
						</h2>

						<p style={snapshotDescriptionStyle}>
							Your results include health, carrier, ageing and personal trait
							findings. Some may be worth considering as you think about your
							longer-term plans; many are simply useful things to know about yourself.
						</p>
					</div>

					<div style={profileConfidenceStyle}>
						<ShieldCheck size={17} />

						<div style={profileConfidenceTextStyle}>
							<strong>Profile analysed</strong>

							<span>{geneticHighlights.length} evidence models interpreted</span>
						</div>
					</div>
				</div>

				<div style={snapshotMetricsStyle}>
					<SnapshotMetric
						value={geneticHighlights.length}
						label="Findings"
						description="Results currently interpreted"
					/>

					<SnapshotMetric
						value={attentionCount}
						label="Worth considering"
						description="May inform future planning"
						emphasis={attentionCount > 0}
					/>

					<SnapshotMetric
						value={carrierCount}
						label="Carrier findings"
						description="Potentially relevant to you or family"
					/>

					<SnapshotMetric
						value={traitCount}
						label="Traits & metabolism"
						description="Personal characteristics"
					/>
				</div>
			</section>

			<section style={sectionStyle}>
				<div style={sectionHeadingStyle}>
					<div style={sectionEyebrowStyle}>What stands out</div>

					<h2 style={sectionTitleStyle}>Results worth knowing about</h2>

					<p style={sectionDescriptionStyle}>
						Health, carrier and other findings that may deserve more of your attention.
					</p>
				</div>

				{standoutFindings.length > 0 ? (
					<div style={findingsStackStyle}>
						{standoutFindings.map((highlight) => (
							<FindingRow
								key={highlight.id}
								highlight={highlight}
								expanded={expandedId === highlight.id}
								onToggle={() =>
									setExpandedId(expandedId === highlight.id ? null : highlight.id)
								}
							/>
						))}
					</div>
				) : (
					<div style={quietPanelStyle}>
						<CheckCircle2 size={20} />

						<div>
							<strong>No planning-sensitive genetic findings identified</strong>

							<p>
								Your current results remain available below and will be reassessed
								as the Bioanalytix evidence library evolves.
							</p>
						</div>
					</div>
				)}
			</section>

			{traitFindings.length > 0 && (
				<section style={sectionStyle}>
					<div style={sectionHeadingStyle}>
						<div style={sectionEyebrowStyle}>More about you</div>

						<h2 style={sectionTitleStyle}>Traits & metabolism</h2>

						<p style={sectionDescriptionStyle}>
							Genetic characteristics that can help you understand some of the ways
							your body may differ from other people.
						</p>
					</div>

					<div style={traitGridStyle}>
						{traitFindings.map((highlight) => (
							<TraitCard
								key={highlight.id}
								highlight={highlight}
								expanded={expandedId === highlight.id}
								onToggle={() =>
									setExpandedId(expandedId === highlight.id ? null : highlight.id)
								}
							/>
						))}
					</div>
				</section>
			)}

			<section style={futureSectionStyle}>
				<div style={sectionHeadingStyle}>
					<div style={sectionEyebrowStyle}>Looking ahead</div>

					<h2 style={sectionTitleStyle}>What this could mean for your future</h2>

					<p style={sectionDescriptionStyle}>
						Genetics can make some planning questions more relevant, but it does not
						determine your financial future.
					</p>
				</div>

				{planningThemes.length > 0 ? (
					<>
						<div style={futureIntroStyle}>
							<div style={futureIntroIconStyle}>
								<ShieldCheck size={20} />
							</div>

							<div>
								<strong>
									Your profile highlights a few areas worth thinking about.
								</strong>

								<p>
									These are not predictions or recommendations to change your
									finances. They are areas where testing your resilience may give
									you useful confidence about the future.
								</p>
							</div>
						</div>

						<div style={planningThemeGridStyle}>
							{planningThemes.map((theme) => (
								<PlanningThemeCard key={theme.id} theme={theme} />
							))}
						</div>
					</>
				) : (
					<>
						<div style={reassurancePanelStyle}>
							<div style={reassuranceIconStyle}>
								<CheckCircle2 size={21} />
							</div>

							<div>
								<strong>
									Your genetics do not currently suggest changing your financial
									plan.
								</strong>

								<p>
									None of the genetic findings currently interpreted by
									Bioanalytix meet the threshold for changing your financial
									planning assumptions. That is useful information: your plan can
									remain focused on the fundamentals.
								</p>
							</div>
						</div>

						<div style={fundamentalsGridStyle}>
							<PlanningFundamentalCard
								title="Financial resilience"
								description="Would your plan remain comfortable if health, care or work circumstances changed?"
							/>

							<PlanningFundamentalCard
								title="Protection"
								description="Is your current protection appropriate for your income, responsibilities and the people who depend on you?"
							/>

							<PlanningFundamentalCard
								title="Estate & family"
								description="Are your estate arrangements clear, current and appropriate for the people important to you?"
							/>
						</div>

						<div style={fundamentalsNoteStyle}>
							Good planning regardless of genetics
						</div>
					</>
				)}
			</section>

			{otherFindings.length > 0 && (
				<section style={sectionStyle}>
					<div style={sectionHeadingStyle}>
						<div style={sectionEyebrowStyle}>Your wider profile</div>

						<h2 style={sectionTitleStyle}>Other genetic results</h2>

						<p style={sectionDescriptionStyle}>
							Reference and informational findings from the genetic models currently
							included in your profile.
						</p>
					</div>

					<div style={findingsStackStyle}>
						{otherFindings.map((highlight) => (
							<FindingRow
								key={highlight.id}
								highlight={highlight}
								expanded={expandedId === highlight.id}
								onToggle={() =>
									setExpandedId(expandedId === highlight.id ? null : highlight.id)
								}
							/>
						))}
					</div>
				</section>
			)}

			<div style={noteStyle}>
				<Info size={19} />

				<div>
					<strong>A note on genetic results</strong>

					<p>
						These results are based on consumer DNA data and current scientific
						evidence. They are not a diagnosis and should not be considered medical
						advice. Genetic risk is only one component of overall health risk.
					</p>
				</div>
			</div>

			<div style={footerHelixStyle}>
				<div style={footerRuleStyle} />

				<Dna size={24} />

				<div style={footerRuleStyle} />
			</div>

			<div style={taglineStyle}>Your DNA today. A brighter tomorrow.</div>

			<div style={profilePanelStyle}>
				<div style={profilePanelHeaderStyle}>
					<div>
						<h2 style={panelTitleStyle}>DNA profile</h2>

						<p style={panelDescriptionStyle}>Your current genetic analysis is ready.</p>
					</div>

					<div style={statusStyle}>
						<CheckCircle2 size={16} />
						Profile analysed
					</div>
				</div>

				<input
					ref={inputRef}
					type="file"
					accept=".txt,.csv"
					onChange={handleFile}
					style={{
						display: "none",
					}}
				/>

				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					disabled={uploading}
					style={secondaryButtonStyle}
				>
					{uploading ? (
						<Loader2 size={16} className="animate-spin" />
					) : (
						<FileUp size={16} />
					)}

					{uploading ? "Analysing DNA…" : "Replace DNA file"}
				</button>

				{error ? <p style={errorStyle}>{error}</p> : null}
			</div>
		</>
	);
}

function DnaHeroGraphic() {
	const width = 760;
	const height = 260;

	const centreY = height / 2;
	const amplitude = 66;
	const cycles = 2.35;

	const pointCount = 90;

	const strandA: Array<{
		x: number;
		y: number;
	}> = [];

	const strandB: Array<{
		x: number;
		y: number;
	}> = [];

	for (let index = 0; index <= pointCount; index += 1) {
		const progress = index / pointCount;

		const x = progress * width;

		const angle = progress * Math.PI * 2 * cycles;

		const yOffset = Math.sin(angle) * amplitude;

		strandA.push({
			x,
			y: centreY + yOffset,
		});

		strandB.push({
			x,
			y: centreY - yOffset,
		});
	}

	function pointsToPath(
		points: Array<{
			x: number;
			y: number;
		}>,
	) {
		return points
			.map(
				(point, index) =>
					`${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
			)
			.join(" ");
	}

	const rungs = Array.from({ length: 23 }, (_, index) => {
		const progress = (index + 1) / 24;

		const angle = progress * Math.PI * 2 * cycles;

		const x = progress * width;

		const offset = Math.sin(angle) * amplitude;

		return {
			x,
			y1: centreY + offset,
			y2: centreY - offset,
			front: Math.cos(angle) > 0,
		};
	});

	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			role="img"
			aria-label="Stylised DNA double helix"
			style={dnaHeroSvgStyle}
			preserveAspectRatio="xMidYMid meet"
		>
			<defs>
				<linearGradient id="bio-dna-strand-a" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0%" stopColor="#7bb6ec" stopOpacity="0" />

					<stop offset="18%" stopColor="#6da9e4" stopOpacity="0.62" />

					<stop offset="52%" stopColor="#6f83ee" stopOpacity="0.82" />

					<stop offset="84%" stopColor="#75aee5" stopOpacity="0.58" />

					<stop offset="100%" stopColor="#7bb6ec" stopOpacity="0" />
				</linearGradient>

				<linearGradient id="bio-dna-strand-b" x1="0" y1="1" x2="1" y2="0">
					<stop offset="0%" stopColor="#8bc7eb" stopOpacity="0" />

					<stop offset="20%" stopColor="#7bbbea" stopOpacity="0.48" />

					<stop offset="50%" stopColor="#9488ee" stopOpacity="0.72" />

					<stop offset="82%" stopColor="#77b9e8" stopOpacity="0.52" />

					<stop offset="100%" stopColor="#8bc7eb" stopOpacity="0" />
				</linearGradient>

				<filter id="bio-dna-soft-glow" x="-20%" y="-20%" width="140%" height="140%">
					<feGaussianBlur stdDeviation="4" result="blur" />

					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>

				<radialGradient id="bio-dna-halo" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stopColor="#cce8fb" stopOpacity="0.45" />

					<stop offset="70%" stopColor="#e8f4fc" stopOpacity="0.12" />

					<stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
				</radialGradient>
			</defs>

			<ellipse cx="390" cy="130" rx="335" ry="112" fill="url(#bio-dna-halo)" />

			{rungs.map((rung, index) => (
				<line
					key={index}
					x1={rung.x}
					y1={rung.y1}
					x2={rung.x}
					y2={rung.y2}
					stroke={rung.front ? "#83a9ea" : "#a7bce9"}
					strokeWidth={rung.front ? 2.5 : 1.6}
					strokeLinecap="round"
					opacity={rung.front ? 0.52 : 0.26}
				/>
			))}

			<path
				d={pointsToPath(strandA)}
				fill="none"
				stroke="url(#bio-dna-strand-a)"
				strokeWidth="7"
				strokeLinecap="round"
				strokeLinejoin="round"
				filter="url(#bio-dna-soft-glow)"
			/>

			<path
				d={pointsToPath(strandB)}
				fill="none"
				stroke="url(#bio-dna-strand-b)"
				strokeWidth="7"
				strokeLinecap="round"
				strokeLinejoin="round"
				filter="url(#bio-dna-soft-glow)"
			/>

			{rungs
				.filter((rung) => rung.front)
				.map((rung, index) => (
					<line
						key={`front-${index}`}
						x1={rung.x}
						y1={rung.y1}
						x2={rung.x}
						y2={rung.y2}
						stroke="#718fe7"
						strokeWidth="2.3"
						strokeLinecap="round"
						opacity="0.46"
					/>
				))}
		</svg>
	);
}

function SnapshotMetric({
	value,
	label,
	description,
	emphasis = false,
}: {
	value: number;
	label: string;
	description: string;
	emphasis?: boolean;
}) {
	return (
		<div style={snapshotMetricStyle(emphasis)}>
			<div style={snapshotMetricValueStyle}>{value}</div>

			<div style={snapshotMetricLabelStyle}>{label}</div>

			<div style={snapshotMetricDescriptionStyle}>{description}</div>
		</div>
	);
}

function PlanningThemeCard({ theme }: { theme: PlanningTheme }) {
	return (
		<div style={planningThemeCardStyle}>
			<div style={planningThemeStatusStyle}>{theme.status}</div>

			<h3 style={planningThemeTitleStyle}>{theme.title}</h3>

			<p style={planningThemeDescriptionStyle}>{theme.description}</p>
		</div>
	);
}

function PlanningFundamentalCard({ title, description }: { title: string; description: string }) {
	return (
		<div style={fundamentalCardStyle}>
			<div style={fundamentalIconStyle}>
				<ShieldCheck size={17} />
			</div>

			<h3 style={fundamentalTitleStyle}>{title}</h3>

			<p style={fundamentalDescriptionStyle}>{description}</p>
		</div>
	);
}

function TraitCard({
	highlight,
	expanded,
	onToggle,
}: {
	highlight: GeneticHighlight;
	expanded: boolean;
	onToggle: () => void;
}) {
	return (
		<div style={traitCardStyle}>
			<div style={traitCardTopStyle}>
				<div style={traitIconStyle}>
					{highlight.category === "nutrition_metabolism" ? (
						<Leaf size={19} />
					) : (
						<Dna size={19} />
					)}
				</div>

				<div style={traitCategoryStyle}>
					{highlight.category === "nutrition_metabolism" ? "Metabolism" : "Trait"}
				</div>
			</div>

			<h3 style={traitTitleStyle}>{shortTitle(highlight)}</h3>

			<p style={traitSummaryStyle}>{highlight.summary}</p>

			<button type="button" onClick={onToggle} style={traitDetailsButtonStyle}>
				{expanded ? "Hide details" : "Learn more"}

				{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
			</button>

			{expanded && (
				<div style={traitExpandedStyle}>
					<p style={detailTextStyle}>{highlight.explanation}</p>

					<div style={traitEvidenceStyle}>
						Evidence: <strong>{highlight.evidenceStrength}</strong>
					</div>
				</div>
			)}
		</div>
	);
}

function FindingRow({
	highlight,
	expanded,
	onToggle,
}: {
	highlight: GeneticHighlight;
	expanded: boolean;
	onToggle: () => void;
}) {
	const relevance = relevanceForHighlight(highlight);

	const uniqueLimitations = [...new Set(highlight.limitations)];

	return (
		<div style={findingCardStyle}>
			<div style={findingRowStyle}>
				<div style={findingIconStyle}>{iconForHighlight(highlight)}</div>

				<div style={findingMainStyle}>
					<div style={findingLabelStyle}>{categoryLabel(highlight)}</div>

					<h3 style={findingTitleStyle}>{shortTitle(highlight)}</h3>

					<p style={findingSummaryStyle}>{highlight.summary}</p>
				</div>

				<div style={findingPlanStyle}>
					<div style={relevanceBadgeStyle(relevance.level)}>{relevance.label}</div>

					<p>{relevance.whyItMatters}</p>
				</div>

				<button type="button" onClick={onToggle} style={detailsButtonStyle}>
					{expanded ? "Hide details" : "View details"}

					{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
				</button>
			</div>

			{expanded && (
				<div style={expandedDetailStyle}>
					<div style={detailGridStyle}>
						<div>
							<div style={detailLabelStyle}>What this means</div>

							<p style={detailTextStyle}>{highlight.explanation}</p>
						</div>

						<div>
							<div style={detailLabelStyle}>Planning context</div>

							<p style={detailTextStyle}>{relevance.meaning}</p>
						</div>
					</div>

					<div style={detailMetaGridStyle}>
						<div>
							<span style={detailLabelStyle}>Evidence</span>

							<strong>{highlight.evidenceStrength}</strong>
						</div>

						<div>
							<span style={detailLabelStyle}>Category</span>

							<strong>{highlight.category.replaceAll("_", " ")}</strong>
						</div>

						<div>
							<span style={detailLabelStyle}>Result</span>

							<strong>{highlight.direction}</strong>
						</div>
					</div>

					{relevance.planningDomains.length > 0 && (
						<div style={planningDomainsStyle}>
							<span style={detailLabelStyle}>Potentially affected areas</span>

							<div style={planningDomainListStyle}>
								{relevance.planningDomains.map((domain) => (
									<span key={domain} style={planningDomainBadgeStyle}>
										{domain.replaceAll("_", " ")}
									</span>
								))}
							</div>
						</div>
					)}

					{relevance.suggestedQuestion && (
						<div style={suggestedQuestionStyle}>
							<div style={detailLabelStyle}>Worth asking</div>

							<strong>{relevance.suggestedQuestion}</strong>
						</div>
					)}

					<details style={limitationsStyle}>
						<summary>Scientific limitations and provenance</summary>

						<ul>
							{uniqueLimitations.map((limitation) => (
								<li key={limitation}>{limitation}</li>
							))}
						</ul>

						<div style={provenanceStyle}>
							Model: {highlight.model.id} v{highlight.model.version}
							{" · "}
							Engine: {highlight.provenance.engineVersion}
						</div>
					</details>
				</div>
			)}
		</div>
	);
}

const loadingStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: 10,
	minHeight: 160,
	color: "#777777",
};

const heroStyle: React.CSSProperties = {
	position: "relative",
	minHeight: 282,
	overflow: "hidden",
	padding: "40px 38px 36px",
	marginBottom: 18,

	background: "linear-gradient(118deg, #f8fbfe 0%, #f4f9fd 47%, #eef7fd 100%)",

	border: "1px solid #dbe7f0",
	borderRadius: 16,

	boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
};

const heroContentStyle: React.CSSProperties = {
	position: "relative",
	zIndex: 2,
	maxWidth: 610,
};

const eyebrowStyle: React.CSSProperties = {
	marginBottom: 10,
	color: "#3478bd",
	fontSize: 11,
	fontWeight: 700,
	letterSpacing: "0.18em",
	textTransform: "uppercase",
};

const heroTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 40,
	lineHeight: "46px",
	fontWeight: 700,
	letterSpacing: "-0.04em",
};

const heroSubtitleStyle: React.CSSProperties = {
	margin: "10px 0 0",
	fontSize: 19,
	lineHeight: "28px",
	color: "#3f5d78",
};

const heroBodyStyle: React.CSSProperties = {
	maxWidth: 570,
	margin: "18px 0 0",
	color: "#647789",
	fontSize: 14,
	lineHeight: "22px",
};

const helixWrapStyle: React.CSSProperties = {
	position: "absolute",
	top: 18,
	right: 18,
	bottom: 14,
	width: "48%",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	pointerEvents: "none",
	overflow: "hidden",
};

const dnaHeroSvgStyle: React.CSSProperties = {
	width: "100%",
	height: "100%",
	display: "block",
	opacity: 0.9,
};

const snapshotStyle: React.CSSProperties = {
	marginBottom: 36,
	padding: "26px 28px",
	background: "#ffffff",
	border: "1px solid #e1e7ec",
	borderRadius: 15,
};

const snapshotHeaderStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	justifyContent: "space-between",
	gap: 36,
	marginBottom: 24,
};

const snapshotEyebrowStyle: React.CSSProperties = {
	marginBottom: 7,
	color: "#3478bd",
	fontSize: 10,
	fontWeight: 750,
	letterSpacing: "0.12em",
	textTransform: "uppercase",
};

const snapshotTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 22,
	lineHeight: "29px",
	fontWeight: 680,
	letterSpacing: "-0.025em",
};

const snapshotDescriptionStyle: React.CSSProperties = {
	maxWidth: 690,
	margin: "8px 0 0",
	color: "#6d7b87",
	fontSize: 13,
	lineHeight: "20px",
};

const profileConfidenceStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	gap: 9,
	flexShrink: 0,
	padding: "10px 13px",
	color: "#53718b",
	background: "#f5f9fc",
	border: "1px solid #deebf4",
	borderRadius: 10,
	fontSize: 11,
};

const snapshotMetricsStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
	borderTop: "1px solid #edf0f2",
};

const sectionEyebrowStyle: React.CSSProperties = {
	marginBottom: 6,
	color: "#3478bd",
	fontSize: 10,
	fontWeight: 750,
	letterSpacing: "0.11em",
	textTransform: "uppercase",
};

const traitGridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
	gap: 12,
};

const traitCardStyle: React.CSSProperties = {
	minHeight: 205,
	padding: 19,
	background: "linear-gradient(145deg, #ffffff 0%, #f8fbfe 100%)",
	border: "1px solid #dfe8ef",
	borderRadius: 13,
};

const traitCardTopStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	marginBottom: 15,
};

const traitIconStyle: React.CSSProperties = {
	width: 36,
	height: 36,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	color: "#477eaa",
	background: "#eef6fc",
	border: "1px solid #d9e9f5",
	borderRadius: 10,
};

const traitCategoryStyle: React.CSSProperties = {
	color: "#7290a8",
	fontSize: 9,
	fontWeight: 750,
	letterSpacing: "0.09em",
	textTransform: "uppercase",
};

const traitTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 15,
	lineHeight: "20px",
	fontWeight: 680,
};

const traitSummaryStyle: React.CSSProperties = {
	minHeight: 48,
	margin: "7px 0 15px",
	color: "#697984",
	fontSize: 11,
	lineHeight: "17px",
};

const traitDetailsButtonStyle: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: 5,
	padding: 0,
	border: 0,
	background: "transparent",
	color: "#3478bd",
	fontSize: 11,
	fontWeight: 650,
	cursor: "pointer",
};

const traitExpandedStyle: React.CSSProperties = {
	marginTop: 14,
	paddingTop: 14,
	borderTop: "1px solid #e5edf3",
};

const traitEvidenceStyle: React.CSSProperties = {
	marginTop: 10,
	color: "#89949d",
	fontSize: 10,
};

function snapshotMetricStyle(emphasis: boolean): React.CSSProperties {
	return {
		minHeight: 112,
		padding: "20px 22px 10px 0",
		borderRight: "1px solid #edf0f2",
		background: emphasis
			? "linear-gradient(180deg, rgba(255,249,232,0.42), transparent)"
			: "transparent",
	};
}

const snapshotMetricValueStyle: React.CSSProperties = {
	fontSize: 30,
	lineHeight: "34px",
	fontWeight: 700,
	letterSpacing: "-0.04em",
};

const snapshotMetricLabelStyle: React.CSSProperties = {
	marginTop: 7,
	fontSize: 12,
	fontWeight: 680,
};

const snapshotMetricDescriptionStyle: React.CSSProperties = {
	marginTop: 4,
	color: "#89949d",
	fontSize: 10,
	lineHeight: "15px",
};

const sectionStyle: React.CSSProperties = {
	marginTop: 32,
};

const sectionHeadingStyle: React.CSSProperties = {
	marginBottom: 14,
};

const sectionTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 22,
	fontWeight: 680,
	letterSpacing: "-0.02em",
};

const sectionDescriptionStyle: React.CSSProperties = {
	margin: "5px 0 0",
	color: "#7b838b",
	fontSize: 13,
};

const findingsStackStyle: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: 10,
};

const findingCardStyle: React.CSSProperties = {
	background: "#ffffff",
	border: "1px solid #e2e6ea",
	borderRadius: 13,
	overflow: "hidden",
};

const findingRowStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "56px minmax(240px, 1fr) minmax(280px, 1.1fr) auto",
	gap: 18,
	alignItems: "center",
	padding: "17px 18px",
};

const findingIconStyle: React.CSSProperties = {
	width: 44,
	height: 44,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	color: "#3478bd",
	background: "#f2f8fe",
	border: "1px solid #dbeaf7",
	borderRadius: 999,
};

const findingMainStyle: React.CSSProperties = {
	minWidth: 0,
};

const findingLabelStyle: React.CSSProperties = {
	color: "#5b7e9f",
	fontSize: 10,
	fontWeight: 750,
	letterSpacing: "0.08em",
	textTransform: "uppercase",
};

const findingTitleStyle: React.CSSProperties = {
	margin: "4px 0 0",
	fontSize: 16,
	fontWeight: 680,
};

const findingSummaryStyle: React.CSSProperties = {
	margin: "4px 0 0",
	color: "#69747e",
	fontSize: 12,
	lineHeight: "18px",
};

const findingPlanStyle: React.CSSProperties = {
	color: "#67737d",
	fontSize: 11,
	lineHeight: "17px",
};

const detailsButtonStyle: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: 6,
	minHeight: 36,
	padding: "0 12px",
	border: "1px solid #cfd9e2",
	borderRadius: 8,
	background: "#ffffff",
	color: "#315c84",
	fontSize: 12,
	fontWeight: 650,
	cursor: "pointer",
	whiteSpace: "nowrap",
};

const expandedDetailStyle: React.CSSProperties = {
	padding: "20px 22px 22px",
	background: "#fbfcfd",
	borderTop: "1px solid #e9edf0",
};

const detailGridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
	gap: 28,
};

const detailMetaGridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
	gap: 12,
	marginTop: 18,
};

const detailLabelStyle: React.CSSProperties = {
	display: "block",
	marginBottom: 5,
	color: "#80909e",
	fontSize: 10,
	fontWeight: 700,
	letterSpacing: "0.06em",
	textTransform: "uppercase",
};

const detailTextStyle: React.CSSProperties = {
	margin: 0,
	color: "#596672",
	fontSize: 12,
	lineHeight: "19px",
};

const planningDomainsStyle: React.CSSProperties = {
	marginTop: 18,
};

const planningDomainListStyle: React.CSSProperties = {
	display: "flex",
	flexWrap: "wrap",
	gap: 6,
};

const planningDomainBadgeStyle: React.CSSProperties = {
	padding: "4px 8px",
	background: "#f3f7fa",
	border: "1px solid #dce5ec",
	borderRadius: 999,
	color: "#597087",
	fontSize: 10,
	textTransform: "capitalize",
};

const suggestedQuestionStyle: React.CSSProperties = {
	marginTop: 18,
	padding: 14,
	background: "#f4f9fd",
	border: "1px solid #dceaf5",
	borderRadius: 9,
	fontSize: 12,
	lineHeight: "19px",
};

const limitationsStyle: React.CSSProperties = {
	marginTop: 18,
	color: "#65727d",
	fontSize: 11,
	lineHeight: "18px",
};

const provenanceStyle: React.CSSProperties = {
	marginTop: 12,
	color: "#8c979f",
	fontSize: 10,
};

function relevanceBadgeStyle(level: GeneticPlanningRelevanceLevel): React.CSSProperties {
	return {
		display: "inline-flex",
		padding: "4px 7px",
		marginBottom: 5,
		borderRadius: 999,
		background:
			level === "material" ? "#fff2f2" : level === "potential" ? "#fff8e7" : "#f3f6f8",
		border:
			level === "material"
				? "1px solid #e9c2c2"
				: level === "potential"
					? "1px solid #ead8aa"
					: "1px solid #dde4e9",
		fontSize: 9,
		fontWeight: 750,
	};
}

const quietPanelStyle: React.CSSProperties = {
	display: "flex",
	gap: 12,
	alignItems: "flex-start",
	padding: 18,
	background: "#f8fbfd",
	border: "1px solid #e1e8ee",
	borderRadius: 12,
	color: "#687884",
	fontSize: 12,
};

const noteStyle: React.CSSProperties = {
	display: "flex",
	gap: 12,
	marginTop: 34,
	padding: 18,
	background: "#f3f8fd",
	border: "1px solid #d9e8f5",
	borderRadius: 12,
	color: "#5c7184",
	fontSize: 12,
	lineHeight: "19px",
};

const footerHelixStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: 16,
	marginTop: 38,
	color: "#3478bd",
};

const footerRuleStyle: React.CSSProperties = {
	flex: 1,
	height: 1,
	background: "linear-gradient(90deg, transparent, #c9dced)",
};

const taglineStyle: React.CSSProperties = {
	marginTop: 10,
	textAlign: "center",
	color: "#728da5",
	fontSize: 9,
	fontWeight: 700,
	letterSpacing: "0.22em",
	textTransform: "uppercase",
};

const emptyCardStyle: React.CSSProperties = {
	minHeight: 440,
	padding: 48,
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	textAlign: "center",
	background: "#ffffff",
	border: "1px solid #e4e4e4",
	borderRadius: 14,
};

const dnaIconStyle: React.CSSProperties = {
	width: 56,
	height: 56,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	marginBottom: 22,
	border: "1px solid #d8e6f1",
	borderRadius: 14,
	background: "#f3f9fe",
	color: "#3478bd",
};

const emptyTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 24,
	fontWeight: 650,
	letterSpacing: "-0.02em",
};

const emptyDescriptionStyle: React.CSSProperties = {
	maxWidth: 570,
	margin: "12px 0 24px",
	color: "#6f6f6f",
	fontSize: 15,
	lineHeight: "24px",
};

const primaryButtonStyle: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: 8,
	minHeight: 42,
	padding: "0 18px",
	border: 0,
	borderRadius: 9,
	background: "#171717",
	color: "#ffffff",
	fontSize: 14,
	fontWeight: 600,
	cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: 8,
	minHeight: 38,
	padding: "0 14px",
	border: "1px solid #dddddd",
	borderRadius: 8,
	background: "#ffffff",
	color: "#333333",
	fontSize: 13,
	cursor: "pointer",
};

const privacyStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: 8,
	maxWidth: 500,
	marginTop: 24,
	color: "#858585",
	fontSize: 12,
	lineHeight: "18px",
};

const errorStyle: React.CSSProperties = {
	marginTop: 14,
	color: "#9f3333",
	fontSize: 13,
};

const profilePanelStyle: React.CSSProperties = {
	marginTop: 28,
	padding: 20,
	background: "#ffffff",
	border: "1px solid #e4e4e4",
	borderRadius: 14,
};

const profilePanelHeaderStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	justifyContent: "space-between",
	gap: 24,
	marginBottom: 18,
};

const panelTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 16,
	fontWeight: 650,
};

const panelDescriptionStyle: React.CSSProperties = {
	margin: "4px 0 0",
	color: "#777777",
	fontSize: 13,
};

const statusStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: 7,
	color: "#555555",
	fontSize: 13,
};

const profileConfidenceTextStyle: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: 2,
};

const futureSectionStyle: React.CSSProperties = {
	marginTop: 42,
	padding: "28px 30px",
	background: "linear-gradient(135deg, #f7fbfe 0%, #ffffff 64%)",
	border: "1px solid #dce8f1",
	borderRadius: 15,
};

const futureIntroStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	gap: 12,
	marginBottom: 20,
	padding: 17,
	background: "#ffffff",
	border: "1px solid #e1e9ef",
	borderRadius: 11,
	color: "#5e6f7d",
	fontSize: 12,
	lineHeight: "19px",
};

const futureIntroIconStyle: React.CSSProperties = {
	width: 36,
	height: 36,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	flexShrink: 0,
	color: "#3478bd",
	background: "#eef6fc",
	borderRadius: 10,
};

const planningThemeGridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
	gap: 12,
};

const planningThemeCardStyle: React.CSSProperties = {
	minHeight: 170,
	padding: 19,
	background: "#ffffff",
	border: "1px solid #dfe7ed",
	borderRadius: 12,
};

const planningThemeStatusStyle: React.CSSProperties = {
	display: "inline-flex",
	marginBottom: 11,
	padding: "4px 8px",
	background: "#fff8e8",
	border: "1px solid #eadbb7",
	borderRadius: 999,
	color: "#725d27",
	fontSize: 9,
	fontWeight: 750,
	letterSpacing: "0.04em",
	textTransform: "uppercase",
};

const planningThemeTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 15,
	fontWeight: 680,
};

const planningThemeDescriptionStyle: React.CSSProperties = {
	margin: "8px 0 0",
	color: "#697985",
	fontSize: 11,
	lineHeight: "18px",
};

const reassurancePanelStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	gap: 13,
	padding: 19,
	background: "#ffffff",
	border: "1px solid #dce7ee",
	borderRadius: 12,
	color: "#5e707e",
	fontSize: 12,
	lineHeight: "19px",
};

const reassuranceIconStyle: React.CSSProperties = {
	width: 38,
	height: 38,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	flexShrink: 0,
	color: "#3f8062",
	background: "#eef8f2",
	border: "1px solid #d8ebdf",
	borderRadius: 999,
};

const fundamentalsGridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
	gap: 12,
	marginTop: 14,
};

const fundamentalCardStyle: React.CSSProperties = {
	minHeight: 152,
	padding: 18,
	background: "#ffffff",
	border: "1px solid #e2e8ed",
	borderRadius: 11,
};

const fundamentalIconStyle: React.CSSProperties = {
	marginBottom: 12,
	color: "#5d7f9c",
};

const fundamentalTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 14,
	fontWeight: 680,
};

const fundamentalDescriptionStyle: React.CSSProperties = {
	margin: "7px 0 0",
	color: "#71808b",
	fontSize: 11,
	lineHeight: "18px",
};

const fundamentalsNoteStyle: React.CSSProperties = {
	marginTop: 12,
	color: "#8b969e",
	fontSize: 9,
	fontWeight: 700,
	letterSpacing: "0.1em",
	textAlign: "right",
	textTransform: "uppercase",
};
