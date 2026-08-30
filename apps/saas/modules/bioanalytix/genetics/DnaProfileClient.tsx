"use client";

import { CheckCircle2, Dna, FileUp, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { GeneticProfile } from "../../../types/genetics";
import { getGeneticProfile, uploadGeneticFile } from "./api";

import styles from "../components/BioanalytixShell.module.css";

export function DnaProfileClient() {
	const inputRef = useRef<HTMLInputElement>(null);

	const [profile, setProfile] = useState<GeneticProfile | null>(null);

	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);

	const [error, setError] = useState<string | null>(null);

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

			/*
			 * Reload the canonical profile after processing.
			 * This avoids coupling the UI to the exact upload-response shape.
			 */
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

	if (loading) {
		return (
			<div style={loadingStyle}>
				<Loader2 size={20} className="animate-spin" />

				<span>Loading your DNA profile…</span>
			</div>
		);
	}

	const hasDnaData = profile && profile.snps && Object.keys(profile.snps).length > 0;

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

	const longevityPercent = Math.max(
		0,
		Math.min(
			100,
			Math.round(
				profile.longevityScore <= 1 ? profile.longevityScore * 100 : profile.longevityScore,
			),
		),
	);

	return (
		<>
			<div style={profileSummaryGrid}>
				<div style={summaryPanelStyle}>
					<div style={summaryLabelStyle}>Genetic longevity signal</div>

					<div style={largeValueStyle}>
						{longevityPercent}
						<span style={unitStyle}> / 100</span>
					</div>

					<p style={summaryTextStyle}>
						A composite signal derived from the genetic markers currently included in
						your Bioanalytix profile.
					</p>
				</div>

				<div style={summaryPanelStyle}>
					<div style={summaryLabelStyle}>Health signals</div>

					<div style={largeValueStyle}>{profile.diseaseRisks.length}</div>

					<p style={summaryTextStyle}>
						Health-related genetic signals currently identified in your profile.
					</p>
				</div>

				<div style={summaryPanelStyle}>
					<div style={summaryLabelStyle}>Genetic strengths</div>

					<div style={largeValueStyle}>{profile.geneticStrengths.length}</div>

					<p style={summaryTextStyle}>
						Potentially favourable genetic signals detected in the available data.
					</p>
				</div>
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
