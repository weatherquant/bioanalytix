"use client";

export function RiskBadge({ risk }: { risk: number }) {
	let color = "bg-emerald-100 text-emerald-800";
	let label = "Low";

	if (risk >= 30 && risk < 60) {
		color = "bg-amber-100 text-amber-800";
		label = "Moderate";
	}

	if (risk >= 60) {
		color = "bg-rose-100 text-rose-800";
		label = "High";
	}

	return <span className={`px-2 py-1 text-xs font-medium rounded-md ${color}`}>{label}</span>;
}
