"use client";

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	ResponsiveContainer,
} from "recharts";

export default function SurvivalCurveChart({ survival, startAge }) {
	// Extend survival curve to age 100
	const lastAge = startAge + survival.length - 1;
	const extraYears = Math.max(0, 100 - lastAge);

	const survivalExtended = survival.concat(Array.from({ length: extraYears }).map(() => 0));

	const data = survivalExtended.map((aliveProb, i) => ({
		age: startAge + i,
		survival: aliveProb,
	}));

	return (
		<div style={{ width: "100%", height: 300 }}>
			<ResponsiveContainer>
				<LineChart
					data={data}
					margin={{ top: 20, right: 30, left: 40, bottom: 20 }} // ← increased left margin
				>
					<CartesianGrid strokeDasharray="3 3" />

					<XAxis
						dataKey="age"
						tick={{ fontSize: 10 }}
						label={{
							value: "Age (yrs)",
							position: "insideBottom",
							offset: -5,
							fontSize: 14,
						}}
					/>

					<YAxis
						tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
						tick={{ fontSize: 10 }}
						label={{
							value: "Survival Probability",
							angle: -90,
							position: "outsideLeft",
							offset: 0, // pushed down
							fontSize: 12,
						}}
					/>

					<Tooltip
						formatter={(v) => `${(v * 100).toFixed(1)}%`}
						labelFormatter={(label) => `Age ${label}`}
						contentStyle={{ fontSize: 11 }}
						itemStyle={{ fontSize: 11 }}
						labelStyle={{ fontSize: 11 }}
					/>

					<Line type="monotone" dataKey="survival" stroke="#2563eb" dot={false} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
