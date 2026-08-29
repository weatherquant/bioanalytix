import { createClient } from "@/utils/supabase/server";

import PortfolioClient from "./PortfolioClient";

export default async function PortfolioPage() {
	const supabase = await createClient();

	// Load financial profile
	const { data: financial } = await supabase.from("user_financial_profile").select("*").single();

	// Load genetics (optional)
	const { data: genetics } = await supabase.from("user_genetic_profile").select("*").single();

	// Load spouse (optional)
	const { data: spouse } = await supabase.from("user_spouse_profile").select("*").single();

	if (!financial) {
		return (
			<div className="space-y-4 py-8">
				<h1 className="text-3xl font-bold">Portfolio</h1>
				<p className="text-muted-foreground">
					Please complete your financial profile first.
				</p>
			</div>
		);
	}

	return <PortfolioClient financial={financial} genetics={genetics} spouse={spouse} />;
}
