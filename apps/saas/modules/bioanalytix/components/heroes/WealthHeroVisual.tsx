export function WealthHeroVisual() {
	return (
		<div className="relative h-[220px] w-full overflow-hidden" aria-hidden="true">
			<svg
				viewBox="0 0 640 260"
				className="h-full w-full"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<linearGradient id="wealth-line" x1="65" y1="205" x2="575" y2="60">
						<stop stopColor="#7DD3FC" />
						<stop offset="0.52" stopColor="#60A5FA" />
						<stop offset="1" stopColor="#818CF8" />
					</linearGradient>

					<linearGradient id="wealth-area" x1="0" y1="60" x2="0" y2="220">
						<stop stopColor="#60A5FA" stopOpacity="0.18" />
						<stop offset="1" stopColor="#60A5FA" stopOpacity="0" />
					</linearGradient>

					<filter id="wealth-glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="5" />
					</filter>
				</defs>

				{/* Horizon guides */}
				{[105, 205, 305, 405, 505].map((x) => (
					<line
						key={x}
						x1={x}
						y1="48"
						x2={x}
						y2="215"
						stroke="#93C5FD"
						strokeWidth="1"
						opacity="0.12"
					/>
				))}

				{/* Soft projection envelope */}
				<path
					d="M70 194 C135 184 180 167 230 148 C286 126 334 113 382 100 C443 83 505 72 570 63 L570 115 C510 116 454 121 398 132 C338 143 286 157 232 171 C175 186 123 198 70 204 Z"
					fill="url(#wealth-area)"
				/>

				{/* Downside trajectory */}
				<path
					d="M70 199 C135 193 180 182 230 170 C286 156 334 144 382 134 C443 121 505 116 570 114"
					stroke="#93C5FD"
					strokeWidth="2"
					strokeDasharray="6 8"
					opacity="0.45"
				/>

				{/* Main projected wealth trajectory */}
				<path
					d="M70 196 C135 185 180 166 230 147 C286 126 334 112 382 99 C443 82 505 71 570 62"
					stroke="url(#wealth-line)"
					strokeWidth="12"
					strokeLinecap="round"
					opacity="0.12"
					filter="url(#wealth-glow)"
				/>

				<path
					d="M70 196 C135 185 180 166 230 147 C286 126 334 112 382 99 C443 82 505 71 570 62"
					stroke="url(#wealth-line)"
					strokeWidth="4"
					strokeLinecap="round"
				/>

				{/* Retirement transition */}
				<line
					x1="305"
					y1="86"
					x2="305"
					y2="214"
					stroke="#818CF8"
					strokeWidth="1.5"
					strokeDasharray="4 6"
					opacity="0.5"
				/>

				<circle cx="305" cy="120" r="14" fill="#93C5FD" opacity="0.12" />

				<circle cx="305" cy="120" r="6" fill="white" stroke="#60A5FA" strokeWidth="2" />

				{/* Key points */}
				{[
					[105, 189],
					[205, 157],
					[405, 93],
					[505, 71],
				].map(([x, y]) => (
					<g key={`${x}-${y}`}>
						<circle cx={x} cy={y} r="10" fill="#93C5FD" opacity="0.1" />
						<circle cx={x} cy={y} r="5" fill="white" stroke="#60A5FA" strokeWidth="2" />
					</g>
				))}

				<text
					x="305"
					y="235"
					textAnchor="middle"
					fill="#64748B"
					fontSize="10"
					fontFamily="sans-serif"
				>
					RETIREMENT
				</text>

				<text
					x="105"
					y="235"
					textAnchor="middle"
					fill="#94A3B8"
					fontSize="10"
					fontFamily="sans-serif"
				>
					TODAY
				</text>

				<text
					x="505"
					y="235"
					textAnchor="middle"
					fill="#94A3B8"
					fontSize="10"
					fontFamily="sans-serif"
				>
					LONG LIFE
				</text>
			</svg>
		</div>
	);
}
