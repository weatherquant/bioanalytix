"use client";

export function ChartLegend() {
	const items = [
		{ label: "Healthy Baseline", color: "bg-emerald-500" },
		{ label: "Your Risk", color: "bg-blue-500" },
		{ label: "High Risk Threshold", color: "bg-rose-500" },
	];

	return (
		<div className="gap-4 mt-3 flex">
			{items.map((i) => (
				<div key={i.label} className="gap-2 flex items-center">
					<span className={`h-3 w-3 rounded-sm ${i.color}`} />
					<span className="text-xs text-muted-foreground">{i.label}</span>
				</div>
			))}
		</div>
	);
}
