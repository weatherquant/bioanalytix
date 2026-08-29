import { auth } from "@repo/auth/auth";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
	const session = await auth.api.getSession({ headers: req.headers });

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("user_financial_profile")
		.select("*")
		.eq("user_id", userId)
		.single();

	return NextResponse.json({ data, error });
}

export async function POST(req: Request) {
	const session = await auth.api.getSession({ headers: req.headers });

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;
	const supabase = await createClient();
	const body = await req.json();

	const { data, error } = await supabase.from("user_financial_profile").upsert({
		user_id: userId,
		age: body.age,
		income: body.income,
		savings_rate: body.savings_rate,
		assets: body.assets,
		retirement_age: body.retirement_age,
		gender: body.gender,
		country: body.country,
	});

	return NextResponse.json({ data, error });
}
