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

export default function ProjectedWealthChart(props) {
	const {
		p25,
		p50,
		p75,
		baseline,
		recession,
		aggressive,
		longTerm,
		panicSell,
		contributionIncrease,
		startAge,
	} = props;

	if (!p50 || !baseline) return null;

	// Align lengths
	const arrays = [
		p25,
		p50,
		p75,
		baseline,
		recession?.shocked,
		aggressive,
		longTerm,
		panicSell,
		contributionIncrease,
	].filter(Boolean);

	const length = Math.min(...arrays.map((a) => a.length));

	const data = Array.from({ length }).map((_, i) => ({
		age: startAge + i,
		p25: p25[i],
		p50: p50[i],
		p75: p75[i],
		baseline: baseline[i],
		recession: recession?.shocked ? recession.shocked[i] : null,
		aggressive: aggressive ? aggressive[i] : null,
		longTerm: longTerm ? longTerm[i] : null,
		panicSell: panicSell ? panicSell[i] : null,
		contribIncrease: contributionIncrease ? contributionIncrease[i] : null,
	}));

	return (
		<div style={{ width: "100%", height: 320 }}>
			<ResponsiveContainer>
				<LineChart data={data} margin={{ top: 20, right: 30, left: 65, bottom: 20 }}>
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
						tickFormatter={(v) => `$${Math.round(v).toLocaleString()}`}
						tick={{ fontSize: 11 }}
						label={{
							value: "Wealth ($)",
							angle: -90,
							position: "outsideLeft",
							offset: 25,
							fontSize: 12,
						}}
					/>
					<Tooltip
						formatter={(v) => `$${Math.round(v).toLocaleString()}`}
						labelFormatter={(label) => `Age ${label}`}
						contentStyle={{ fontSize: 11 }}
						itemStyle={{ fontSize: 11 }}
						labelStyle={{ fontSize: 11 }}
					/>
					<Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

					<Line type="monotone" dataKey="p25" stroke="#0ea5e9" dot={false} />
					<Line type="monotone" dataKey="p50" stroke="#2563eb" dot={false} />
					<Line
						type="monotone"
						dataKey="p75"
						stroke="#0ea5e9"
						strokeDasharray="5 5"
						dot={false}
					/>

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
