import { getOrganizationList, getSession } from "@auth/lib/server";
//import { OrganizationsGrid } from "@organizations/components/OrganizationsGrid";
import { config } from "@repo/auth/config";
import { Card } from "@repo/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import FinancialScenario from "./FinancialScenario";

export default async function AppStartPage() {
	const session = await getSession();

	if (!session) {
		redirect("/login");
	}

	/*
	const organizations = await getOrganizationList();

	if (config.organizations.enable && config.organizations.requireOrganization) {
		const organization =
			organizations.find((org) => org.id === session?.session.activeOrganizationId) ||
			organizations[0];

		if (!organization) {
			redirect("/new-organization");
		}

		redirect(`/${organization.slug}`);
	}
	*/

	const t = await getTranslations("start");

	const supabase = await createClient();

	const { data: financial } = await supabase.from("user_financial_profile").select("*").single();

	const completeness = (() => {
		if (!financial) return 0;

		let score = 0;
		if (financial.age) score += 20;
		if (financial.income) score += 20;
		if (financial.assets) score += 20;
		if (financial.expenses) score += 20;
		if (financial.retirement_age) score += 20;

		return score;
	})();

	return (
		<div className="">
			<PageHeader
				title={t("welcome", { name: session?.user.name })}
				subtitle={t("subtitle")}
			/>

			{/* Profile Completeness */}
			<div className="mt-4 mb-6">
				<div className="mb-1 flex items-center justify-between">
					<span className="text-sm font-medium text-gray-700">Profile Completeness</span>
					<span className="text-sm font-semibold text-gray-900">{completeness}%</span>
				</div>

				<div className="h-3 bg-gray-200 w-full overflow-hidden rounded-full">
					<div
						className="h-3 bg-blue-500 transition-all duration-500"
						style={{ width: `${completeness}%` }}
					/>
				</div>
			</div>

			<div>
				{/*
					{config.organizations.enable && <OrganizationsGrid />}
				*/}

				<Card className="mt-6">
					<div className="p-8">
						<FinancialScenario />
					</div>
				</Card>
			</div>
		</div>
	);
}
