"use client";

export function GeneticProfileSummary({ risks, longevityScore }) {
	const avgRisk = risks.reduce((acc, r) => acc + r.score, 0) / risks.length;
	const avgPct = Math.round(avgRisk * 100);

	return (
		<div className="p-4 bg-blue-50 border-blue-200 rounded-lg border">
			<h3 className="font-semibold text-lg">Your Genetic Profile Summary</h3>

			<p className="text-sm mt-2 text-gray-700 leading-relaxed">
				Overall, your genetic risk pattern is{" "}
				{avgPct < 10 ? "low" : avgPct < 20 ? "moderate" : "elevated"}. Your longevity
				markers suggest a lifespan tendency that is{" "}
				{longevityScore > 60 ? "above average" : "within normal range"}. Most importantly,
				your genetic profile highlights a stable foundation for long-term health, with only
				mild variations worth monitoring.
			</p>
		</div>
	);
}
