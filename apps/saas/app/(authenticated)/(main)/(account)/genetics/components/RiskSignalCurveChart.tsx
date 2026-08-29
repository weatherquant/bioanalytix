"use client";

import { useState, useEffect } from "react";

export function RiskSignalCurveChart({ risks, geneticAge }) {
	// 1️⃣ Hooks ALWAYS run first
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const [animatedPoints, setAnimatedPoints] = useState([]);

	const abbreviate = (label: string) => {
		return label
			.replace("Cardiovascular Disease", "CVD")
			.replace("Type 2 Diabetes", "T2D")
			.replace("Alzheimer’s Disease", "ALZ")
			.replace("Inflammatory Conditions", "INF")
			.slice(0, 10);
	};

	// 2️⃣ Compute points
	const points = risks.map((r, i) => ({
		x: i,
		y: r.score * 100,
		label: r.disease,
		shortLabel: abbreviate(r.disease),
		explanation: r.explanation,
	}));

	// ❗ DO NOT RETURN BEFORE HOOKS
	const hasPoints = points.length > 0;

	// Animation: ease-in curve growth ALWAYS runs — even when no points
	useEffect(() => {
		if (!hasPoints) {
			setAnimatedPoints([]);
			return;
		}
		let frame = 0;
		const totalFrames = 30;

		const animate = () => {
			frame++;
			const progress = frame / totalFrames;
			const eased = progress < 1 ? Math.pow(progress, 1.5) : 1;

			setAnimatedPoints(
				points.map((p) => ({
					...p,
					yAnimated: p.y * eased,
				})),
			);

			if (frame < totalFrames) requestAnimationFrame(animate);
		};

		animate();
	}, [hasPoints, risks]);

	// 4️⃣ NOW safely return early
	if (points.length === 0) return null;

	// 5️⃣ Chart math
	const maxY = 20; // fixed low-risk range
	const width = 380;
	const height = 260;
	const chartLeft = 50;
	const chartRight = width - 20;
	const chartTop = 20;
	const chartBottom = height - 50;

	const usableWidth = chartRight - chartLeft;
	const usableHeight = chartBottom - chartTop;

	const scaleX = (i: number) =>
		chartLeft +
		(points.length === 1 ? usableWidth / 2 : (i / (points.length - 1)) * usableWidth);

	const scaleY = (v: number) => chartBottom - (v / maxY) * usableHeight;

	const highest = points.reduce((a, b) => (a.y > b.y ? a : b), points[0]);

	return (
		<div className="space-y-3 relative">
			{/* Highest-risk callout */}
			<div className="p-3 rounded bg-blue-50 border-blue-200 text-sm border">
				<strong>Your highest genetic risk:</strong> {highest.label} ({Math.round(highest.y)}
				%)
			</div>

			{/* Genetic age indicator */}
			{geneticAge && (
				<div className="p-2 rounded bg-purple-50 border-purple-200 text-xs text-purple-800 border">
					Genetic Age Estimate: <strong>{geneticAge} years</strong>
				</div>
			)}

			<svg viewBox={`0 0 ${width} ${height}`} className="h-60 w-full">
				{/* Population percentile shading */}
				<rect
					x={chartLeft}
					y={chartTop}
					width={usableWidth}
					height={usableHeight}
					fill="url(#percentileGradient)"
					opacity="0.25"
				/>

				<defs>
					<linearGradient id="percentileGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#d1fae5" /> {/* 0–5th percentile */}
						<stop offset="50%" stopColor="#fef9c3" /> {/* 50th percentile */}
						<stop offset="100%" stopColor="#fee2e2" /> {/* 95th percentile */}
					</linearGradient>
				</defs>

				{/* SAFE / MODERATE / ELEVATED ZONES */}
				<rect
					x={chartLeft}
					y={chartTop + (2 * usableHeight) / 3}
					width={usableWidth}
					height={usableHeight / 3}
					fill="#d1fae5" // green zone (low)
					opacity="0.5"
				/>
				<rect
					x={chartLeft}
					y={chartTop + usableHeight / 3}
					width={usableWidth}
					height={usableHeight / 3}
					fill="#fef9c3" // yellow zone (moderate)
					opacity="0.5"
				/>
				<rect
					x={chartLeft}
					y={chartTop}
					width={usableWidth}
					height={usableHeight / 3}
					fill="#fee2e2" // red zone (high)
					opacity="0.5"
				/>

				{/* Axes */}
				<line
					x1={chartLeft}
					y1={chartBottom}
					x2={chartRight}
					y2={chartBottom}
					stroke="#ccc"
				/>
				<line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartBottom} stroke="#ccc" />

				{/* Y-axis ticks */}
				{[0, 2, 5, 10, 15, 20].map((t) => (
					<text
						key={t}
						x={chartLeft - 6}
						y={scaleY(t)}
						fontSize="10"
						textAnchor="end"
						fill="#555"
					>
						{t}%
					</text>
				))}

				{/* Baseline comparison line (5%) */}
				<line
					x1={chartLeft}
					y1={scaleY(5)}
					x2={chartRight}
					y2={scaleY(5)}
					stroke="#6b7280"
					strokeDasharray="4"
				/>
				<text x={chartRight} y={scaleY(5) - 4} fontSize="9" textAnchor="end" fill="#6b7280">
					Healthy Baseline (5%)
				</text>

				{/* Animated curve */}
				<polyline
					fill="none"
					stroke="#2563eb"
					strokeWidth="3"
					points={animatedPoints
						.map((p, i) => `${scaleX(i)},${scaleY(p.yAnimated)}`)
						.join(" ")}
				/>

				{/* Points */}
				{animatedPoints.map((p, i) => (
					<g key={p.label}>
						<circle
							cx={scaleX(i)}
							cy={scaleY(p.yAnimated)}
							r={hoverIndex === i ? 6 : 4}
							fill={p.label === highest.label ? "#dc2626" : "#2563eb"}
							onMouseEnter={() => setHoverIndex(i)}
							onMouseLeave={() => setHoverIndex(null)}
							style={{ cursor: "pointer" }}
						/>

						{/* X-axis labels */}
						<text
							x={scaleX(i)}
							y={chartBottom + 15}
							textAnchor="middle"
							fontSize="8"
							fill="#444"
						>
							{p.shortLabel}
						</text>
					</g>
				))}
			</svg>

			{/* Tooltip */}
			{hoverIndex !== null && (
				<div className="mt-1 p-3 rounded bg-white shadow text-sm border">
					<strong>{points[hoverIndex].label}</strong>: {Math.round(points[hoverIndex].y)}%
					<div className="text-xs text-gray-600 mt-1">
						{points[hoverIndex].explanation}
					</div>
				</div>
			)}

			{/* Legend */}
			<div className="gap-4 text-xs text-gray-700 mt-2 flex items-center justify-center">
				<div className="gap-1 flex items-center">
					<span
						className="w-3 h-3 rounded-sm"
						style={{ backgroundColor: "#d1fae5" }}
					></span>
					Low
				</div>
				<div className="gap-1 flex items-center">
					<span
						className="w-3 h-3 rounded-sm"
						style={{ backgroundColor: "#fef9c3" }}
					></span>
					Moderate
				</div>
				<div className="gap-1 flex items-center">
					<span
						className="w-3 h-3 rounded-sm"
						style={{ backgroundColor: "#fee2e2" }}
					></span>
					Elevated
				</div>
			</div>
		</div>
	);
}
