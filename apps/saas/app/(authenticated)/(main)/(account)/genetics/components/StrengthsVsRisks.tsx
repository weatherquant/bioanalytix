"use client";

export function StrengthsVsRisks({ risks }) {
	const strengths = risks.filter((r) => r.label === "low").length;
	const elevated = risks.filter((r) => r.label === "elevated").length;

	return (
		<div className="p-4 bg-gray-50 rounded-lg border">
			<h3 className="font-semibold text-lg">Strengths vs Risks</h3>

			<div className="mt-3 space-y-2">
				<div>
					<span className="text-sm font-medium">Genetic Strengths</span>
					<div className="h-3 bg-green-200 rounded mt-1">
						<div
							className="h-3 bg-green-600 rounded"
							style={{ width: `${strengths * 25}%` }}
						/>
					</div>
				</div>

				<div>
					<span className="text-sm font-medium">Elevated Risks</span>
					<div className="h-3 bg-red-200 rounded mt-1">
						<div
							className="h-3 bg-red-600 rounded"
							style={{ width: `${elevated * 25}%` }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
