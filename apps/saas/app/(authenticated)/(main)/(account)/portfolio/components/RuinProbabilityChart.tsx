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

export default function RuinProbabilityChart({
	baseline,
	recession,
	aggressive,
	longTerm,
	panicSell,
	contributionIncrease,
}) {
	const arrays = [
		baseline,
		recession,
		aggressive,
		longTerm,
		panicSell,
		contributionIncrease,
	].filter((a) => Array.isArray(a) && a.length > 0);

	const length = Math.min(...arrays.map((a) => a.length));

	const data = Array.from({ length }).map((_, i) => ({
		allocation: i * 5,
		baseline: baseline?.[i] ?? 0,
		recession: recession?.[i] ?? 0,
		aggressive: aggressive?.[i] ?? 0,
		longTerm: longTerm?.[i] ?? 0,
		panicSell: panicSell?.[i] ?? 0,
		contributionIncrease: contributionIncrease?.[i] ?? 0,
	}));

	return (
		<div style={{ width: "100%", height: 320 }}>
			<ResponsiveContainer>
				<LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="allocation" />
					<YAxis />
					<Tooltip />
					<Legend />

					<Line type="monotone" dataKey="baseline" stroke="#10b981" dot={false} />
					<Line type="monotone" dataKey="recession" stroke="#ef4444" dot={false} />
					<Line type="monotone" dataKey="aggressive" stroke="#f59e0b" dot={false} />
					<Line type="monotone" dataKey="longTerm" stroke="#8b5cf6" dot={false} />
					<Line type="monotone" dataKey="panicSell" stroke="#e11d48" dot={false} />
					<Line type="monotone" dataKey="contribIncrease" stroke="#22c55e" dot={false} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
