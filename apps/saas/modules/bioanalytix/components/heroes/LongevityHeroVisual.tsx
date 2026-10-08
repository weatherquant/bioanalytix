export function LongevityHeroVisual() {
	return (
		<div className="relative h-[220px] w-full overflow-hidden" aria-hidden="true">
			<svg
				viewBox="0 0 640 260"
				className="h-full w-full"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<linearGradient id="longevity-path" x1="65" y1="185" x2="575" y2="70">
						<stop stopColor="#7DD3FC" />
						<stop offset="0.52" stopColor="#818CF8" />
						<stop offset="1" stopColor="#A78BFA" />
					</linearGradient>

					<radialGradient id="longevity-glow">
						<stop stopColor="#93C5FD" stopOpacity="0.22" />
						<stop offset="1" stopColor="#93C5FD" stopOpacity="0" />
					</radialGradient>

					<filter id="longevity-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="5" />
					</filter>
				</defs>

				<ellipse cx="325" cy="130" rx="245" ry="100" fill="url(#longevity-glow)" />

				{/* Soft underlying trajectory */}
				<path
					d="M70 185 C145 181 183 161 235 142 C292 121 330 105 382 94 C445 81 505 78 570 72"
					stroke="url(#longevity-path)"
					strokeWidth="12"
					strokeLinecap="round"
					opacity="0.13"
					filter="url(#longevity-soft-glow)"
				/>

				{/* Healthspan trajectory */}
				<path
					d="M70 185 C145 181 183 161 235 142 C292 121 330 105 382 94 C445 81 505 78 570 72"
					stroke="url(#longevity-path)"
					strokeWidth="4"
					strokeLinecap="round"
				/>

				{/* Later-life uncertainty / alternative path */}
				<path
					d="M382 94 C431 100 472 119 505 145 C530 165 548 181 570 188"
					stroke="url(#longevity-path)"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeDasharray="6 8"
					opacity="0.42"
				/>

				{/* Age horizon guides */}
				{[
					[150, 168, "65"],
					[280, 125, "75"],
					[410, 89, "85"],
					[535, 76, "95+"],
				].map(([x, y, label]) => (
					<g key={label}>
						<line
							x1={x}
							y1={Number(y) + 13}
							x2={x}
							y2="214"
							stroke="#93C5FD"
							strokeWidth="1"
							opacity="0.2"
						/>

						<circle cx={x} cy={y} r="12" fill="#93C5FD" opacity="0.1" />

						<circle
							cx={x}
							cy={y}
							r="6"
							fill="white"
							fillOpacity="0.95"
							stroke="url(#longevity-path)"
							strokeWidth="2"
						/>

						<text
							x={x}
							y="232"
							textAnchor="middle"
							fill="#64748B"
							fontSize="11"
							fontFamily="sans-serif"
						>
							{label}
						</text>
					</g>
				))}

				<text
					x="150"
					y="248"
					textAnchor="middle"
					fill="#94A3B8"
					fontSize="9"
					fontFamily="sans-serif"
				>
					AGE
				</text>
			</svg>
		</div>
	);
}
