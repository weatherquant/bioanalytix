import { db } from "../client";

export const BIO_GENETIC_DATA_PROCESSING_CONSENT_TYPE = "genetic_data_processing";
export const BIO_GENETIC_DATA_PROCESSING_CONSENT_VERSION = "1.0";

export async function getCurrentBioGeneticDataProcessingConsent(userId: string) {
	return db.bioConsent.findFirst({
		where: {
			userId,
			type: BIO_GENETIC_DATA_PROCESSING_CONSENT_TYPE,
			documentVersion: BIO_GENETIC_DATA_PROCESSING_CONSENT_VERSION,
			granted: true,
			withdrawnAt: null,
		},
		orderBy: {
			grantedAt: "desc",
		},
	});
}

export async function grantBioGeneticDataProcessingConsent(userId: string) {
	const existing = await getCurrentBioGeneticDataProcessingConsent(userId);

	if (existing) {
		return existing;
	}

	return db.bioConsent.create({
		data: {
			userId,
			type: BIO_GENETIC_DATA_PROCESSING_CONSENT_TYPE,
			documentVersion: BIO_GENETIC_DATA_PROCESSING_CONSENT_VERSION,
			granted: true,
			grantedAt: new Date(),
			metadata: {
				rawFileRetention: "not_retained",
				purpose: "genetic_analysis_and_personalised_bioanalytix_insights",
			},
		},
	});
}
