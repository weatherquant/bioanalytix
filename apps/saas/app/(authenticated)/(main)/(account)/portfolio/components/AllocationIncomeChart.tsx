"use client";

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	ResponsiveContainer,
	Legend,
} from "recharts";

type FinancialProfile = {
	age: number;
	retirementAge: number;
	assets: number;
	income: number;
};

export default function AllocationIncomeChart({
	financial,
	lifeExpect = 90,
}: {
	financial: FinancialProfile;
	lifeExpect?: number;
}) {
	const pensionFloor = 28514; // annual Age Pension (single)

	const { age, retirementAge, assets, income } = financial;

	const yearsAcc = Math.max(0, retirementAge - age);
	const yearsDec = Math.max(1, lifeExpect - retirementAge);

	function simulateSustainableIncome(growthAlloc: number) {
		const rGrowth = 0.09;
		const rDefensive = 0.05;
		const r = growthAlloc * rGrowth + (1 - growthAlloc) * rDefensive;

		// Accumulation phase
		let w = assets;
		const contrib = income * 0.12;

		for (let y = 0; y < yearsAcc; y++) {
			w = w * (1 + r) + contrib;
		}

		const assetsAtRetirement = w;

		// If return is very low, avoid division issues
		if (r <= 0) {
			return pensionFloor;
		}

		// Decumulation: level payment that exhausts assets over yearsDec
		const payment = assetsAtRetirement * (r / (1 - Math.pow(1 + r, -yearsDec)));

		// Apply pension floor
		return Math.max(payment, pensionFloor);
	}

	const data = Array.from({ length: 21 }).map((_, i) => {
		const alloc = i * 0.05; // 0 → 1 in 5% steps
		const incomeSust = simulateSustainableIncome(alloc);

		return {
			allocation: alloc * 100, // percent
			income: incomeSust,
		};
	});

	return (
		<div style={{ width: "100%", height: 320 }}>
			<ResponsiveContainer>
				<LineChart data={data} margin={{ top: 20, right: 30, left: 65, bottom: 20 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis
						dataKey="allocation"
						tick={{ fontSize: 11 }}
						label={{
							value: "Growth Allocation (%)",
							position: "insideBottom",
							offset: -5,
							fontSize: 14,
						}}
					/>
					<YAxis
						tickFormatter={(v) => `$${Math.round(v).toLocaleString()}`}
						tick={{ fontSize: 11 }}
						label={{
							value: "Sustainable Income ($/yr)",
							angle: -90,
							position: "outsideLeft",
							offset: 40,
							fontSize: 12,
						}}
					/>
					<Tooltip
						formatter={(v) => `$${Math.round(v).toLocaleString()}`}
						contentStyle={{ fontSize: 11 }}
						itemStyle={{ fontSize: 11 }}
						labelStyle={{ fontSize: 11 }}
					/>
					<Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

					<Line
						type="monotone"
						dataKey="income"
						stroke="#16a34a"
						strokeWidth={2}
						dot={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
