"use client";

export function DiseaseRiskBarsEnhanced({ risks }) {
	return (
		<div className="space-y-4">
			{risks.map((r) => (
				<div key={r.disease}>
					<div className="mb-1 flex justify-between">
						<span className="font-medium capitalize">{r.disease}</span>
						<span className="text-sm text-gray-600">{Math.round(r.score * 100)}%</span>
					</div>

					<div className="h-3 bg-gray-200 rounded">
						<div
							className="h-3 rounded bg-blue-600"
							style={{ width: `${Math.round(r.score * 100)}%` }}
						/>
					</div>

					<p className="text-xs text-gray-500 mt-1">{r.explanation}</p>
				</div>
			))}
		</div>
	);
}
