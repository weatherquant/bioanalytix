"use client";

export function GeneticActionBox({ risks }) {
	if (!risks || risks.length === 0) return null;

	const sorted = [...risks].sort((a, b) => b.score - a.score);
	const top = sorted[0];

	const actions = {
		"Cardiovascular Disease": [
			"Request a lipid panel annually (LDL, HDL, triglycerides).",
			"Monitor ApoB levels if available — a stronger predictor of plaque formation.",
			"Limit trans fats and reduce high-temperature seed oils (sunflower, soybean).",
		],
		"Type 2 Diabetes": [
			"Check HbA1c every 6–12 months to track glucose stability.",
			"Monitor fasting insulin — early insulin resistance often appears before glucose changes.",
			"Reduce frequent high-GI carbohydrate spikes (white rice, sweet drinks).",
		],
		"Alzheimer’s Disease": [
			"Track homocysteine levels — elevated levels correlate with cognitive decline.",
			"Ensure adequate B12 and folate intake to support methylation pathways.",
			"Limit chronic sleep deprivation — it increases amyloid accumulation.",
		],
		"Inflammatory Conditions": [
			"Monitor hs-CRP annually — a direct marker of systemic inflammation.",
			"Increase omega-3 intake (EPA/DHA) to reduce IL-6 mediated inflammation.",
			"Limit chronic UV overexposure — UV stress elevates inflammatory cytokines.",
		],
	};

	const suggestions = actions[top.disease] ?? [
		"Monitor hs-CRP annually.",
		"Maintain stable sleep and stress patterns.",
	];

	return (
		<div className="p-4 bg-purple-50 border-purple-200 rounded-lg border">
			<h3 className="font-semibold text-lg">One Action You Can Take</h3>
			<p className="text-sm mt-2 text-gray-700">
				Based on your profile, the most relevant action is:
			</p>

			<ul className="mt-3 text-sm text-purple-900 space-y-1 list-inside list-disc">
				{suggestions.map((s, i) => (
					<li key={i}>{s}</li>
				))}
			</ul>
		</div>
	);
}
