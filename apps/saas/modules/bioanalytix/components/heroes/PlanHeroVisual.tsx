export function PlanHeroVisual() {
	return (
		<div className="border-blue-100/80 bg-white/65 overflow-hidden rounded-2xl border">
			<svg
				viewBox="0 0 560 300"
				className="h-auto w-full"
				role="img"
				aria-label="A planning question connected with personal context and explored as possible future paths"
			>
				<text
					x="76"
					y="42"
					fill="#64748b"
					fontSize="10"
					fontWeight="700"
					letterSpacing="1.8"
				>
					YOUR QUESTION
				</text>

				<text
					x="250"
					y="42"
					fill="#64748b"
					fontSize="10"
					fontWeight="700"
					letterSpacing="1.8"
				>
					CONTEXT
				</text>

				<text
					x="420"
					y="42"
					fill="#64748b"
					fontSize="10"
					fontWeight="700"
					letterSpacing="1.8"
				>
					POSSIBILITIES
				</text>

				<circle cx="105" cy="145" r="42" fill="#eff6ff" stroke="#93c5fd" />

				<text
					x="105"
					y="158"
					textAnchor="middle"
					fill="#2563eb"
					fontSize="38"
					fontWeight="400"
				>
					?
				</text>

				<path
					d="M147 145 C185 145 202 145 229 145"
					fill="none"
					stroke="#60a5fa"
					strokeWidth="2"
				/>

				<circle cx="174" cy="145" r="3" fill="#60a5fa" />
				<circle cx="203" cy="145" r="3" fill="#3b82f6" />

				<circle cx="280" cy="145" r="55" fill="#eff6ff" stroke="#93c5fd" />
				<circle
					cx="280"
					cy="145"
					r="36"
					fill="#ffffff"
					stroke="#3b82f6"
					strokeWidth="1.5"
				/>

				<circle cx="280" cy="145" r="5" fill="#2563eb" />
				<circle cx="280" cy="122" r="4" fill="#60a5fa" />
				<circle cx="300" cy="156" r="4" fill="#60a5fa" />
				<circle cx="260" cy="158" r="4" fill="#60a5fa" />

				<path
					d="M280 140 L280 126 M285 148 L296 154 M275 149 L264 156"
					fill="none"
					stroke="#3b82f6"
					strokeWidth="1.8"
					strokeLinecap="round"
				/>

				<path
					d="M335 145 C367 145 375 145 393 145"
					fill="none"
					stroke="#60a5fa"
					strokeWidth="2"
				/>

				<circle cx="358" cy="145" r="3" fill="#60a5fa" />
				<circle cx="383" cy="145" r="3" fill="#3b82f6" />

				<path
					d="M398 145 C424 145 432 112 456 104"
					fill="none"
					stroke="#60a5fa"
					strokeWidth="2"
					strokeLinecap="round"
				/>
				<path
					d="M398 145 C427 145 440 145 471 145"
					fill="none"
					stroke="#3b82f6"
					strokeWidth="2"
					strokeLinecap="round"
				/>
				<path
					d="M398 145 C424 145 432 178 456 186"
					fill="none"
					stroke="#93c5fd"
					strokeWidth="2"
					strokeLinecap="round"
				/>

				<circle cx="466" cy="101" r="8" fill="#dbeafe" stroke="#60a5fa" />
				<circle cx="481" cy="145" r="8" fill="#dbeafe" stroke="#3b82f6" />
				<circle cx="466" cy="189" r="8" fill="#eff6ff" stroke="#93c5fd" />

				<text
					x="105"
					y="222"
					textAnchor="middle"
					fill="#475569"
					fontSize="11"
					fontWeight="600"
				>
					WHAT IF?
				</text>

				<text
					x="280"
					y="222"
					textAnchor="middle"
					fill="#475569"
					fontSize="11"
					fontWeight="600"
				>
					YOUR PLAN
				</text>

				<text
					x="462"
					y="222"
					textAnchor="middle"
					fill="#475569"
					fontSize="11"
					fontWeight="600"
				>
					EXPLORE PATHS
				</text>

				<text x="280" y="268" textAnchor="middle" fill="#94a3b8" fontSize="10">
					Test assumptions and explore how different choices may change the picture
				</text>
			</svg>
		</div>
	);
}
