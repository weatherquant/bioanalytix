"use client";

import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@repo/ui/components/accordion";
import { Button } from "@repo/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Progress } from "@repo/ui/components/progress";
import { toast } from "@repo/ui/components/toast";
import { useState, useEffect } from "react";

import { createClient } from "@/utils/supabase/client";

import { ChartLegend } from "./components/ChartLegend";
import { DiseaseRiskBarsEnhanced } from "./components/DiseaseRiskBarsEnhanced";
import { GeneticActionBox } from "./components/GeneticActionBox";
import { GeneticAgeIndicator } from "./components/GeneticAgeIndicator";
import { GeneticProfileSummary } from "./components/GeneticProfileSummary";
import { GeneticStrengths } from "./components/GeneticStrengths";
import { LongevityFactors } from "./components/LongevityFactors";
import { LongevityGauge } from "./components/LongevityGauge";
import { NoGeneticsData } from "./components/NoGeneticsData";
import { RiskBadge } from "./components/RiskBadge";
import { RiskBanner } from "./components/RiskBanner";
import { RiskSignalCurveChart } from "./components/RiskSignalCurveChart";
import { StrengthsVsRisks } from "./components/StrengthsVsRisks";
import { TopGeneticInsight } from "./components/TopGeneticInsight";
import { generateFallbackRisks } from "./utils/generateFallbackRisks";
import { generateFallbackTraitInsights } from "./utils/generateFallbackTraitInsights";

export default function GeneticsPage() {
	const [file, setFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [summary, setSummary] = useState<any>(null);
	const supabase = createClient();
	const diseaseRisks = summary?.diseaseRisks ?? [];

	async function handleUpload() {
		if (!file) {
			toast({ title: "No file selected", description: "Please upload a 23andMe file." });
			return;
		}

		setLoading(true);

		const form = new FormData();
		form.append("file", file);

		try {
			const res = await fetch("/api/genetics/upload", {
				method: "POST",
				body: form,
			});

			if (!res.ok) {
				throw new Error("Upload failed");
			}

			const data = await res.json();
			setSummary({
				longevityScore: data.data.longevityScore,
				diseaseRisks: data.data.diseaseRisks,
				traitInsights: data.data.traitInsights,
				suggestedRetirementAge: data.data.suggestedRetirementAge,
				retirementYears: data.data.retirementYears,
				riskPosture: data.data.riskPosture,
				snps: data.data.snps,
			});

			// Persist the genetics profile to Supabase
			await saveGeneticsProfile(data.data);

			toast({
				title: "Upload complete",
				description: "Your genetic summary has been generated and saved.",
			});
		} catch (err) {
			toast({
				title: "Upload failed",
				description: "Please try again or use a different file.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}

	async function saveGeneticsProfile(summary: any) {
		const res = await fetch("/api/genetic-profile", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				longevityScore: summary.longevityScore,
				diseaseRisks: summary.diseaseRisks,
				traitInsights: summary.traitInsights,
				suggestedRetirementAge: summary.suggestedRetirementAge,
				retirementYears: summary.retirementYears,
				riskPosture: summary.riskPosture,
				snps: summary.snps,
			}),
		});

		const json = await res.json();

		if (json.error) {
			toast({
				title: "Failed to save genetics profile",
				description: json.error.message ?? "An unexpected error occurred",
				variant: "destructive",
			});
		} else {
			toast({
				title: "Genetics profile saved",
				description: "Your genetic insights have been stored successfully.",
			});
		}
	}

	// Load saved genetics profile on page load
	useEffect(() => {
		async function loadSavedGenetics() {
			const res = await fetch("/api/genetic-profile", {
				method: "GET",
				credentials: "include",
			});

			const json = await res.json();

			if (json?.data) {
				setSummary({
					// Convert DB snake_case → UI camelCase
					longevityScore: json.data.longevityScore ?? 0,
					diseaseRisks: json.data.diseaseRisks ?? [],
					traitInsights: json.data.traitInsights ?? [],
					geneticStrengths: json.data.geneticStrengths ?? [],
					longevityFactors: json.data.longevityFactors ?? [],
					suggestedRetirementAge: json.data.suggestedRetirementAge ?? null,
					retirementYears: json.data.retirementYears ?? null,
					riskPosture: json.data.riskPosture ?? null,
					snps: json.data.snps ?? {},
				});
			}
		}

		loadSavedGenetics();
	}, []);

	return (
		<div className="space-y-8 py-8">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Genetic Profile</h1>

				{summary && (
					<Button
						onClick={() => saveGeneticsProfile(summary)}
						className="px-4 py-2 bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 rounded-md transition"
					>
						Save Genetics Profile
					</Button>
				)}
			</div>

			{/* TOP ROW: Upload + Longevity */}
			<div className="md:grid-cols-2 gap-4 max-w-5xl mx-auto grid grid-cols-1">
				{/* Upload Card */}
				<div className="max-w-xl">
					<Card>
						<CardHeader>
							<CardTitle>Upload Your 23andMe Data</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<Input
								type="file"
								accept=".txt,.zip,.csv,.json"
								onChange={(e) => setFile(e.target.files?.[0] ?? null)}
							/>
							<Button onClick={handleUpload} disabled={loading}>
								{loading ? "Processing..." : "Upload & Analyse"}
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* Longevity Gauge */}
				{summary && (
					<div className="space-y-4 flex flex-col items-center">
						<div className="text-center">
							<h3 className="font-semibold">Longevity Score (0–100)</h3>
							<p className="text-2xl font-bold">{summary.longevityScore ?? 0}</p>
							<Progress value={summary.longevityScore ?? 0} className="mt-2" />
						</div>

						<LongevityGauge score={(summary.longevityScore ?? 0) / 100} />
						<RiskBanner score={(summary.longevityScore ?? 0) / 100} />

						<GeneticAgeIndicator
							geneticAge={summary.geneticAge}
							chronologicalAge={summary.chronologicalAge}
						/>
					</div>
				)}
			</div>

			{/* EMPTY STATE */}
			{!summary && <NoGeneticsData />}

			{summary && (
				<div className="md:grid-cols-2 gap-4 max-w-5xl mx-auto grid grid-cols-1">
					{/* Left column */}
					<div className="space-y-6">
						<TopGeneticInsight
							risks={generateFallbackRisks(summary?.diseaseRisks ?? [])}
						/>

						<GeneticProfileSummary
							risks={generateFallbackRisks(summary?.diseaseRisks ?? [])}
							longevityScore={summary.longevityScore}
						/>
					</div>

					{/* Right column */}
					<div className="space-y-6">
						<StrengthsVsRisks
							risks={generateFallbackRisks(summary?.diseaseRisks ?? [])}
						/>

						<GeneticActionBox
							risks={generateFallbackRisks(summary?.diseaseRisks ?? [])}
						/>
					</div>
				</div>
			)}

			{/* SECOND ROW: Charts */}
			{summary && (
				<div className="md:grid-cols-2 gap-4 max-w-5xl mx-auto grid grid-cols-1">
					{/* Disease Risk Bars */}
					<Card>
						<CardHeader>
							<CardTitle>Disease Risk Comparison</CardTitle>
						</CardHeader>
						<CardContent>
							<DiseaseRiskBarsEnhanced
								risks={generateFallbackRisks(summary?.diseaseRisks ?? [])}
							/>
						</CardContent>
					</Card>

					{/* Risk Curve */}
					<Card>
						<CardHeader>
							<CardTitle>Genetic Risk Distribution</CardTitle>
						</CardHeader>
						<CardContent>
							<RiskSignalCurveChart
								risks={generateFallbackRisks(summary?.diseaseRisks ?? [])}
							/>
						</CardContent>
					</Card>
				</div>
			)}

			{/* THIRD ROW: Disease Risk Cards */}
			{summary && (
				<Card>
					<CardHeader>
						<CardTitle>Disease Risk Overview</CardTitle>
					</CardHeader>
					<CardContent className="sm:grid-cols-2 lg:grid-cols-3 gap-6 grid">
						{generateFallbackRisks(summary?.diseaseRisks ?? []).map((risk: any) => (
							<Card key={risk.disease} className="p-4">
								<div className="mb-2 flex items-center justify-between">
									<h3 className="text-lg font-semibold capitalize">
										{risk.disease}
									</h3>
									<RiskBadge risk={Math.round(risk.score * 100)} />
								</div>

								<p className="text-sm mb-3 text-muted-foreground">
									{risk.explanation}
								</p>
								<Progress value={risk.score * 100} className="mb-2" />
								<p className="text-sm font-medium">
									Risk Level:{" "}
									<span
										className={
											risk.label === "elevated"
												? "text-red-600"
												: risk.label === "low"
													? "text-green-600"
													: "text-yellow-600"
										}
									>
										{risk.label}
									</span>
								</p>
								<p className="text-xs mt-2 text-muted-foreground">
									{risk.contributingMarkers.length} contributing genetic markers
								</p>
							</Card>
						))}
					</CardContent>
				</Card>
			)}

			{/* GENETIC STRENGTHS */}
			{summary && (
				<Card>
					<CardHeader>
						<CardTitle>Genetic Strengths</CardTitle>
					</CardHeader>
					<CardContent>
						<GeneticStrengths
							strengths={[
								"Strong antioxidant response (SOD2)",
								"Favorable inflammation profile (IL6)",
								"Healthy lipid metabolism (APOE E3/E3)",
							]}
						/>
					</CardContent>
				</Card>
			)}

			{/* LONGEVITY FACTORS */}
			{summary && (
				<Card>
					<CardHeader>
						<CardTitle>Longevity Factors</CardTitle>
					</CardHeader>
					<CardContent>
						<LongevityFactors
							factors={[
								{ label: "Cellular Repair (FOXO3)", score: 70 },
								{ label: "Inflammation Control (IL6)", score: 55 },
								{ label: "Lipid Metabolism (APOE)", score: 60 },
							]}
						/>
					</CardContent>
				</Card>
			)}

			{/* FOURTH ROW: Trait Insights */}
			{summary && (
				<Card>
					<CardHeader>
						<CardTitle>Trait Insights</CardTitle>
					</CardHeader>
					<CardContent>
						<Accordion type="multiple" className="w-full">
							{generateFallbackTraitInsights(summary?.traitInsights ?? []).map(
								(trait: any) => (
									<AccordionItem key={trait.trait} value={trait.trait}>
										<AccordionTrigger className="capitalize">
											{trait.trait}
										</AccordionTrigger>
										<AccordionContent>
											<p className="text-sm mb-4 text-muted-foreground">
												{trait.summary}
											</p>
											<div className="space-y-4">
												{trait.markers.map((m: any) => (
													<Card key={m.snp.rsid} className="p-4">
														<h4 className="font-semibold">
															{m.snp.gene} ({m.snp.rsid})
														</h4>
														<p className="text-sm text-muted-foreground">
															Your genotype:{" "}
															<strong>{m.userGenotype}</strong>
														</p>
														<p className="text-sm mt-2">
															{m.interpretation}
														</p>
													</Card>
												))}
											</div>
										</AccordionContent>
									</AccordionItem>
								),
							)}
						</Accordion>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
