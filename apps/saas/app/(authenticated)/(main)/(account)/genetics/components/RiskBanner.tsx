"use client";

export function RiskBanner({ score }: { score: number }) {
	let label = "Low Risk";
	let color = "bg-emerald-100 text-emerald-800 border-emerald-300";

	if (score >= 30 && score < 60) {
		label = "Moderate Risk";
		color = "bg-amber-100 text-amber-800 border-amber-300";
	}

	if (score >= 60) {
		label = "High Risk";
		color = "bg-rose-100 text-rose-800 border-rose-300";
	}

	return (
		<div className={`px-4 py-2 text-sm font-medium rounded-md border ${color}`}>{label}</div>
	);
}
