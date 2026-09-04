import type { EstateViewModel } from "@repo/api/modules/financial/views/estateViewModel";

export const estateFixture: EstateViewModel = {
	simulationCount: 500,

	currency: "AUD",

	longevity: {
		lowerAge: 88,
		centralAge: 92,
		upperAge: 96,
	},

	current: {
		netEstate: 1240000,
		liabilities: 220000,
		lifeInsuranceCover: 500000,
	},

	planning: {
		hasWill: true,
		hasEnduringPowerOfAttorney: true,
		hasSuperBeneficiaryNomination: false,
	},

	inheritanceGoal: {
		targetAmount: 600000,
		priority: "high",
	},

	projection: [
		{
			age: 55,
			projectionDate: "2026-01-01",
			p25Estate: 1240000,
			medianEstate: 1240000,
			p75Estate: 1240000,
		},
		{
			age: 60,
			projectionDate: "2031-01-01",
			p25Estate: 1300000,
			medianEstate: 1420000,
			p75Estate: 1560000,
		},
		{
			age: 65,
			projectionDate: "2036-01-01",
			p25Estate: 1330000,
			medianEstate: 1570000,
			p75Estate: 1850000,
		},
		{
			age: 70,
			projectionDate: "2041-01-01",
			p25Estate: 1190000,
			medianEstate: 1490000,
			p75Estate: 1870000,
		},
		{
			age: 75,
			projectionDate: "2046-01-01",
			p25Estate: 1010000,
			medianEstate: 1350000,
			p75Estate: 1810000,
		},
		{
			age: 80,
			projectionDate: "2051-01-01",
			p25Estate: 820000,
			medianEstate: 1190000,
			p75Estate: 1710000,
		},
		{
			age: 85,
			projectionDate: "2056-01-01",
			p25Estate: 590000,
			medianEstate: 1010000,
			p75Estate: 1580000,
		},
		{
			age: 90,
			projectionDate: "2061-01-01",
			p25Estate: 360000,
			medianEstate: 820000,
			p75Estate: 1430000,
		},
		{
			age: 92,
			projectionDate: "2063-01-01",
			p25Estate: 280000,
			medianEstate: 730000,
			p75Estate: 1310000,
		},
		{
			age: 95,
			projectionDate: "2066-01-01",
			p25Estate: 150000,
			medianEstate: 560000,
			p75Estate: 1130000,
		},
		{
			age: 100,
			projectionDate: "2071-01-01",
			p25Estate: 0,
			medianEstate: 270000,
			p75Estate: 840000,
		},
	],

	atCentralLongevityAge: {
		age: 92,
		p25Estate: 280000,
		medianEstate: 730000,
		p75Estate: 1310000,
	},

	atLongLifeAge: {
		age: 95,
		p25Estate: 150000,
		medianEstate: 560000,
		p75Estate: 1130000,
	},

	goalComparison: {
		targetAmount: 600000,
		medianSurplusOrShortfall: 130000,
		p25SurplusOrShortfall: -320000,
	},

	qualifications: [
		"Illustrative data only.",
		"Projected estate is a financial planning measure based on household net worth, not a legal probate-estate calculation.",
		"Life insurance cover is shown separately and is not automatically included in projected estate values.",
		"Longevity ages are planning horizons rather than predictions of individual lifespan.",
	],
};
