import RiskIndicator from "./RiskIndicator";

export default function RiskCard({
	title,
	riskLevel,
	researchSummary,
	financialImplications,
	futureOutlook,
	icon: Icon,
	className = "",
}) {
	const riskColors = {
		low: "border-green-400",
		moderate: "border-yellow-400",
		elevated: "border-red-400",
		high: "border-red-600",
	};

	const bgColors = {
		low: "bg-green-50",
		moderate: "bg-yellow-50",
		elevated: "bg-red-50",
		high: "bg-red-100",
	};

	return (
		<div
			className={`p-6 shadow-sm rounded-xl border ${bgColors[riskLevel] || "bg-white"} ${className} `}
		>
			<div className="flex items-center justify-between">
				<div className="gap-2 flex items-center">
					{Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
					<h3 className="text-lg font-semibold">{title}</h3>
				</div>
				<RiskIndicator level={riskLevel} />
			</div>

			<div className="space-y-2 text-sm text-muted-foreground">
				<p>
					<strong>Research Insight:</strong> {researchSummary}
				</p>
				<p>
					<strong>Financial Implications:</strong> {financialImplications}
				</p>
				<p>
					<strong>Future Outlook:</strong> {futureOutlook}
				</p>
			</div>
		</div>
	);
}
