export default function RiskIndicator({ level }) {
	const color =
		{
			low: "text-green-600",
			moderate: "text-yellow-600",
			elevated: "text-orange-600",
			high: "text-red-600",
		}[level] || "text-gray-400";

	const label =
		{
			low: "Low",
			moderate: "Moderate",
			elevated: "Elevated",
			high: "High",
		}[level] || "Unknown";

	return <span className={`font-medium ${color}`}>● {label}</span>;
}
