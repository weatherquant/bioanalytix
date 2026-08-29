// apps/saas/app/(authenticated)/(main)/(account)/portfolio/simulation/glidePath.ts

export interface GlidePoint {
	age: number;
	growth: number; // 0–1
}

const BASE_GLIDE: GlidePoint[] = [
	{ age: 40, growth: 0.8 },
	{ age: 50, growth: 0.7 },
	{ age: 60, growth: 0.55 },
	{ age: 70, growth: 0.4 },
	{ age: 80, growth: 0.25 },
	{ age: 90, growth: 0.2 },
];

export function getGrowthAllocationForAge(
	age: number,
	retirementAge: number,
	retirementBoost: number, // 0–0.2
): number {
	const pts = BASE_GLIDE;

	if (age <= pts[0].age) return pts[0].growth;
	if (age >= pts[pts.length - 1].age) return pts[pts.length - 1].growth;

	let lower = pts[0];
	let upper = pts[pts.length - 1];

	for (let i = 0; i < pts.length - 1; i++) {
		if (age >= pts[i].age && age <= pts[i + 1].age) {
			lower = pts[i];
			upper = pts[i + 1];
			break;
		}
	}

	const t = (age - lower.age) / (upper.age - lower.age);
	let growth = lower.growth + t * (upper.growth - lower.growth);

	if (age >= retirementAge) {
		growth = Math.min(0.7, growth + retirementBoost);
	}

	return growth;
}
