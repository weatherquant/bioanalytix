export function OverviewHeroVisual() {
	return (
		<div className="relative h-[220px] w-full overflow-hidden" aria-hidden="true">
			<svg
				viewBox="0 0 640 260"
				className="h-full w-full"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<linearGradient id="overview-path" x1="70" y1="210" x2="570" y2="50">
						<stop stopColor="#7DD3FC" />
						<stop offset="0.48" stopColor="#818CF8" />
						<stop offset="1" stopColor="#A78BFA" />
					</linearGradient>

					<radialGradient id="overview-glow">
						<stop stopColor="#93C5FD" stopOpacity="0.22" />
						<stop offset="1" stopColor="#93C5FD" stopOpacity="0" />
					</radialGradient>

					<filter id="overview-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="5" />
					</filter>
				</defs>

				<ellipse cx="325" cy="130" rx="245" ry="105" fill="url(#overview-glow)" />

				<path
					d="M72 190 C145 170 170 100 244 116 C313 131 337 190 405 151 C460 120 492 64 568 70"
					stroke="url(#overview-path)"
					strokeWidth="12"
					strokeLinecap="round"
					opacity="0.16"
					filter="url(#overview-soft-glow)"
				/>

				<path
					d="M72 190 C145 170 170 100 244 116 C313 131 337 190 405 151 C460 120 492 64 568 70"
					stroke="url(#overview-path)"
					strokeWidth="4"
					strokeLinecap="round"
				/>

				<path
					d="M92 70 C155 94 181 164 245 151 C306 139 341 75 404 103 C466 130 497 188 558 172"
					stroke="url(#overview-path)"
					strokeWidth="2.5"
					strokeLinecap="round"
					opacity="0.45"
				/>

				{[
					[92, 70, 8],
					[72, 190, 8],
					[245, 151, 9],
					[244, 116, 9],
					[404, 103, 9],
					[405, 151, 9],
					[568, 70, 8],
					[558, 172, 8],
				].map(([cx, cy, radius], index) => (
					<g key={index}>
						<circle cx={cx} cy={cy} r={radius + 7} fill="#93C5FD" opacity="0.12" />
						<circle
							cx={cx}
							cy={cy}
							r={radius}
							fill="white"
							fillOpacity="0.92"
							stroke="url(#overview-path)"
							strokeWidth="2"
						/>
					</g>
				))}

				<circle cx="325" cy="130" r="35" fill="white" fillOpacity="0.82" />
				<circle cx="325" cy="130" r="35" stroke="url(#overview-path)" strokeWidth="2.5" />

				<circle cx="325" cy="130" r="22" fill="#818CF8" fillOpacity="0.08" />

				<path
					d="M325 116 C319 116 315 121 315 127 C315 135 325 143 325 143 C325 143 335 135 335 127 C335 121 331 116 325 116Z"
					stroke="#818CF8"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	);
}
