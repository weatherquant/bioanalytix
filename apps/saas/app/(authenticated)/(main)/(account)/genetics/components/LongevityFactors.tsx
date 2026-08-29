"use client";

export function LongevityFactors({ factors }: { factors: { label: string; score: number }[] }) {
	return (
		<div className="space-y-2">
			<h2 className="text-lg font-semibold">Longevity Factors</h2>

			<div className="space-y-3">
				{factors.map((f) => (
					<div key={f.label} className="flex items-center justify-between">
						<span className="text-sm">{f.label}</span>
						<span className="text-sm font-medium">{f.score}%</span>
					</div>
				))}
			</div>
		</div>
	);
}
