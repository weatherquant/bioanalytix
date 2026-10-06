"use client";

import {
	Activity,
	Brain,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Dna,
	Eye,
	HeartPulse,
	Info,
	Loader2,
	ShieldCheck,
	Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { GeneticProfile } from "../../../types/genetics";
import { getGeneticProfile } from "../genetics/api";
import {
	buildHealthProfile,
	type HealthAreaId,
	type HealthAreaSummary,
	type HealthFinding,
} from "./healthProfile";

function areaIcon(area: HealthAreaId) {
	switch (area) {
		case "cardiovascular":
			return <HeartPulse size={20} />;

		case "metabolic":
			return <Activity size={20} />;

		case "neurological":
			return <Brain size={20} />;

		case "vision":
			return <Eye size={20} />;

		default:
			return <ShieldCheck size={20} />;
	}
}

function findingStatus(finding: HealthFinding): string {
	if (finding.planningRelevance.level === "material") {
		return "Worth attention";
	}

	if (finding.planningRelevance.level === "potential") {
		return "Worth understanding";
	}

	if (finding.category === "carrier") {
		return "Carrier finding";
	}

	if (finding.direction !== "reference" && finding.direction !== "indeterminate") {
		return "Finding identified";
	}

	if (finding.direction === "indeterminate") {
		return "Unable to determine";
	}

	return "Reference finding";
}

function isAttentionFinding(finding: HealthFinding): boolean {
	return (
		finding.planningRelevance.level === "potential" ||
		finding.planningRelevance.level === "material" ||
		finding.category === "carrier" ||
		(finding.direction !== "reference" && finding.direction !== "indeterminate")
	);
}

export function HealthProfileClient() {
	const [geneticProfile, setGeneticProfile] = useState<GeneticProfile | null>(null);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [expandedId, setExpandedId] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		async function load() {
			try {
				const profile = await getGeneticProfile();

				if (active) {
					setGeneticProfile(profile);
				}
			} catch {
				if (active) {
					setError("Unable to load your health profile.");
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

	const profile = useMemo(() => buildHealthProfile(geneticProfile), [geneticProfile]);

	const attentionFindings = useMemo(
		() => profile.findings.filter(isAttentionFinding),
		[profile.findings],
	);

	const quieterFindings = useMemo(
		() => profile.findings.filter((finding) => !isAttentionFinding(finding)),
		[profile.findings],
	);

	if (loading) {
		return (
			<div style={loadingStyle}>
				<Loader2 size={20} className="animate-spin" />
				<span>Building your health profile...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div style={messagePanelStyle}>
				<Info size={20} />

				<div>
					<strong>We couldn't load your health profile.</strong>
					<p>{error}</p>
				</div>
			</div>
		);
	}

	if (!profile.hasGeneticData) {
		return (
			<div style={emptyStyle}>
				<div style={emptyIconStyle}>
					<Dna size={28} />
				</div>

				<h2 style={emptyTitleStyle}>Start with what you know about yourself</h2>

				<p style={emptyDescriptionStyle}>
					Your Health profile will bring together genetic findings and other health
					information you choose to provide. Uploading DNA can add genetic evidence to
					this picture.
				</p>

				<div style={emptyNoteStyle}>
					Health is broader than genetics. Future versions will also let you add factors
					such as height, weight, smoking, family history and selected health
					measurements.
				</div>
			</div>
		);
	}

	return (
		<>
			<section style={heroStyle}>
				<div style={heroCopyStyle}>
					<div style={eyebrowStyle}>Your health profile</div>

					<h1 style={heroTitleStyle}>What might be worth paying attention to?</h1>

					<p style={heroDescriptionStyle}>
						Your health is shaped by many things. Bioanalytix starts with the evidence
						available in your DNA profile and helps separate findings worth
						understanding from results that are simply informational.
					</p>
				</div>

				<div style={heroGraphicStyle}>
					<div style={heroOrbOuterStyle}>
						<div style={heroOrbMiddleStyle}>
							<div style={heroOrbInnerStyle}>
								<HeartPulse size={32} />
							</div>
						</div>
					</div>
				</div>
			</section>

			<section style={snapshotStyle}>
				<div style={snapshotHeaderStyle}>
					<div>
						<div style={sectionEyebrowStyle}>Current picture</div>

						<h2 style={snapshotTitleStyle}>Your health evidence at a glance</h2>

						<p style={snapshotDescriptionStyle}>
							These counts organise the genetic evidence currently available to
							Bioanalytix. They are not a health score or a prediction of disease.
						</p>
					</div>

					<div style={analysedBadgeStyle}>
						<ShieldCheck size={17} />

						<div>
							<strong>Evidence assessed</strong>
							<span>{profile.summary.modelsInterpreted} genetic models</span>
						</div>
					</div>
				</div>

				<div style={metricsStyle}>
					<Metric
						value={profile.summary.healthFindings}
						label="Health findings"
						description="Health-relevant results assessed"
					/>

					<Metric
						value={profile.summary.attentionFindings}
						label="Worth understanding"
						description="Signals that may deserve attention"
						emphasis={profile.summary.attentionFindings > 0}
					/>

					<Metric
						value={profile.summary.referenceFindings}
						label="Reference findings"
						description="Results in the reference direction"
					/>

					<Metric
						value={profile.areas.length}
						label="Health areas"
						description="Areas represented in your profile"
					/>
				</div>
			</section>

			<section style={sectionStyle}>
				<div style={sectionHeadingStyle}>
					<div style={sectionEyebrowStyle}>What stands out</div>

					<h2 style={sectionTitleStyle}>Findings worth understanding</h2>

					<p style={sectionDescriptionStyle}>
						These findings may be useful to understand in the context of your wider
						health. A genetic association is not a diagnosis and does not, by itself,
						tell us your personal probability of developing a condition.
					</p>
				</div>

				{attentionFindings.length > 0 ? (
					<div style={findingStackStyle}>
						{attentionFindings.map((finding) => (
							<HealthFindingCard
								key={finding.id}
								finding={finding}
								expanded={expandedId === finding.id}
								onToggle={() =>
									setExpandedId(expandedId === finding.id ? null : finding.id)
								}
							/>
						))}
					</div>
				) : (
					<div style={reassuranceStyle}>
						<CheckCircle2 size={21} />

						<div>
							<strong>
								No elevated health signals are highlighted in the current genetic
								evidence.
							</strong>

							<p>
								That does not mean there is no health risk. Genetics is only one
								part of overall health, and Bioanalytix has assessed only the models
								currently included in its evidence library.
							</p>
						</div>
					</div>
				)}
			</section>

			<section style={sectionStyle}>
				<div style={sectionHeadingStyle}>
					<div style={sectionEyebrowStyle}>Your health landscape</div>

					<h2 style={sectionTitleStyle}>Areas represented in your profile</h2>

					<p style={sectionDescriptionStyle}>
						A simple way to see where your current genetic evidence sits without
						reducing different kinds of evidence to a single score.
					</p>
				</div>

				<div style={areaGridStyle}>
					{profile.areas.map((area) => (
						<HealthAreaCard key={area.area.id} area={area} />
					))}
				</div>
			</section>

			<section style={factorsStyle}>
				<div style={factorsHeaderStyle}>
					<div>
						<div style={sectionEyebrowStyle}>Beyond your DNA</div>

						<h2 style={sectionTitleStyle}>My health factors</h2>

						<p style={sectionDescriptionStyle}>
							Genetics is only part of your health picture. Bioanalytix will
							progressively combine genetic evidence with information you choose to
							provide.
						</p>
					</div>

					<div style={comingSoonStyle}>Next step</div>
				</div>

				<div style={factorGridStyle}>
					<FactorCard
						title="Body & age"
						description="Age, sex, height and weight can provide important context for appropriate health models."
					/>

					<FactorCard
						title="Lifestyle"
						description="Smoking and other relevant lifestyle factors can materially affect some health risks."
					/>

					<FactorCard
						title="Family history"
						description="Family history can add information that is not captured by a consumer DNA file alone."
					/>

					<FactorCard
						title="Measurements"
						description="Blood pressure, cholesterol and selected biomarkers can later support validated risk models."
					/>
				</div>

				<div style={factorRuleStyle}>
					<Sparkles size={17} />

					<span>
						These factors will only be used where an appropriate model explicitly
						supports them. Bioanalytix will not combine them into an invented health
						score.
					</span>
				</div>
			</section>

			{quieterFindings.length > 0 && (
				<section style={sectionStyle}>
					<div style={sectionHeadingStyle}>
						<div style={sectionEyebrowStyle}>Wider evidence</div>

						<h2 style={sectionTitleStyle}>Other health findings</h2>

						<p style={sectionDescriptionStyle}>
							Reference and informational findings remain available so you can see the
							broader evidence assessed.
						</p>
					</div>

					<div style={findingStackStyle}>
						{quieterFindings.map((finding) => (
							<HealthFindingCard
								key={finding.id}
								finding={finding}
								expanded={expandedId === finding.id}
								onToggle={() =>
									setExpandedId(expandedId === finding.id ? null : finding.id)
								}
							/>
						))}
					</div>
				</section>
			)}

			<div style={disclosureStyle}>
				<Info size={18} />

				<div>
					<strong>About your Health profile</strong>

					<p>
						Bioanalytix uses selected genetic evidence to help you understand areas that
						may be worth exploring. Genetic associations are not diagnoses, and genetic
						information is only one component of overall health risk. This information
						is not medical advice.
					</p>
				</div>
			</div>
		</>
	);
}

function Metric({
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
		<div style={metricStyle(emphasis)}>
			<div style={metricValueStyle}>{value}</div>
			<div style={metricLabelStyle}>{label}</div>
			<div style={metricDescriptionStyle}>{description}</div>
		</div>
	);
}

function HealthAreaCard({ area }: { area: HealthAreaSummary }) {
	return (
		<div style={areaCardStyle}>
			<div style={areaIconStyle}>{areaIcon(area.area.id)}</div>

			<div style={areaCardContentStyle}>
				<h3 style={areaTitleStyle}>{area.area.label}</h3>

				<p style={areaDescriptionStyle}>{area.area.description}</p>

				<div style={areaMetaStyle}>
					<span>
						<strong>{area.findings.length}</strong>{" "}
						{area.findings.length === 1 ? "finding" : "findings"}
					</span>

					{area.attentionCount > 0 ? (
						<span style={attentionTextStyle}>
							{area.attentionCount} worth understanding
						</span>
					) : area.referenceCount > 0 ? (
						<span>{area.referenceCount} reference</span>
					) : area.indeterminateCount > 0 ? (
						<span>{area.indeterminateCount} indeterminate</span>
					) : null}
				</div>
			</div>
		</div>
	);
}

function HealthFindingCard({
	finding,
	expanded,
	onToggle,
}: {
	finding: HealthFinding;
	expanded: boolean;
	onToggle: () => void;
}) {
	return (
		<div style={findingCardStyle}>
			<div style={findingTopStyle}>
				<div style={findingIconStyle}>{areaIcon(finding.area.id)}</div>

				<div style={findingMainStyle}>
					<div style={findingAreaStyle}>{finding.area.label}</div>

					<h3 style={findingTitleStyle}>{finding.title}</h3>

					<p style={findingSummaryStyle}>{finding.summary}</p>
				</div>

				<div style={findingStatusWrapStyle}>
					<div style={findingStatusStyle(isAttentionFinding(finding))}>
						{findingStatus(finding)}
					</div>

					<span style={evidenceStyle}>{finding.evidenceStrength} evidence</span>
				</div>

				<button type="button" onClick={onToggle} style={detailsButtonStyle}>
					{expanded ? "Hide details" : "Understand"}

					{expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
				</button>
			</div>

			{expanded && (
				<div style={expandedStyle}>
					<div style={detailGridStyle}>
						<div>
							<div style={detailLabelStyle}>What the evidence says</div>

							<p style={detailTextStyle}>{finding.explanation}</p>
						</div>

						<div>
							<div style={detailLabelStyle}>What this means for planning</div>

							<p style={detailTextStyle}>{finding.planningRelevance.whyItMatters}</p>
						</div>
					</div>

					<div style={detailMetaStyle}>
						<div>
							<span style={detailLabelStyle}>Result</span>
							<strong>{finding.direction}</strong>
						</div>

						<div>
							<span style={detailLabelStyle}>Evidence</span>
							<strong>{finding.evidenceStrength}</strong>
						</div>

						<div>
							<span style={detailLabelStyle}>Model</span>
							<strong>{finding.model.id}</strong>
						</div>
					</div>

					{finding.planningRelevance.suggestedQuestion ? (
						<div style={questionStyle}>
							<div style={detailLabelStyle}>A question worth exploring</div>

							<strong>{finding.planningRelevance.suggestedQuestion}</strong>
						</div>
					) : null}

					{finding.limitations.length > 0 ? (
						<details style={limitationsStyle}>
							<summary>Scientific limitations</summary>

							<ul>
								{finding.limitations.map((limitation) => (
									<li key={limitation}>{limitation}</li>
								))}
							</ul>
						</details>
					) : null}
				</div>
			)}
		</div>
	);
}

function FactorCard({ title, description }: { title: string; description: string }) {
	return (
		<div style={factorCardStyle}>
			<div style={factorDotStyle} />

			<h3 style={factorTitleStyle}>{title}</h3>

			<p style={factorDescriptionStyle}>{description}</p>
		</div>
	);
}

const loadingStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: 10,
	minHeight: 180,
	color: "#727d86",
};

const messagePanelStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	gap: 12,
	padding: 20,
	background: "#ffffff",
	border: "1px solid #e2e6ea",
	borderRadius: 14,
	color: "#65717b",
	fontSize: 13,
};

const emptyStyle: React.CSSProperties = {
	minHeight: 430,
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	padding: 48,
	textAlign: "center",
	background: "#ffffff",
	border: "1px solid #e2e7eb",
	borderRadius: 15,
};

const emptyIconStyle: React.CSSProperties = {
	width: 58,
	height: 58,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	marginBottom: 20,
	color: "#3478bd",
	background: "#f0f7fd",
	border: "1px solid #dbeaf5",
	borderRadius: 16,
};

const emptyTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 24,
	fontWeight: 680,
	letterSpacing: "-0.025em",
};

const emptyDescriptionStyle: React.CSSProperties = {
	maxWidth: 610,
	margin: "12px 0 0",
	color: "#687783",
	fontSize: 14,
	lineHeight: "22px",
};

const emptyNoteStyle: React.CSSProperties = {
	maxWidth: 650,
	marginTop: 24,
	padding: "13px 16px",
	background: "#f8fafc",
	border: "1px solid #e6ebef",
	borderRadius: 10,
	color: "#7b8790",
	fontSize: 11,
	lineHeight: "18px",
};

const heroStyle: React.CSSProperties = {
	position: "relative",
	minHeight: 280,
	display: "flex",
	alignItems: "center",
	overflow: "hidden",
	marginBottom: 18,
	padding: "38px 40px",
	background: "linear-gradient(118deg, #f8fbfe 0%, #f3f9fd 48%, #eef7fc 100%)",
	border: "1px solid #dbe7f0",
	borderRadius: 16,
};

const heroCopyStyle: React.CSSProperties = {
	position: "relative",
	zIndex: 2,
	maxWidth: 680,
};

const eyebrowStyle: React.CSSProperties = {
	marginBottom: 9,
	color: "#3478bd",
	fontSize: 10,
	fontWeight: 750,
	letterSpacing: "0.15em",
	textTransform: "uppercase",
};

const heroTitleStyle: React.CSSProperties = {
	maxWidth: 650,
	margin: 0,
	fontSize: 38,
	lineHeight: "45px",
	fontWeight: 700,
	letterSpacing: "-0.04em",
};

const heroDescriptionStyle: React.CSSProperties = {
	maxWidth: 625,
	margin: "16px 0 0",
	color: "#607587",
	fontSize: 14,
	lineHeight: "22px",
};

const heroGraphicStyle: React.CSSProperties = {
	position: "absolute",
	right: 64,
	top: 0,
	bottom: 0,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	opacity: 0.9,
};

const heroOrbOuterStyle: React.CSSProperties = {
	width: 190,
	height: 190,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	border: "1px solid rgba(87,151,205,0.13)",
	borderRadius: 999,
	background: "rgba(255,255,255,0.32)",
};

const heroOrbMiddleStyle: React.CSSProperties = {
	width: 126,
	height: 126,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	border: "1px solid rgba(87,151,205,0.20)",
	borderRadius: 999,
	background: "rgba(236,247,255,0.58)",
};

const heroOrbInnerStyle: React.CSSProperties = {
	width: 68,
	height: 68,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	color: "#4b88b9",
	background: "#ffffff",
	border: "1px solid #d6e8f5",
	borderRadius: 999,
	boxShadow: "0 10px 30px rgba(70,125,168,0.10)",
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
	gap: 30,
	marginBottom: 22,
};

const snapshotTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 22,
	fontWeight: 680,
	letterSpacing: "-0.025em",
};

const snapshotDescriptionStyle: React.CSSProperties = {
	maxWidth: 690,
	margin: "7px 0 0",
	color: "#6e7c87",
	fontSize: 12,
	lineHeight: "19px",
};

const analysedBadgeStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	gap: 9,
	flexShrink: 0,
	padding: "10px 13px",
	color: "#53718b",
	background: "#f5f9fc",
	border: "1px solid #deebf4",
	borderRadius: 10,
	fontSize: 10,
};

const metricsStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
	borderTop: "1px solid #edf0f2",
};

function metricStyle(emphasis: boolean): React.CSSProperties {
	return {
		minHeight: 108,
		padding: "19px 20px 8px 0",
		borderRight: "1px solid #edf0f2",
		background: emphasis
			? "linear-gradient(180deg, rgba(255,249,232,0.45), transparent)"
			: "transparent",
	};
}

const metricValueStyle: React.CSSProperties = {
	fontSize: 29,
	lineHeight: "34px",
	fontWeight: 700,
	letterSpacing: "-0.04em",
};

const metricLabelStyle: React.CSSProperties = {
	marginTop: 6,
	fontSize: 12,
	fontWeight: 680,
};

const metricDescriptionStyle: React.CSSProperties = {
	marginTop: 3,
	color: "#89949d",
	fontSize: 10,
	lineHeight: "15px",
};

const sectionStyle: React.CSSProperties = {
	marginTop: 34,
};

const sectionHeadingStyle: React.CSSProperties = {
	marginBottom: 14,
};

const sectionEyebrowStyle: React.CSSProperties = {
	marginBottom: 6,
	color: "#3478bd",
	fontSize: 10,
	fontWeight: 750,
	letterSpacing: "0.11em",
	textTransform: "uppercase",
};

const sectionTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 22,
	fontWeight: 680,
	letterSpacing: "-0.02em",
};

const sectionDescriptionStyle: React.CSSProperties = {
	maxWidth: 790,
	margin: "6px 0 0",
	color: "#78848d",
	fontSize: 12,
	lineHeight: "19px",
};

const findingStackStyle: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: 10,
};

const findingCardStyle: React.CSSProperties = {
	background: "#ffffff",
	border: "1px solid #e1e6ea",
	borderRadius: 13,
	overflow: "hidden",
};

const findingTopStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "52px minmax(260px, 1fr) 180px auto",
	gap: 17,
	alignItems: "center",
	padding: "17px 18px",
};

const findingIconStyle: React.CSSProperties = {
	width: 42,
	height: 42,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	color: "#397db5",
	background: "#f1f8fd",
	border: "1px solid #dcebf6",
	borderRadius: 999,
};

const findingMainStyle: React.CSSProperties = {
	minWidth: 0,
};

const findingAreaStyle: React.CSSProperties = {
	color: "#6083a0",
	fontSize: 9,
	fontWeight: 750,
	letterSpacing: "0.08em",
	textTransform: "uppercase",
};

const findingTitleStyle: React.CSSProperties = {
	margin: "4px 0 0",
	fontSize: 15,
	fontWeight: 680,
};

const findingSummaryStyle: React.CSSProperties = {
	margin: "4px 0 0",
	color: "#697680",
	fontSize: 11,
	lineHeight: "17px",
};

const findingStatusWrapStyle: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	alignItems: "flex-start",
	gap: 5,
};

function findingStatusStyle(attention: boolean): React.CSSProperties {
	return {
		display: "inline-flex",
		padding: "4px 8px",
		color: attention ? "#725d27" : "#62717d",
		background: attention ? "#fff8e7" : "#f3f6f8",
		border: attention ? "1px solid #ead8aa" : "1px solid #dde4e9",
		borderRadius: 999,
		fontSize: 9,
		fontWeight: 750,
	};
}

const evidenceStyle: React.CSSProperties = {
	color: "#8a959d",
	fontSize: 9,
	textTransform: "capitalize",
};

const detailsButtonStyle: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: 5,
	minHeight: 34,
	padding: "0 11px",
	color: "#315c84",
	background: "#ffffff",
	border: "1px solid #cfd9e2",
	borderRadius: 8,
	fontSize: 11,
	fontWeight: 650,
	cursor: "pointer",
	whiteSpace: "nowrap",
};

const expandedStyle: React.CSSProperties = {
	padding: "19px 22px 21px",
	background: "#fbfcfd",
	borderTop: "1px solid #e9edf0",
};

const detailGridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
	gap: 28,
};

const detailMetaStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
	gap: 14,
	marginTop: 18,
};

const detailLabelStyle: React.CSSProperties = {
	display: "block",
	marginBottom: 5,
	color: "#80909e",
	fontSize: 9,
	fontWeight: 700,
	letterSpacing: "0.06em",
	textTransform: "uppercase",
};

const detailTextStyle: React.CSSProperties = {
	margin: 0,
	color: "#596672",
	fontSize: 11,
	lineHeight: "18px",
};

const questionStyle: React.CSSProperties = {
	marginTop: 18,
	padding: 14,
	background: "#f4f9fd",
	border: "1px solid #dceaf5",
	borderRadius: 9,
	fontSize: 11,
	lineHeight: "18px",
};

const limitationsStyle: React.CSSProperties = {
	marginTop: 17,
	color: "#65727d",
	fontSize: 10,
	lineHeight: "17px",
};

const reassuranceStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	gap: 12,
	padding: 18,
	color: "#5e707e",
	background: "#f7fbf8",
	border: "1px solid #dce9e0",
	borderRadius: 12,
	fontSize: 12,
	lineHeight: "19px",
};

const areaGridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
	gap: 12,
};

const areaCardStyle: React.CSSProperties = {
	display: "flex",
	gap: 15,
	minHeight: 145,
	padding: 19,
	background: "#ffffff",
	border: "1px solid #e1e6ea",
	borderRadius: 13,
};

const areaIconStyle: React.CSSProperties = {
	width: 40,
	height: 40,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	flexShrink: 0,
	color: "#477eaa",
	background: "#eef6fc",
	border: "1px solid #d9e9f5",
	borderRadius: 11,
};

const areaCardContentStyle: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
};

const areaTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 14,
	fontWeight: 680,
};

const areaDescriptionStyle: React.CSSProperties = {
	margin: "6px 0 12px",
	color: "#6e7b85",
	fontSize: 10,
	lineHeight: "16px",
};

const areaMetaStyle: React.CSSProperties = {
	display: "flex",
	gap: 12,
	color: "#89949d",
	fontSize: 9,
};

const attentionTextStyle: React.CSSProperties = {
	color: "#77612c",
};

const factorsStyle: React.CSSProperties = {
	marginTop: 42,
	padding: "27px 29px",
	background: "linear-gradient(135deg, #f7fbfe 0%, #ffffff 68%)",
	border: "1px solid #dce8f1",
	borderRadius: 15,
};

const factorsHeaderStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	justifyContent: "space-between",
	gap: 24,
	marginBottom: 20,
};

const comingSoonStyle: React.CSSProperties = {
	flexShrink: 0,
	padding: "5px 9px",
	color: "#56748e",
	background: "#edf6fc",
	border: "1px solid #d7e8f4",
	borderRadius: 999,
	fontSize: 9,
	fontWeight: 750,
	textTransform: "uppercase",
};

const factorGridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
	gap: 10,
};

const factorCardStyle: React.CSSProperties = {
	minHeight: 150,
	padding: 17,
	background: "#ffffff",
	border: "1px solid #e1e8ed",
	borderRadius: 11,
};

const factorDotStyle: React.CSSProperties = {
	width: 8,
	height: 8,
	marginBottom: 13,
	background: "#78a9cf",
	borderRadius: 999,
};

const factorTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 13,
	fontWeight: 680,
};

const factorDescriptionStyle: React.CSSProperties = {
	margin: "7px 0 0",
	color: "#71808b",
	fontSize: 10,
	lineHeight: "16px",
};

const factorRuleStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	gap: 9,
	marginTop: 17,
	paddingTop: 15,
	color: "#71808c",
	borderTop: "1px solid #e5ebef",
	fontSize: 10,
	lineHeight: "16px",
};

const disclosureStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	gap: 11,
	marginTop: 34,
	padding: 17,
	color: "#5d7183",
	background: "#f3f8fd",
	border: "1px solid #d9e8f5",
	borderRadius: 12,
	fontSize: 11,
	lineHeight: "18px",
};
