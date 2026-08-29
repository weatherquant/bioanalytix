import { getSession } from "@auth/lib/server";

import { createClient } from "@/utils/supabase/server";

import EstatePlanClient from "./EstatePlanClient";

export default async function EstatePlanPage() {
	const supabase = await createClient();
	const session = await getSession();

	const { data: financial } = await supabase.from("user_financial_profile").select("*").single();

	const { data: genetics } = await supabase.from("user_genetic_profile").select("*").single();

	const { data: spouse } = await supabase.from("user_spouse_profile").select("*").single();

	if (!financial || !genetics) {
		return (
			<div className="space-y-4 py-8">
				<h1 className="text-3xl font-bold">Estate Plan</h1>
				<p className="text-muted-foreground">
					We need both your financial profile and genetics profile to build your estate
					plan.
				</p>
			</div>
		);
	}

	return (
		<EstatePlanClient
			session={session}
			financial={financial}
			genetics={genetics}
			spouse={spouse}
		/>
	);
}
