import { db } from "../client";

export async function getBioPlanForHousehold(householdId: string) {
	return db.bioPlan.findUnique({
		where: {
			householdId,
		},
	});
}

export async function saveBioPlan({
	householdId,
	planVersion,
	plan,
}: {
	householdId: string;
	planVersion: string;
	plan: object;
}) {
	return db.bioPlan.upsert({
		where: {
			householdId,
		},
		create: {
			householdId,
			planVersion,
			plan,
		},
		update: {
			planVersion,
			plan,
		},
	});
}
