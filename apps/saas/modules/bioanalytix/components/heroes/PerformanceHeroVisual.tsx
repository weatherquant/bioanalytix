export function PerformanceHeroVisual() {
	return (
		<svg
			viewBox="0 0 520 220"
			className="h-full w-full"
			role="img"
			aria-label="Illustration of multiple performance dimensions converging into a stronger trajectory"
		>
			<defs>
				<linearGradient id="performance-main" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0%" stopColor="#78d8ff" />
					<stop offset="55%" stopColor="#5abfff" />
					<stop offset="100%" stopColor="#718cff" />
				</linearGradient>

				<filter id="performance-glow" x="-40%" y="-40%" width="180%" height="180%">
					<feGaussianBlur stdDeviation="5" result="blur" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			{/* subtle guide lines */}
			<path d="M50 60 C145 60 190 108 260 110" fill="none" stroke="#b9e8ff" strokeWidth="2" />
			<path
				d="M50 110 C145 110 195 110 260 110"
				fill="none"
				stroke="#9edcff"
				strokeWidth="2"
			/>
			<path
				d="M50 160 C145 160 190 112 260 110"
				fill="none"
				stroke="#c5d8ff"
				strokeWidth="2"
			/>

			{/* source nodes */}
			{[
				[70, 60],
				[70, 110],
				[70, 160],
				[155, 78],
				[155, 142],
			].map(([cx, cy]) => (
				<circle
					key={`${cx}-${cy}`}
					cx={cx}
					cy={cy}
					r="6"
					fill="white"
					stroke="#67c8ff"
					strokeWidth="2"
				/>
			))}

			{/* convergence */}
			<circle
				cx="260"
				cy="110"
				r="26"
				fill="#eef8ff"
				stroke="#69caff"
				strokeWidth="2"
				filter="url(#performance-glow)"
			/>
			<circle cx="260" cy="110" r="9" fill="#6bcaff" />

			{/* forward trajectory */}
			<path
				d="M286 110 C330 108 348 88 375 78 C410 64 438 54 475 46"
				fill="none"
				stroke="url(#performance-main)"
				strokeWidth="5"
				strokeLinecap="round"
			/>

			{/* future checkpoints */}
			{[
				[330, 101],
				[375, 78],
				[425, 60],
				[475, 46],
			].map(([cx, cy]) => (
				<circle
					key={`${cx}-${cy}`}
					cx={cx}
					cy={cy}
					r="6"
					fill="white"
					stroke="#5ebfff"
					strokeWidth="2"
				/>
			))}

			{/* lower comparison trajectory */}
			<path
				d="M286 116 C335 126 372 137 414 133 C442 130 460 119 478 103"
				fill="none"
				stroke="#b8ddff"
				strokeWidth="2"
				strokeDasharray="6 7"
				strokeLinecap="round"
			/>

			<text x="48" y="194" fontSize="9" fill="#7890ad" letterSpacing="1.5">
				EVIDENCE
			</text>

			<text x="228" y="194" fontSize="9" fill="#7890ad" letterSpacing="1.5">
				PROFILE
			</text>

			<text x="421" y="194" fontSize="9" fill="#7890ad" letterSpacing="1.5">
				POTENTIAL
			</text>
		</svg>
	);
}
