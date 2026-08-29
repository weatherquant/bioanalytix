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

export default function RecessionImpactChart({ baseline, shocked, startAge }) {
	const length = Math.min(baseline.length, shocked.length);

	const data = Array.from({ length }).map((_, i) => ({
		age: startAge + i,
		baseline: baseline[i],
		shocked: shocked[i],
	}));

	return (
		<div style={{ width: "100%", height: 320 }}>
			<ResponsiveContainer>
				<LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="age" />
					<YAxis />
					<Tooltip />
					<Legend />

					<Line type="monotone" dataKey="baseline" stroke="#10b981" dot={false} />
					<Line type="monotone" dataKey="shocked" stroke="#ef4444" dot={false} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
