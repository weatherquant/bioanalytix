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

export default function JointSurvivalChart({ you, spouse, either, startAge }) {
	const length = Math.min(you.length, spouse.length, either.length);

	const data = Array.from({ length }).map((_, i) => ({
		age: startAge + i,
		you: you[i],
		spouse: spouse[i],
		either: either[i],
	}));

	return (
		<div style={{ width: "100%", height: 300 }}>
			<ResponsiveContainer>
				<LineChart data={data}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="age" />
					<YAxis domain={[0, 1]} />
					<Tooltip />
					<Legend />

					<Line type="monotone" dataKey="you" stroke="#2563eb" dot={false} />
					<Line type="monotone" dataKey="spouse" stroke="#10b981" dot={false} />
					<Line type="monotone" dataKey="either" stroke="#f59e0b" dot={false} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
