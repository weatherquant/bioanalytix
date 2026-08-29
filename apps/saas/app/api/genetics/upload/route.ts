import { auth } from "@repo/auth/auth";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { parse23andMe, generateInsights } from "../../../../../../packages/api/modules/genetics";
import { SNP_REFERENCE } from "../../../../../../packages/api/modules/genetics/snp-reference";

export async function POST(req: Request) {
	// ⭐ 1. Authenticate user (same as genetic-profile route)
	const session = await auth.api.getSession({ headers: req.headers });

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;

	// ⭐ 2. Parse uploaded file
	const form = await req.formData();
	const file = form.get("file") as File;

	const text = await file.text();
	const allSnps = parse23andMe(text);

	// ⭐ 3. Filter to relevant SNPs only
	const relevantRsids = new Set(SNP_REFERENCE.map((s) => s.rsid));
	const filteredSnps: Record<string, string> = {};

	for (const [rsid, genotype] of Object.entries(allSnps)) {
		if (relevantRsids.has(rsid)) {
			filteredSnps[rsid] = genotype;
		}
	}

	// ⭐ 4. Generate full genetics profile
	const genetics = generateInsights(filteredSnps);

	// ⭐ 5. Compute personalised longevity → retirement → risk posture
	const longevityPercent = Math.round(genetics.longevityScore * 100);

	function retirementAgeFromLongevity(score: number): number {
		if (score < 0.35) return 65;
		if (score < 0.65) return 70;
		return 75;
	}

	const suggestedRetirementAge = retirementAgeFromLongevity(genetics.longevityScore);
	const lifeExpectancy = 90;
	const retirementYears = lifeExpectancy - suggestedRetirementAge;

	type RiskPosture = "capital_preservation" | "balanced" | "growth";

	function riskPostureFromRetirementYears(years: number): RiskPosture {
		if (years < 15) return "capital_preservation";
		if (years < 25) return "balanced";
		return "growth";
	}

	const riskPosture = riskPostureFromRetirementYears(retirementYears);

	// ⭐ 6. Save to Supabase (now with correct user_id)
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
	);

	const { data, error } = await supabase.from("user_genetic_profile").upsert({
		user_id: userId,
		snps: filteredSnps,

		// FULL genetics profile
		longevity_score: genetics.longevityScore,
		suggested_retirement_age: suggestedRetirementAge,
		retirement_years: retirementYears,
		risk_posture: riskPosture,

		disease_risks: genetics.diseaseRisks ?? [],
		trait_insights: genetics.traitInsights ?? [],
		genetic_strengths: genetics.geneticStrengths ?? [],
		longevity_factors: genetics.longevityFactors ?? [],
	});

	if (error) {
		console.error("Supabase error:", error);
		return NextResponse.json({ error: "Failed to save genetics profile" }, { status: 500 });
	}

	// ⭐ 7. Return full personalised profile
	return NextResponse.json({
		data: {
			longevityScore: genetics.longevityScore,
			diseaseRisks: genetics.diseaseRisks ?? [],
			traitInsights: genetics.traitInsights ?? [],
			//geneticStrengths: genetics.geneticStrengths ?? [],
			//longevityFactors: genetics.longevityFactors ?? [],
			suggestedRetirementAge,
			retirementYears,
			riskPosture,
			snps: filteredSnps,
		},
	});
}
