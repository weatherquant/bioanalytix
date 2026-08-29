"use client";

import { Button, Card, CardHeader, CardTitle, CardContent, Input, Progress, toast } from "@repo/ui";
import React, { useState } from "react";

export default function GeneticProfile() {
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [profile, setProfile] = useState<any>(null);

	async function handleUpload() {
		if (!file) {
			toast({
				title: "No file selected",
				description: "Please choose a DNA file.",
			});
			return;
		}

		setUploading(true);

		const formData = new FormData();
		formData.append("file", file);

		try {
			const res = await fetch("/api/genetics/upload", {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				throw new Error("Upload failed");
			}

			const json = await res.json();

			console.log("UPLOAD RESPONSE:", json); // ⭐ ADD THIS

			// ⭐ Your backend returns { data: { ... } }
			setProfile(json.data);

			toast({
				title: "Upload complete",
				description: "Your genetic profile has been generated.",
			});
		} catch (err) {
			console.error("UPLOAD ERROR:", err); // ⭐ ADD THIS

			toast({
				title: "Upload failed",
				description: "Please try again or use a different file.",
				variant: "destructive",
			});
		} finally {
			setUploading(false);
		}
	}

	return (
		<div className="max-w-4xl py-10 space-y-10 mx-auto">
			{/* UPLOAD CARD */}
			<Card>
				<CardHeader>
					<CardTitle>Genetic Profile</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Upload your raw DNA file (23andMe, AncestryDNA, MyHeritage, etc.). We
						extract longevity markers, disease‑related SNPs, and generate a personalised
						risk score.
					</p>

					<Input
						type="file"
						accept=".zip,.txt,.csv,.json"
						onChange={(e) => setFile(e.target.files?.[0] ?? null)}
					/>

					<Button onClick={handleUpload} disabled={uploading || !file}>
						{uploading ? "Uploading..." : "Upload DNA File"}
					</Button>

					{uploading && <Progress value={60} className="w-full" />}
				</CardContent>
			</Card>

			{/* RESULTS */}
			{profile && (
				<Card>
					<CardHeader>
						<CardTitle>Your Genetic Summary</CardTitle>
					</CardHeader>

					<CardContent className="space-y-8">
						{/* Longevity Score */}
						<div>
							<h3 className="font-semibold">Longevity Score</h3>
							<p className="text-3xl font-bold">{profile.longevityScore}</p>
							<Progress value={profile.longevityScore} />
							<p className="text-sm mt-2 text-muted-foreground">
								Based on aggregated SNPs associated with lifespan, cellular
								resilience, inflammation, and metabolic aging.
							</p>
						</div>

						{/* Retirement Impact */}
						<div>
							<h3 className="font-semibold">Retirement Planning Impact</h3>
							<p className="text-sm">
								Suggested Retirement Age:{" "}
								<strong>{profile.suggestedRetirementAge}</strong>
							</p>
							<p className="text-sm">
								Expected Retirement Duration:{" "}
								<strong>{profile.retirementYears} years</strong>
							</p>
							<p className="text-sm">
								Recommended Risk Posture:{" "}
								<strong className="capitalize">{profile.riskPosture}</strong>
							</p>
						</div>

						{/* Disease Risks */}
						<div>
							<h3 className="font-semibold">Disease Risk Overview</h3>
							<ul className="ml-6 text-sm list-disc">
								{profile.diseaseRisks?.map((risk: any, idx: number) => (
									<li key={idx}>
										<strong>{risk.disease}</strong>: {risk.label}
									</li>
								))}
							</ul>
						</div>

						{/* Trait Insights */}
						<div>
							<h3 className="font-semibold">Trait Insights</h3>
							<ul className="ml-6 text-sm list-disc">
								{profile.traitInsights?.map((trait: any, idx: number) => (
									<li key={idx}>
										<strong>{trait.trait}</strong>: {trait.summary}
									</li>
								))}
							</ul>
						</div>

						{/* Raw SNPs */}
						<div>
							<h3 className="font-semibold">Extracted SNPs</h3>
							<ul className="ml-6 text-sm list-disc">
								{Object.entries(profile.snps).map(
									([rsid, genotype]: [string, string]) => (
										<li key={rsid}>
											<strong>{rsid}</strong>: {genotype}
										</li>
									),
								)}
							</ul>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
