"use client";

import React from "react";

interface LongevityGaugeProps {
	score: number; // 0–1
}

export function LongevityGauge({ score }: LongevityGaugeProps) {
	const safeScore = typeof score === "number" && !isNaN(score) ? score : 0;

	const pct = Math.round(safeScore * 100);
	const radius = 60;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (pct / 100) * circumference;

	return (
		<div className="gap-4 p-6 flex flex-col items-center">
			<div className="w-40 h-40 relative">
				<svg className="h-full w-full" viewBox="0 0 150 150">
					{/* Background circle */}
					<circle
						cx="75"
						cy="75"
						r={radius}
						stroke="#e5e7eb"
						strokeWidth="12"
						fill="none"
					/>

					{/* Progress circle */}
					<circle
						cx="75"
						cy="75"
						r={radius}
						stroke="#4ade80"
						strokeWidth="12"
						fill="none"
						strokeDasharray={circumference}
						strokeDashoffset={offset}
						strokeLinecap="round"
						transform="rotate(-90 75 75)"
						style={{ transition: "stroke-dashoffset 1s ease" }}
					/>
				</svg>

				{/* Center text */}
				<div className="inset-0 absolute flex flex-col items-center justify-center">
					<span className="text-3xl font-bold">{pct}</span>
					<span className="text-sm text-gray-500">Longevity</span>
				</div>
			</div>

			<p className="text-gray-600 max-w-xs text-center">
				Your longevity score is based on FOXO3, IL6, APOE and other validated SNPs
				associated with lifespan, inflammation, and cellular resilience.
			</p>
		</div>
	);
}
