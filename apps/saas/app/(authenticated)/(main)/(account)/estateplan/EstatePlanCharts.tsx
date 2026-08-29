"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/components/card";
import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

import { runEstatePlanModel } from "@/modules/estate/engine";

function simpleSurvivalProb(age: number, targetAge: number, baseLife: number) {
	const remaining = baseLife - age;
	const horizon = targetAge - age;
	if (horizon <= 0) return 1;
	if (remaining <= 0) return 0.1;
	const ratio = horizon / remaining;
	return Math.max(0, Math.min(1, 1 - ratio * 0.8));
}

function gompertzSurvival(age: number, targetAge: number, gender: "male" | "female") {
	// Gompertz–Makeham parameters (approximate)
	const A = 0.00045; // baseline mortality
	const B = gender === "male" ? 0.085 : 0.075; // male mortality grows faster
	const C = 0.0001; // age‑independent Makeham term

	if (targetAge <= age) return 1;

	let integral = 0;
	for (let x = age; x < targetAge; x++) {
		const mx = A * Math.exp(B * (x - 30)) + C;
		integral += mx;
	}

	return Math.exp(-integral);
}

export default function EstatePlanCharts({ financial, genetics, spouse }) {
	const includeSpouse = !!spouse;
	const spouseAge = spouse?.age ?? financial.age;

	const result = useMemo(() => {
		return runEstatePlanModel({
			financial,
			genetics,
			retirementAge: financial.retirement_age,
			includeInsurance: true,
			termInsuranceEndAge: financial.retirement_age,
			sumInsured: 500_000,
			baseAnnualPremium: 1_200,
			premiumGrowthRate: 0.05,
		});
	}, [financial, genetics]);

	const survivalData = useMemo(() => {
		const genderYou = genetics.gender ?? "male"; // or store gender in profile
		const genderSpouse = spouse?.gender ?? "female"; // default assumption

		const points = [];

		for (let age = financial.age; age <= 100; age += 1) {
			const pYou = gompertzSurvival(financial.age, age, genderYou);
			const pSpouse = includeSpouse ? gompertzSurvival(spouseAge, age, genderSpouse) : 0;

			const atLeastOne = includeSpouse ? 1 - (1 - pYou) * (1 - pSpouse) : pYou;

			points.push({
				age,
				you: pYou * 100,
				spouse: pSpouse * 100,
				atLeastOne: atLeastOne * 100,
			});
		}

		return points;
	}, [financial.age, spouseAge, includeSpouse, genetics.gender, spouse?.gender]);

	const wealthData = useMemo(() => {
		return result.wealthPath.map((p) => {
			const youWealth = p.wealth;

			const spouseWealth = includeSpouse
				? (p.spouseWealth ?? youWealth * 0.8) // fallback if model doesn't produce spouse wealth
				: 0;

			const combined = includeSpouse ? youWealth + spouseWealth : youWealth;

			return {
				age: p.age,
				you: youWealth,
				spouse: spouseWealth,
				combined,
			};
		});
	}, [result.wealthPath, includeSpouse]);

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<CardTitle>Survival Probabilities</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={260}>
						<LineChart data={survivalData}>
							<XAxis
								dataKey="age"
								tick={{ fontSize: 10 }} // ← smaller tick labels
								style={{ fontSize: 12 }} // ← smaller axis label
							/>

							<YAxis
								unit="%"
								tick={{ fontSize: 10 }} // ← smaller tick labels
								style={{ fontSize: 12 }} // ← smaller axis label
							/>

							<Tooltip
								formatter={(value, name) => {
									// value is a number like 87.234234
									return [`${value.toFixed(1)}%`, name];
								}}
								labelFormatter={(label) => `Age ${label}`}
								contentStyle={{
									fontSize: 14, // ← shrink tooltip box text
									padding: 8,
								}}
								itemStyle={{
									fontSize: 14, // ← shrink each row inside tooltip
								}}
								labelStyle={{
									fontSize: 14, // ← shrink the label (Age XX)
								}}
							/>

							<Legend
								wrapperStyle={{
									fontSize: 14, // ← smaller legend text
									paddingTop: 6, // ← optional: adds breathing room
								}}
							/>

							<Line
								type="monotone"
								dataKey="you"
								stroke="#4f46e5"
								dot={{ r: 2 }} // ← small dot
								activeDot={{ r: 4 }} // ← small hover dot
							/>
							{includeSpouse && (
								<Line
									type="monotone"
									dataKey="spouse"
									stroke="#10b981"
									dot={{ r: 2 }}
									activeDot={{ r: 4 }}
								/>
							)}
							{includeSpouse && (
								<Line
									type="monotone"
									dataKey="atLeastOne"
									stroke="#f59e0b"
									dot={{ r: 2 }}
									activeDot={{ r: 4 }}
								/>
							)}
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Wealth Trajectory</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={260}>
						<LineChart data={wealthData}>
							<XAxis dataKey="age" tick={{ fontSize: 10 }} style={{ fontSize: 12 }} />

							<YAxis tick={{ fontSize: 10 }} style={{ fontSize: 12 }} />

							<Tooltip
								formatter={(value, name) => {
									// value is a number like 1234567.234234
									return [`$${Math.round(value).toLocaleString()}`, name];
								}}
								labelFormatter={(label) => `Age ${label}`}
								contentStyle={{
									fontSize: 14,
									padding: 8,
								}}
								itemStyle={{
									fontSize: 14,
								}}
								labelStyle={{
									fontSize: 14,
								}}
							/>

							<Legend
								wrapperStyle={{
									fontSize: 14,
									paddingTop: 8,
								}}
							/>

							<Line
								type="monotone"
								dataKey="you"
								stroke="#4f46e5"
								dot={{ r: 2 }}
								activeDot={{ r: 4 }}
							/>
							{includeSpouse && (
								<Line
									type="monotone"
									dataKey="spouse"
									stroke="#10b981"
									dot={{ r: 2 }}
									activeDot={{ r: 4 }}
								/>
							)}
							{includeSpouse && (
								<Line
									type="monotone"
									dataKey="combined"
									stroke="#f59e0b"
									dot={{ r: 2 }}
									activeDot={{ r: 4 }}
								/>
							)}
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</div>
	);
}
