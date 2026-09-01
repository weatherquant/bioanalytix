import type { GenotypeObservation } from "./types";

export interface ObservationIndexResolution {
	/**
	 * Observations that remain analytically usable
	 * after duplicate/conflict resolution.
	 *
	 * Keys are normalized lowercase rsIDs.
	 */
	index: Map<string, GenotypeObservation>;

	/**
	 * rsIDs for which two or more observations
	 * reported the same called genotype.
	 */
	duplicateRsids: string[];

	/**
	 * rsIDs for which observations reported
	 * conflicting called genotypes.
	 *
	 * Conflicted loci are deliberately omitted
	 * from the usable observation index.
	 */
	conflictingRsids: string[];

	/**
	 * Human-readable audit information describing
	 * duplicate/conflict resolution.
	 */
	warnings: string[];
}

function normalizeRsid(rsid: string): string {
	return rsid.trim().toLowerCase();
}

function normalizeGenotype(observation: GenotypeObservation): string | undefined {
	if (observation.callStatus !== "called" || !observation.genotype) {
		return undefined;
	}

	return observation.genotype.trim().toUpperCase();
}

function isCalledObservation(observation: GenotypeObservation): boolean {
	return observation.callStatus === "called" && typeof observation.genotype === "string";
}

/**
 * Build an analytically safe rsID index.
 *
 * Resolution policy:
 *
 * 1. A single observation is retained.
 *
 * 2. Concordant duplicate called genotypes are
 *    deduplicated and reported as a warning.
 *
 * 3. Conflicting called genotypes are never
 *    resolved by insertion order. The locus is
 *    removed from the usable index and recorded
 *    as conflicted.
 *
 * 4. A called observation takes precedence over
 *    an additional missing/no-call/invalid record.
 *    This is recorded as a warning rather than
 *    treated as a genotype conflict.
 *
 * 5. Once a locus is conflicted, later observations
 *    cannot silently restore it.
 */
export function buildObservationIndex(
	observations: readonly GenotypeObservation[],
): ObservationIndexResolution {
	const index = new Map<string, GenotypeObservation>();

	const duplicateRsids = new Set<string>();

	const conflictingRsids = new Set<string>();

	const warnings: string[] = [];

	for (const observation of observations) {
		const rsid = normalizeRsid(observation.rsid);

		/**
		 * Once conflicting called genotypes have
		 * been observed at a locus, the locus must
		 * remain excluded for this interpretation
		 * run.
		 */
		if (conflictingRsids.has(rsid)) {
			continue;
		}

		const existing = index.get(rsid);

		if (!existing) {
			index.set(rsid, observation);

			continue;
		}

		const existingCalled = isCalledObservation(existing);

		const incomingCalled = isCalledObservation(observation);

		const existingGenotype = normalizeGenotype(existing);

		const incomingGenotype = normalizeGenotype(observation);

		/**
		 * Two called observations with different
		 * genotypes are a genuine analytical
		 * conflict.
		 */
		if (existingCalled && incomingCalled && existingGenotype !== incomingGenotype) {
			index.delete(rsid);

			conflictingRsids.add(rsid);

			warnings.push(
				`Conflicting genotype observations were detected for ${rsid}. The locus was excluded from interpretation rather than selecting one observation.`,
			);

			continue;
		}

		/**
		 * Concordant genotype calls are safe to
		 * deduplicate for interpretation, while
		 * preserving the fact that duplicates
		 * occurred in the audit output.
		 */
		if (existingCalled && incomingCalled && existingGenotype === incomingGenotype) {
			if (!duplicateRsids.has(rsid)) {
				duplicateRsids.add(rsid);

				warnings.push(
					`Concordant duplicate genotype observations were detected for ${rsid}. A single observation was retained for interpretation.`,
				);
			}

			continue;
		}

		/**
		 * If the existing observation is not called
		 * but the incoming one is, prefer the called
		 * observation.
		 *
		 * This is not a genotype disagreement because
		 * the other record contains no usable genotype
		 * call.
		 */
		if (!existingCalled && incomingCalled) {
			index.set(rsid, observation);

			if (!duplicateRsids.has(rsid)) {
				duplicateRsids.add(rsid);

				warnings.push(
					`Multiple observations were detected for ${rsid}. A called genotype was retained over a non-called observation.`,
				);
			}

			continue;
		}

		/**
		 * Existing called observation plus an
		 * incoming non-called observation:
		 * retain the called observation.
		 */
		if (existingCalled && !incomingCalled) {
			if (!duplicateRsids.has(rsid)) {
				duplicateRsids.add(rsid);

				warnings.push(
					`Multiple observations were detected for ${rsid}. The called genotype was retained over a non-called observation.`,
				);
			}

			continue;
		}

		/**
		 * Multiple non-called observations have no
		 * conflicting called genotype. Keep the
		 * first observation and record duplication.
		 */
		if (!duplicateRsids.has(rsid)) {
			duplicateRsids.add(rsid);

			warnings.push(
				`Multiple non-called observations were detected for ${rsid}. The first observation was retained.`,
			);
		}
	}

	return {
		index,

		duplicateRsids: [...duplicateRsids],

		conflictingRsids: [...conflictingRsids],

		warnings,
	};
}
