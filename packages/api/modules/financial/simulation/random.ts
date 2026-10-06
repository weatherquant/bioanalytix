export interface RandomSource {
	next(): number;

	normal(): number;
}

/**
 * Mulberry32 provides a small deterministic pseudo-random
 * generator suitable for reproducible financial simulation.
 *
 * It is not intended for cryptographic use.
 */
export function createSeededRandom(seed: number): RandomSource {
	let state = seed >>> 0;

	let spareNormal: number | undefined;

	function next(): number {
		state += 0x6d2b79f5;

		let value = state;

		value = Math.imul(value ^ (value >>> 15), value | 1);

		value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	}

	function normal(): number {
		if (spareNormal !== undefined) {
			const value = spareNormal;

			spareNormal = undefined;

			return value;
		}

		let first = next();

		const second = next();

		if (first <= 0) {
			first = Number.MIN_VALUE;
		}

		const magnitude = Math.sqrt(-2 * Math.log(first));

		const angle = 2 * Math.PI * second;

		spareNormal = magnitude * Math.sin(angle);

		return magnitude * Math.cos(angle);
	}

	return {
		next,

		normal,
	};
}
