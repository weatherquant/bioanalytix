export function getPortfolioStats(weightGrowth: number) {
	const w = weightGrowth;
	const wg = w;
	const wd = 1 - w;

	const growthReturn = 0.105; // 10.5%
	const defensiveReturn = 0.055; // 5.5%

	const growthVol = 0.165; // 16.5%
	const defensiveVol = 0.065; // 6.5%

	const corr = 0.25;

	const expectedReturn = wg * growthReturn + wd * defensiveReturn;

	const variance =
		wg * wg * growthVol * growthVol +
		wd * wd * defensiveVol * defensiveVol +
		2 * wg * wd * growthVol * defensiveVol * corr;

	const vol = Math.sqrt(variance);

	return {
		expectedReturn,
		vol,
	};
}
