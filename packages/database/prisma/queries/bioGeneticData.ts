import { db } from "../client";
import { BIO_GENETIC_DATA_PROCESSING_CONSENT_TYPE } from "./bioConsents";

export async function deleteBioGeneticDataForUser({
	userId,
	householdId,
}: {
	userId: string;
	householdId: string;
}) {
	return db.$transaction(async (tx) => {
		const household = await tx.bioHousehold.findFirst({
			where: {
				id: householdId,
				ownerUserId: userId,
			},
			select: {
				id: true,
			},
		});

		if (!household) {
			throw new Error("Bioanalytix household not found");
		}

		const planningProfiles = await tx.bioPlanningProfile.deleteMany({
			where: {
				householdId,
			},
		});

		const geneticUploads = await tx.bioGeneticUpload.deleteMany({
			where: {
				householdId,
			},
		});

		const consents = await tx.bioConsent.updateMany({
			where: {
				userId,
				type: BIO_GENETIC_DATA_PROCESSING_CONSENT_TYPE,
				granted: true,
				withdrawnAt: null,
			},
			data: {
				granted: false,
				withdrawnAt: new Date(),
			},
		});

		return {
			deletedPlanningProfiles: planningProfiles.count,
			deletedGeneticUploads: geneticUploads.count,
			withdrawnConsents: consents.count,
		};
	});
}
