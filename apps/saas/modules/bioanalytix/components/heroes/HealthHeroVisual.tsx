export function HealthHeroVisual() {
	return (
		<div className="relative h-[220px] w-full overflow-hidden" aria-hidden="true">
			<svg
				viewBox="0 0 640 260"
				className="h-full w-full"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<linearGradient id="health-signal" x1="65" y1="130" x2="575" y2="130">
						<stop stopColor="#7DD3FC" />
						<stop offset="0.5" stopColor="#818CF8" />
						<stop offset="1" stopColor="#A78BFA" />
					</linearGradient>

					<radialGradient id="health-glow">
						<stop stopColor="#93C5FD" stopOpacity="0.22" />
						<stop offset="1" stopColor="#93C5FD" stopOpacity="0" />
					</radialGradient>

					<filter id="health-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="5" />
					</filter>
				</defs>

				<ellipse cx="320" cy="130" rx="245" ry="100" fill="url(#health-glow)" />

				<path
					d="M65 136 H155 L178 136 L198 92 L224 178 L250 119 L270 136 H350"
					stroke="url(#health-signal)"
					strokeWidth="11"
					strokeLinecap="round"
					strokeLinejoin="round"
					opacity="0.12"
					filter="url(#health-soft-glow)"
				/>

				<path
					d="M65 136 H155 L178 136 L198 92 L224 178 L250 119 L270 136 H350"
					stroke="url(#health-signal)"
					strokeWidth="4"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>

				<path
					d="M350 136 C380 136 389 101 419 101 C449 101 458 136 488 136 C518 136 527 101 557 101"
					stroke="url(#health-signal)"
					strokeWidth="3"
					strokeLinecap="round"
					opacity="0.65"
				/>

				<path
					d="M350 136 C380 136 389 171 419 171 C449 171 458 136 488 136 C518 136 527 171 557 171"
					stroke="url(#health-signal)"
					strokeWidth="2"
					strokeLinecap="round"
					opacity="0.32"
				/>

				{[
					[350, 136],
					[419, 101],
					[419, 171],
					[488, 136],
					[557, 101],
					[557, 171],
				].map(([cx, cy], index) => (
					<g key={index}>
						<circle cx={cx} cy={cy} r="12" fill="#93C5FD" opacity="0.1" />
						<circle
							cx={cx}
							cy={cy}
							r="6"
							fill="white"
							fillOpacity="0.94"
							stroke="url(#health-signal)"
							strokeWidth="2"
						/>
					</g>
				))}

				<circle
					cx="224"
					cy="178"
					r="7"
					fill="white"
					stroke="url(#health-signal)"
					strokeWidth="2"
				/>
			</svg>
		</div>
	);
}
