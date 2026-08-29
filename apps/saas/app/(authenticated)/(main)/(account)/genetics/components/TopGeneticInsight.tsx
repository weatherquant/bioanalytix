"use client";

export function TopGeneticInsight({ risks }) {
	if (!risks || risks.length === 0) return null;

	const sorted = [...risks].sort((a, b) => b.score - a.score);
	const top = sorted[0];
	const pct = Math.round(top.score * 100);

	const isLow = pct < 10;

	return (
		<div
			className={`p-4 rounded-lg border ${
				isLow ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
			}`}
		>
			<h3 className="font-semibold text-lg">
				{isLow
					? "Your genetic profile shows strong resilience"
					: "A key insight from your genetic profile"}
			</h3>

			<p className="text-sm mt-2 text-gray-700">
				{isLow
					? `You have generally low genetic risk across major disease categories. The area most worth keeping an eye on is ${top.disease}, where your risk is slightly above baseline (${pct}%).`
					: `Your highest genetic predisposition is ${top.disease}, with a risk of ${pct}%. This does not mean you will develop the condition — only that it’s worth being aware of.`}
			</p>
		</div>
	);
}
