"use client";

export function GeneticStrengths({ strengths }: { strengths: string[] }) {
	return (
		<div className="space-y-2">
			<h2 className="text-lg font-semibold">Genetic Strengths</h2>

			<ul className="space-y-1">
				{strengths.map((s) => (
					<li
						key={s}
						className="px-3 py-2 bg-emerald-50 border-emerald-200 text-sm text-emerald-800 rounded-md border"
					>
						{s}
					</li>
				))}
			</ul>
		</div>
	);
}
