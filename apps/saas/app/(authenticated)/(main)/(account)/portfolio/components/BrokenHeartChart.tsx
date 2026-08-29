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

export default function BrokenHeartChart({ normal, brokenHeart, startAge }) {
	const data = normal.map((p, i) => ({
		age: startAge + i,
		normal: p,
		brokenHeart: brokenHeart[i],
	}));

	return (
		<div style={{ width: "100%", height: 300 }}>
			<ResponsiveContainer>
				<LineChart data={data} margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
					<CartesianGrid strokeDasharray="3 3" />

					<XAxis
						dataKey="age"
						tick={{ fontSize: 10 }}
						label={{
							value: "Age (yrs)",
							position: "insideBottom",
							offset: -5,
							fontSize: 12,
						}}
					/>

					<YAxis
						tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
						tick={{ fontSize: 10 }}
						label={{
							value: "Survival Probability",
							angle: -90,
							position: "outsideLeft",
							offset: 0,
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

					<Line
						type="monotone"
						dataKey="normal"
						stroke="#2563eb"
						dot={false}
						name="Normal Survival"
					/>

					<Line
						type="monotone"
						dataKey="brokenHeart"
						stroke="#dc2626"
						dot={false}
						name="Broken-Heart Survival"
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
