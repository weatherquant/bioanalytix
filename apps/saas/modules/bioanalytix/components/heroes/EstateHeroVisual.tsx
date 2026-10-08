export function EstateHeroVisual() {
	return (
		<div className="border-blue-100/80 bg-white/65 overflow-hidden rounded-2xl border">
			<svg
				viewBox="0 0 560 300"
				className="h-auto w-full"
				role="img"
				aria-label="Household resources flowing through long-term planning toward a future legacy"
			>
				<defs>
					<linearGradient id="estate-path" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="#93c5fd" stopOpacity="0.35" />
						<stop offset="50%" stopColor="#3b82f6" stopOpacity="0.75" />
						<stop offset="100%" stopColor="#2563eb" />
					</linearGradient>
				</defs>

				<text
					x="64"
					y="42"
					fill="#64748b"
					fontSize="10"
					fontWeight="700"
					letterSpacing="1.8"
				>
					TODAY
				</text>

				<text
					x="246"
					y="42"
					fill="#64748b"
					fontSize="10"
					fontWeight="700"
					letterSpacing="1.8"
				>
					PLANNING
				</text>

				<text
					x="445"
					y="42"
					fill="#64748b"
					fontSize="10"
					fontWeight="700"
					letterSpacing="1.8"
				>
					LEGACY
				</text>

				<path
					d="M116 145 C170 145 188 145 225 145"
					fill="none"
					stroke="url(#estate-path)"
					strokeWidth="2"
				/>

				<path
					d="M335 145 C382 145 397 145 437 145"
					fill="none"
					stroke="url(#estate-path)"
					strokeWidth="2"
				/>

				<circle cx="82" cy="112" r="24" fill="#eff6ff" stroke="#bfdbfe" />
				<circle cx="82" cy="178" r="24" fill="#eff6ff" stroke="#bfdbfe" />

				<path
					d="M82 101 V123 M71 112 H93"
					stroke="#2563eb"
					strokeWidth="2"
					strokeLinecap="round"
				/>

				<path
					d="M69 184 L82 170 L95 184"
					fill="none"
					stroke="#2563eb"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M73 181 V190 H91 V181"
					fill="none"
					stroke="#2563eb"
					strokeWidth="2"
					strokeLinejoin="round"
				/>

				<text
					x="82"
					y="222"
					textAnchor="middle"
					fill="#475569"
					fontSize="11"
					fontWeight="600"
				>
					RESOURCES
				</text>

				<circle cx="280" cy="145" r="55" fill="#eff6ff" stroke="#93c5fd" />

				<circle
					cx="280"
					cy="145"
					r="36"
					fill="#ffffff"
					stroke="#3b82f6"
					strokeWidth="1.5"
				/>

				<path
					d="M280 119 V145 L299 157"
					fill="none"
					stroke="#2563eb"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>

				<circle cx="280" cy="145" r="3.5" fill="#2563eb" />

				<text
					x="280"
					y="222"
					textAnchor="middle"
					fill="#475569"
					fontSize="11"
					fontWeight="600"
				>
					TIME + CHOICES
				</text>

				<circle cx="475" cy="145" r="39" fill="#dbeafe" stroke="#60a5fa" />

				<path
					d="M475 127 C462 118 449 128 452 142 C455 156 475 169 475 169 C475 169 495 156 498 142 C501 128 488 118 475 127Z"
					fill="#ffffff"
					stroke="#2563eb"
					strokeWidth="1.8"
					strokeLinejoin="round"
				/>

				<text
					x="475"
					y="222"
					textAnchor="middle"
					fill="#475569"
					fontSize="11"
					fontWeight="600"
				>
					WHAT REMAINS
				</text>

				<circle cx="145" cy="145" r="3" fill="#93c5fd" />
				<circle cx="181" cy="145" r="3" fill="#60a5fa" />
				<circle cx="375" cy="145" r="3" fill="#60a5fa" />
				<circle cx="407" cy="145" r="3" fill="#3b82f6" />

				<text x="280" y="268" textAnchor="middle" fill="#94a3b8" fontSize="10">
					Explore possibilities across a long-term planning horizon
				</text>
			</svg>
		</div>
	);
}
