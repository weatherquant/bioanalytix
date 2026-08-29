import { auth } from "@repo/auth/auth";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

// -------------------------
// GET: Return camelCase data
// -------------------------
export async function GET(req: Request) {
	const session = await auth.api.getSession({ headers: req.headers });

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("user_genetic_profile")
		.select("*")
		.eq("user_id", userId)
		.single();

	if (error) {
		return NextResponse.json({ error }, { status: 500 });
	}

	if (!data) {
		return NextResponse.json({ data: null });
	}

	// ⭐ Normalize snake_case → camelCase
	const normalized = {
		longevityScore: data.longevity_score ?? 0,
		diseaseRisks: data.disease_risks ?? [],
		traitInsights: data.trait_insights ?? [],
		geneticStrengths: data.genetic_strengths ?? [],
		longevityFactors: data.longevity_factors ?? [],
	};

	return NextResponse.json({ data: normalized });
}

// -------------------------
// POST: Accept camelCase, store snake_case, return camelCase
// -------------------------
export async function POST(req: Request) {
	const session = await auth.api.getSession({ headers: req.headers });

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;
	const supabase = await createClient();
	const body = await req.json();

	// Body is camelCase from the UI
	const payload = {
		user_id: userId,
		longevity_score: body.longevityScore,
		disease_risks: body.diseaseRisks,
		trait_insights: body.traitInsights,
		suggested_retirement_age: body.suggestedRetirementAge,
		retirement_years: body.retirementYears,
		risk_posture: body.riskPosture,
		snps: body.snps,
	};

	const { data, error } = await supabase
		.from("user_genetic_profile")
		.upsert(payload)
		.select()
		.single();

	if (error) {
		return NextResponse.json({ error }, { status: 500 });
	}

	// ⭐ Normalize response to camelCase
	const normalized = {
		longevityScore: data.longevity_score ?? 0,
		diseaseRisks: data.disease_risks ?? [],
		traitInsights: data.trait_insights ?? [],
		suggestedRetirementAge: data.suggested_retirement_age ?? null,
		retirementYears: data.retirement_years ?? null,
		riskPosture: data.risk_posture ?? null,
		snps: data.snps ?? {},
	};

	return NextResponse.json({ data: normalized });
}
