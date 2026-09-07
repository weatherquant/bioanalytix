"use client";

import { CheckCircle2, Dna, FileUp, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { GeneticProfile } from "../../../types/genetics";
import { getGeneticProfile, uploadGeneticFile } from "./api";

import styles from "../components/BioanalytixShell.module.css";

interface GeneticHighlight {
	id: string;

	model: {
		id: string;
		version: string;
	};

	title: string;
	domain: string;

	summary: string;

	direction: "higher" | "reference" | "lower" | "indeterminate";

	evidenceStrength: "established" | "strong" | "moderate" | "limited" | "insufficient";

	explanation: string;

	limitations: string[];

	provenance: {
		evidenceIds: string[];
		generatedAt: string;
		engineVersion: string;
	};
}

interface GeneticPlanningCoverage {
	modelsEvaluated: number;
	elevatedFindings: number;
	planningExposureCount: number;
	planningInsightCount: number;
}

interface BioanalytixPlanResponse {
	planningProfile: {
		geneticHighlights?: GeneticHighlight[];
		geneticPlanningCoverage?: GeneticPlanningCoverage | null;
	} | null;
}

async function getGeneticHighlights() {
	const response = await fetch("/api/bioanalytix/plan", {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Unable to load genetics highlights.");
	}

	const result = (await response.json()) as BioanalytixPlanResponse;

	return {
		highlights: result.planningProfile?.geneticHighlights ?? [],

		coverage: result.planningProfile?.geneticPlanningCoverage ?? null,
	};
}

export function DnaProfileClient() {
	const inputRef = useRef<HTMLInputElement>(null);

	const [profile, setProfile] = useState<GeneticProfile | null>(null);

	const [geneticHighlights, setGeneticHighlights] = useState<GeneticHighlight[]>([]);

	const [geneticCoverage, setGeneticCoverage] = useState<GeneticPlanningCoverage | null>(null);

	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);

	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		async function load() {
			try {
				const [profileResult, geneticsResult] = await Promise.all([
					getGeneticProfile(),
					getGeneticHighlights(),
				]);

				if (active) {
					setProfile(profileResult);

					setGeneticHighlights(geneticsResult.highlights);

					setGeneticCoverage(geneticsResult.coverage);
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

			/*
			 * Reload the canonical profile after processing.
			 * This avoids coupling the UI to the exact upload-response shape.
			 */
			const [refreshed, geneticsResult] = await Promise.all([
				getGeneticProfile(),
				getGeneticHighlights(),
			]);

			setProfile(refreshed ?? result);

			setGeneticHighlights(geneticsResult.highlights);

			setGeneticCoverage(geneticsResult.coverage);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to process your DNA file.");
		} finally {
			setUploading(false);

			if (inputRef.current) {
				inputRef.current.value = "";
			}
		}
	}

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
					<Dna size={26} strokeWidth={1.7} />
				</div>

				<h2 style={emptyTitleStyle}>Discover what your DNA may reveal</h2>

				<p style={emptyDescriptionStyle}>
					Upload your genetic data to identify longevity signals, health risk markers and
					traits that may influence your long-term plan.
				</p>

				<input
					ref={inputRef}
					type="file"
					accept=".txt,.csv"
					onChange={handleFile}
					style={{ display: "none" }}
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
						Bioanalytix analyses selected genetic markers relevant to your profile.
					</span>
				</div>
			</div>
		);
	}

	return (
		<>
			<div style={profileSummaryGrid}>
				<div style={summaryPanelStyle}>
					<div style={summaryLabelStyle}>Genetic models assessed</div>

					<div style={largeValueStyle}>
						{geneticCoverage?.modelsEvaluated ?? geneticHighlights.length}
					</div>

					<p style={summaryTextStyle}>
						Evidence models successfully evaluated against your uploaded genetic data.
					</p>
				</div>

				<div style={summaryPanelStyle}>
					<div style={summaryLabelStyle}>Elevated findings</div>

					<div style={largeValueStyle}>
						{geneticCoverage?.elevatedFindings ??
							geneticHighlights.filter(
								(highlight) => highlight.direction === "higher",
							).length}
					</div>

					<p style={summaryTextStyle}>
						Genetic findings currently showing a higher susceptibility signal.
					</p>
				</div>

				<div style={summaryPanelStyle}>
					<div style={summaryLabelStyle}>Planning-linked findings</div>

					<div style={largeValueStyle}>{geneticCoverage?.planningInsightCount ?? 0}</div>

					<p style={summaryTextStyle}>
						Findings that currently meet the additional threshold for financial planning
						relevance.
					</p>
				</div>
			</div>

			<div style={highlightsPanelStyle}>
				<div style={highlightsHeaderStyle}>
					<div>
						<h2 style={panelTitleStyle}>Genetic highlights</h2>

						<p style={panelDescriptionStyle}>
							Genetic findings currently supported by the Bioanalytix evidence
							library.
						</p>
					</div>

					<div style={modelsAssessedStyle}>
						<Dna size={16} />
						{geneticHighlights.length}{" "}
						{geneticHighlights.length === 1 ? "result" : "results"}
					</div>
				</div>

				{geneticHighlights.length === 0 ? (
					<div style={noHighlightsStyle}>
						<strong>No supported genetic results are currently available.</strong>

						<p style={highlightExplanationStyle}>
							Bioanalytix only displays findings from genetic models that are
							currently included in its evidence library.
						</p>
					</div>
				) : (
					<div style={highlightsGridStyle}>
						{geneticHighlights.map((highlight) => {
							const uniqueLimitations = [...new Set(highlight.limitations)];

							return (
								<div key={highlight.id} style={highlightCardStyle}>
									<div style={highlightTopStyle}>
										<div style={highlightDomainStyle}>{highlight.domain}</div>

										<div style={resultBadgeStyle(highlight.direction)}>
											{highlight.direction === "reference"
												? "Reference result"
												: highlight.direction === "higher"
													? "Higher signal"
													: highlight.direction === "lower"
														? "Lower signal"
														: "Indeterminate"}
										</div>
									</div>

									<h3 style={highlightTitleStyle}>{highlight.title}</h3>

									<p style={highlightSummaryStyle}>{highlight.summary}</p>

									<div style={evidenceRowStyle}>
										<span>Evidence strength</span>

										<strong>{highlight.evidenceStrength}</strong>
									</div>

									<div style={meaningBlockStyle}>
										<strong>What this means</strong>

										<p style={highlightExplanationStyle}>
											{highlight.explanation}
										</p>
									</div>

									{uniqueLimitations.length > 0 && (
										<details style={limitationsStyle}>
											<summary>Important limitations</summary>

											<ul style={limitationsListStyle}>
												{uniqueLimitations.map((limitation) => (
													<li key={limitation}>{limitation}</li>
												))}
											</ul>
										</details>
									)}

									<div style={modelFooterStyle}>
										Model {highlight.model.version}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			<div style={profilePanelStyle}>
				<div style={profilePanelHeaderStyle}>
					<div>
						<h2 style={panelTitleStyle}>DNA profile</h2>

						<p style={panelDescriptionStyle}>Your current genetic analysis.</p>
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
					style={{ display: "none" }}
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
					Replace DNA file
				</button>

				{error ? <p style={errorStyle}>{error}</p> : null}
			</div>
		</>
	);
}

const loadingStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: 10,
	minHeight: 160,
	color: "#777777",
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
	width: 54,
	height: 54,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	marginBottom: 22,
	border: "1px solid #dfdfdf",
	borderRadius: 14,
	background: "#fafafa",
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

const profileSummaryGrid: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
	gap: 16,
};

const summaryPanelStyle: React.CSSProperties = {
	minHeight: 190,
	padding: 24,
	display: "flex",
	flexDirection: "column",
	background: "#ffffff",
	border: "1px solid #e4e4e4",
	borderRadius: 14,
};

const summaryLabelStyle: React.CSSProperties = {
	color: "#707070",
	fontSize: 13,
};

const largeValueStyle: React.CSSProperties = {
	marginTop: 22,
	fontSize: 34,
	lineHeight: "40px",
	fontWeight: 650,
	letterSpacing: "-0.03em",
};

const unitStyle: React.CSSProperties = {
	fontSize: 15,
	color: "#888888",
	fontWeight: 500,
};

const summaryTextStyle: React.CSSProperties = {
	margin: "auto 0 0",
	color: "#777777",
	fontSize: 13,
	lineHeight: "20px",
};

const profilePanelStyle: React.CSSProperties = {
	marginTop: 16,
	padding: 24,
	background: "#ffffff",
	border: "1px solid #e4e4e4",
	borderRadius: 14,
};

const profilePanelHeaderStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	justifyContent: "space-between",
	gap: 24,
	marginBottom: 24,
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

const highlightsPanelStyle: React.CSSProperties = {
	marginTop: 16,
	padding: 24,
	background: "#ffffff",
	border: "1px solid #e4e4e4",
	borderRadius: 14,
};

const highlightsHeaderStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	justifyContent: "space-between",
	gap: 24,
	marginBottom: 20,
};

const modelsAssessedStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: 7,
	color: "#666666",
	fontSize: 12,
};

const highlightsGridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
	gap: 14,
};

const highlightCardStyle: React.CSSProperties = {
	padding: 22,
	background: "#fafafa",
	border: "1px solid #e3e3e3",
	borderRadius: 12,
};

const highlightTopStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	gap: 12,
};

const highlightDomainStyle: React.CSSProperties = {
	color: "#888888",
	fontSize: 11,
	fontWeight: 650,
	letterSpacing: "0.05em",
	textTransform: "uppercase",
};

function resultBadgeStyle(direction: GeneticHighlight["direction"]): React.CSSProperties {
	return {
		padding: "5px 8px",
		border: direction === "higher" ? "1px solid #d9b3b3" : "1px solid #dddddd",
		borderRadius: 999,
		background: direction === "higher" ? "#fff7f7" : "#ffffff",
		color: direction === "higher" ? "#873f3f" : "#666666",
		fontSize: 10,
		fontWeight: 650,
	};
}

const highlightTitleStyle: React.CSSProperties = {
	margin: "18px 0 0",
	fontSize: 18,
	lineHeight: "24px",
	fontWeight: 650,
	letterSpacing: "-0.015em",
};

const highlightSummaryStyle: React.CSSProperties = {
	margin: "8px 0 0",
	color: "#666666",
	fontSize: 13,
	lineHeight: "20px",
};

const evidenceRowStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	marginTop: 18,
	padding: "10px 12px",
	background: "#ffffff",
	border: "1px solid #e4e4e4",
	borderRadius: 8,
	fontSize: 12,
	textTransform: "capitalize",
};

const meaningBlockStyle: React.CSSProperties = {
	marginTop: 18,
};

const highlightExplanationStyle: React.CSSProperties = {
	margin: "5px 0 0",
	color: "#707070",
	fontSize: 12,
	lineHeight: "19px",
};

const limitationsStyle: React.CSSProperties = {
	marginTop: 18,
	color: "#666666",
	fontSize: 11,
};

const limitationsListStyle: React.CSSProperties = {
	margin: "10px 0 0",
	paddingLeft: 18,
	color: "#777777",
	lineHeight: "18px",
};

const modelFooterStyle: React.CSSProperties = {
	marginTop: 18,
	paddingTop: 12,
	borderTop: "1px solid #e3e3e3",
	color: "#999999",
	fontSize: 10,
};

const noHighlightsStyle: React.CSSProperties = {
	padding: 18,
	background: "#fafafa",
	border: "1px solid #e5e5e5",
	borderRadius: 10,
	fontSize: 12,
};
