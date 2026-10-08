export function ResearchHeroVisual() {
	return (
		<div className="border-blue-100/80 bg-white/65 overflow-hidden rounded-2xl border">
			<svg
				viewBox="0 0 560 300"
				className="h-auto w-full"
				role="img"
				aria-label="Personal profile connected with scientific evidence to identify research that may be relevant"
			>
				<defs>
					<linearGradient id="research-path" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="#93c5fd" stopOpacity="0.4" />
						<stop offset="55%" stopColor="#60a5fa" stopOpacity="0.8" />
						<stop offset="100%" stopColor="#2563eb" />
					</linearGradient>
				</defs>

				<text
					x="70"
					y="42"
					fill="#64748b"
					fontSize="10"
					fontWeight="700"
					letterSpacing="1.8"
				>
					YOUR PROFILE
				</text>

				<text
					x="252"
					y="42"
					fill="#64748b"
					fontSize="10"
					fontWeight="700"
					letterSpacing="1.8"
				>
					EVIDENCE
				</text>

				<text
					x="438"
					y="42"
					fill="#64748b"
					fontSize="10"
					fontWeight="700"
					letterSpacing="1.8"
				>
					RELEVANCE
				</text>

				<path
					d="M128 145 C170 145 194 145 225 145"
					fill="none"
					stroke="url(#research-path)"
					strokeWidth="2"
				/>

				<path
					d="M335 145 C372 145 398 145 430 145"
					fill="none"
					stroke="url(#research-path)"
					strokeWidth="2"
				/>

				<circle cx="91" cy="145" r="39" fill="#eff6ff" stroke="#93c5fd" />

				<circle cx="91" cy="132" r="9" fill="#ffffff" stroke="#2563eb" strokeWidth="1.8" />

				<path
					d="M72 163 C75 149 107 149 110 163"
					fill="none"
					stroke="#2563eb"
					strokeWidth="1.8"
					strokeLinecap="round"
				/>

				<circle cx="75" cy="112" r="4" fill="#60a5fa" />
				<circle cx="110" cy="116" r="3" fill="#93c5fd" />
				<circle cx="116" cy="166" r="4" fill="#3b82f6" />

				<text
					x="91"
					y="222"
					textAnchor="middle"
					fill="#475569"
					fontSize="11"
					fontWeight="600"
				>
					BIOLOGY + CONTEXT
				</text>

				<circle cx="280" cy="145" r="55" fill="#eff6ff" stroke="#93c5fd" />

				<path d="M258 118 H294" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
				<path d="M258 130 H302" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
				<path d="M258 142 H290" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
				<path d="M258 154 H299" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
				<path d="M258 166 H285" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />

				<circle cx="310" cy="118" r="3" fill="#93c5fd" />
				<circle cx="314" cy="142" r="3" fill="#3b82f6" />
				<circle cx="305" cy="166" r="3" fill="#60a5fa" />

				<text
					x="280"
					y="222"
					textAnchor="middle"
					fill="#475569"
					fontSize="11"
					fontWeight="600"
				>
					GOVERNED SCIENCE
				</text>

				<circle cx="469" cy="145" r="39" fill="#dbeafe" stroke="#60a5fa" />

				<circle
					cx="469"
					cy="145"
					r="20"
					fill="#ffffff"
					stroke="#2563eb"
					strokeWidth="1.8"
				/>

				<circle cx="469" cy="145" r="5" fill="#2563eb" />

				<path
					d="M469 114 V122 M469 168 V176 M438 145 H446 M492 145 H500"
					stroke="#60a5fa"
					strokeWidth="2"
					strokeLinecap="round"
				/>

				<text
					x="469"
					y="222"
					textAnchor="middle"
					fill="#475569"
					fontSize="11"
					fontWeight="600"
				>
					WORTH FOLLOWING
				</text>

				<circle cx="158" cy="145" r="3" fill="#93c5fd" />
				<circle cx="190" cy="145" r="3" fill="#60a5fa" />
				<circle cx="370" cy="145" r="3" fill="#60a5fa" />
				<circle cx="402" cy="145" r="3" fill="#3b82f6" />

				<text x="280" y="268" textAnchor="middle" fill="#94a3b8" fontSize="10">
					Follow evidence with its strength and limitations kept in view
				</text>
			</svg>
		</div>
	);
}
