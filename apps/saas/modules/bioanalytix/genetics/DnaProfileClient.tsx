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
		highlight.direction !== "reference"
	);
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

	const keyFindings = sortedHighlights.filter(isKeyFinding);

	const otherFindings = sortedHighlights.filter((highlight) => !isKeyFinding(highlight));

	const attentionCount = geneticHighlights.filter(
		(highlight) =>
			relevanceForHighlight(highlight).level === "potential" ||
			relevanceForHighlight(highlight).level === "material",
	).length;

	const carrierCount = geneticHighlights.filter(
		(highlight) => highlight.category === "carrier",
	).length;

	const healthCount = geneticHighlights.filter(
		(highlight) => highlight.category === "health_risk",
	).length;

	const ageingCount = geneticHighlights.filter(
		(highlight) => highlight.category === "ageing_longevity",
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

			<div style={metricsGridStyle}>
				<MetricCard
					value={geneticHighlights.length}
					title="Genetic findings"
					description={`From ${geneticHighlights.length} evaluated models`}
					icon={<Dna size={22} />}
				/>

				<MetricCard
					value={attentionCount}
					title="Attention needed"
					description="Findings that may warrant planning consideration"
					icon={<AlertTriangle size={22} />}
				/>

				<MetricCard
					value={carrierCount}
					title="Carrier findings"
					description="Useful information for you and your family"
					icon={<Users size={22} />}
				/>

				<MetricCard
					value={healthCount}
					title="Health findings"
					description="Health-related genetic results"
					icon={<HeartPulse size={22} />}
				/>

				<MetricCard
					value={ageingCount}
					title="Ageing / longevity"
					description="Ageing-related genetic findings"
					icon={<Leaf size={22} />}
				/>
			</div>

			<section style={sectionStyle}>
				<div style={sectionHeadingStyle}>
					<h2 style={sectionTitleStyle}>Key findings</h2>

					<p style={sectionDescriptionStyle}>
						Your most relevant results, ordered by potential significance.
					</p>
				</div>

				{keyFindings.length > 0 ? (
					<div style={findingsStackStyle}>
						{keyFindings.map((highlight) => (
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

			{otherFindings.length > 0 && (
				<section style={sectionStyle}>
					<div style={sectionHeadingStyle}>
						<h2 style={sectionTitleStyle}>Other findings</h2>

						<p style={sectionDescriptionStyle}>
							Additional results from your genetic analysis, listed for completeness.
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

function MetricCard({
	value,
	title,
	description,
	icon,
}: {
	value: number;
	title: string;
	description: string;
	icon: React.ReactNode;
}) {
	return (
		<div style={metricCardStyle}>
			<div style={metricTopStyle}>
				<div style={metricValueStyle}>{value}</div>

				<div style={metricIconStyle}>{icon}</div>
			</div>

			<div style={metricTitleStyle}>{title}</div>

			<div style={metricDescriptionStyle}>{description}</div>
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

const metricsGridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
	gap: 12,
	marginBottom: 34,
};

const metricCardStyle: React.CSSProperties = {
	minHeight: 142,
	padding: 18,
	background: "#ffffff",
	border: "1px solid #e2e7ec",
	borderRadius: 13,
};

const metricTopStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	justifyContent: "space-between",
};

const metricValueStyle: React.CSSProperties = {
	fontSize: 30,
	fontWeight: 700,
	letterSpacing: "-0.03em",
};

const metricIconStyle: React.CSSProperties = {
	color: "#3478bd",
};

const metricTitleStyle: React.CSSProperties = {
	marginTop: 17,
	fontSize: 13,
	fontWeight: 650,
};

const metricDescriptionStyle: React.CSSProperties = {
	marginTop: 6,
	color: "#7a8792",
	fontSize: 11,
	lineHeight: "17px",
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
