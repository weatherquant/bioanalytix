"use client";

export function GeneticAgeIndicator({ geneticAge, chronologicalAge }) {
	if (!geneticAge) return null;

	const diff = geneticAge - chronologicalAge;

	const status =
		diff <= -3
			? "You appear genetically younger than your age."
			: diff <= 2
				? "Your genetic age aligns closely with your actual age."
				: "Your genetic age is slightly above your chronological age.";

	const color =
		diff <= -3
			? "bg-green-50 border-green-200 text-green-800"
			: diff <= 2
				? "bg-blue-50 border-blue-200 text-blue-800"
				: "bg-yellow-50 border-yellow-200 text-yellow-800";

	return (
		<div className={`p-3 rounded border ${color}`}>
			<div className="text-sm font-semibold">Genetic Age Estimate</div>
			<div className="text-lg font-bold mt-1">{geneticAge} years</div>
			<div className="text-xs mt-1">{status}</div>
			<div className="text-xs text-gray-600 mt-2">
				Genetic age reflects how your DNA markers relate to population-level aging patterns,
				including inflammation, metabolic stability, and cellular repair efficiency.
			</div>
		</div>
	);
}
