"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/components/card";
import { PageHeader } from "@shared/components/PageHeader";
import { useState, useMemo } from "react";

import EstatePlanCharts from "./EstatePlanCharts";
import EstatePlanControls from "./EstatePlanControls";

export default function EstatePlanClient({ session, financial, genetics, spouse }) {
	const [retirementAge, setRetirementAge] = useState(financial.retirement_age);
	const [includeInsurance, setIncludeInsurance] = useState(true);
	const [includeSpouse, setIncludeSpouse] = useState(!!spouse);
	const [spouseAge, setSpouseAge] = useState(spouse?.age ?? financial.age);
	const [spouseGender, setSpouseGender] = useState<"male" | "female">(spouse?.gender ?? "female");

	const completeness =
		(financial.age ? 20 : 0) +
		(financial.income ? 20 : 0) +
		(financial.assets ? 20 : 0) +
		(financial.expenses ? 20 : 0) +
		(financial.retirement_age ? 20 : 0);

	return (
		<div className="md:px-0 md:rounded-none md:border-0 space-y-10 w-full max-w-none">
			{/* HEADER */}
			<PageHeader
				title={`Estate Plan for ${session?.user.name}`}
				subtitle="A personalised projection of your estate, longevity, and legacy."
			/>

			{/* PROFILE COMPLETENESS */}
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

			{/* MAIN GRID */}
			<div className="lg:grid-cols-3 gap-8 grid grid-cols-1">
				{/* LEFT COLUMN */}
				<div className="space-y-6">
					<Card className="p-6 space-y-3">
						<h2 className="text-xl font-semibold">Your Financial Profile</h2>
						<div className="space-y-1 text-sm">
							<p>
								<strong>Age:</strong> {financial.age}
							</p>
							<p>
								<strong>Retirement Age:</strong> {financial.retirement_age}
							</p>
							<p>
								<strong>Income:</strong> ${financial.income}
							</p>
							<p>
								<strong>Expenses:</strong> ${financial.expenses}
							</p>
							<p>
								<strong>Savings:</strong> ${financial.assets}
							</p>
						</div>
					</Card>

					<Card className="p-6 space-y-3">
						<h2 className="text-xl font-semibold">Genetic Longevity</h2>
						<p className="text-3xl font-bold text-blue-600">
							{genetics.longevity_score ?? 0}
						</p>
						<p className="text-sm text-muted-foreground">
							Your longevity score reflects validated SNPs associated with lifespan,
							inflammation, and cellular resilience.
						</p>
					</Card>

					{includeSpouse && (
						<Card className="p-6 space-y-3">
							<h2 className="text-xl font-semibold">Spouse / Partner</h2>
							<p className="text-2xl font-bold">{spouseAge} years</p>
							<p className="text-sm text-muted-foreground">
								Survival probabilities and estate projections include joint life
								expectancy.
							</p>
						</Card>
					)}
				</div>

				{/* MIDDLE COLUMN */}
				<div className="space-y-8">
					<EstatePlanControls
						retirementAge={retirementAge}
						includeInsurance={includeInsurance}
						includeSpouse={includeSpouse}
						spouseAge={spouseAge}
						spouseGender={spouseGender}
						setRetirementAge={setRetirementAge}
						setIncludeInsurance={setIncludeInsurance}
						setIncludeSpouse={setIncludeSpouse}
						setSpouseAge={setSpouseAge}
						setSpouseGender={setSpouseGender}
					/>

					<Card>
						<CardHeader>
							<CardTitle>Your Estate Overview</CardTitle>
						</CardHeader>
						<CardContent className="space-y-8 flex w-full flex-col">
							<p className="text-muted-foreground">
								Based on your financial profile, genetic longevity estimate, and
								(optionally) your spouse’s age, here is your personalised estate
								planning summary.
							</p>

							<p>
								Expected age at death (you):{" "}
								<strong>
									{Math.round(financial.age + genetics.longevity_score)}
								</strong>
							</p>

							<p>
								Estate at death (no insurance):{" "}
								<strong>${Math.round(500000).toLocaleString()}</strong>
							</p>

							<p>
								Estate at death (with insurance):{" "}
								<strong>${Math.round(450000).toLocaleString()}</strong>
							</p>

							<p className="text-sm text-muted-foreground">
								Total premiums paid: ${Math.round(57273).toLocaleString()}
							</p>
						</CardContent>
					</Card>
				</div>

				{/* RIGHT COLUMN — CHARTS */}
				<div className="space-y-8">
					<EstatePlanCharts
						financial={financial}
						genetics={genetics}
						spouse={{ age: spouseAge, gender: spouseGender }}
					/>
				</div>
			</div>
		</div>
	);
}
