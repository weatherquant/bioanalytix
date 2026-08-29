// apps/saas/app/(authenticated)/(main)/(account)/research/page.tsx

import { createClient } from "@/utils/supabase/client";

import ResearchPageClient from "./ResearchPageClient";
import { mapGeneticRisks } from "./utils/mapGeneticRisks";

export default async function ResearchPage() {
	const supabase = createClient();

	const { data } = await supabase.from("user_genetic_profile").select("*").single();

	const genetics = mapGeneticRisks(data);

	return <ResearchPageClient genetics={genetics} />;
}
