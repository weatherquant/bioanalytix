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

type StrategyCurve = {
	name: string;
	color: string;
	growthAlloc: number; // 0–1
};

const STRATEGIES: StrategyCurve[] = [
	{ name: "Defensive (20% growth)", color: "#6b7280", growthAlloc: 0.2 },
	{ name: "Balanced (50% growth)", color: "#0ea5e9", growthAlloc: 0.5 },
	{ name: "Growth (80% growth)", color: "#f97316", growthAlloc: 0.8 },
];

export default function AllocationDistressChart({
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

	function simulateStrategy(growthAlloc: number) {
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
			return {
				assetsPath: Array.from({ length: yearsDec + 1 }).map(() => assetsAtRetirement),
				withdrawal: pensionFloor,
			};
		}

		// Level withdrawal that exhausts assets over yearsDec
		const withdrawal = assetsAtRetirement * (r / (1 - Math.pow(1 + r, -yearsDec)));

		const withdrawalFinal = Math.max(withdrawal, pensionFloor);

		// Build decumulation path
		const assetsPath: number[] = [];
		let wDec = assetsAtRetirement;

		for (let y = 0; y <= yearsDec; y++) {
			assetsPath.push(wDec);
			wDec = wDec * (1 + r) - withdrawalFinal;
			if (wDec < 0) wDec = 0;
		}

		return { assetsPath, withdrawal: withdrawalFinal };
	}

	// Build chart data: age vs Years of Income Remaining for each strategy
	const data: any[] = [];
	for (let y = 0; y <= yearsDec; y++) {
		const currentAge = retirementAge + y;

		const point: any = { age: currentAge };

		STRATEGIES.forEach((s) => {
			const { assetsPath, withdrawal } = simulateStrategy(s.growthAlloc);
			const portfolio = assetsPath[y];
			const yir = withdrawal > 0 ? portfolio / withdrawal : 0; // Years of Income Remaining

			point[s.name] = yir;
		});

		data.push(point);
	}

	return (
		<div style={{ width: "100%", height: 320 }}>
			<ResponsiveContainer>
				<LineChart data={data} margin={{ top: 20, right: 30, left: 65, bottom: 20 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis
						dataKey="age"
						tick={{ fontSize: 11 }}
						label={{ value: "Age", position: "insideBottom", offset: -5, fontSize: 14 }}
					/>
					<YAxis
						tick={{ fontSize: 11 }}
						label={{
							value: "Years of Income Remaining",
							angle: -90,
							position: "outsideLeft",
							offset: 40,
							fontSize: 12,
						}}
						tickFormatter={(v) => v.toFixed(1)}
					/>
					<Tooltip
						formatter={(v) => `${v.toFixed(1)} years`}
						labelFormatter={(label) => `Age ${label}`}
						contentStyle={{ fontSize: 11 }}
						itemStyle={{ fontSize: 11 }}
						labelStyle={{ fontSize: 11 }}
					/>
					<Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

					{STRATEGIES.map((s) => (
						<Line
							key={s.name}
							type="monotone"
							dataKey={s.name}
							stroke={s.color}
							strokeWidth={2}
							dot={false}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
