import { describe, expect, it } from "vitest";

import { buildEstateViewModel, EstateViewModelError } from "./estateViewModel";
import { createViewHousehold, createViewSimulation } from "./testFixtures";

function simulations() {
	return [
		createViewSimulation(0, [800000, 760000, 650000, 500000, 300000]),

		createViewSimulation(1, [1000000, 950000, 850000, 700000, 500000]),

		createViewSimulation(2, [1200000, 1140000, 1050000, 900000, 700000]),

		createViewSimulation(3, [1400000, 1330000, 1250000, 1100000, 900000]),

		createViewSimulation(4, [1600000, 1520000, 1450000, 1300000, 1100000]),
	];
}

describe("buildEstateViewModel", () => {
	it("maps lifecycle wealth into estate distributions", () => {
		const view = buildEstateViewModel(createViewHousehold(), simulations(), {
			lowerAge: 88,
			centralAge: 92,
			upperAge: 96,
		});

		expect(view.simulationCount).toBe(5);

		expect(view.atCentralLongevityAge.age).toBe(90);

		expect(view.atCentralLongevityAge.medianEstate).toBe(900000);

		expect(view.atLongLifeAge.age).toBe(95);

		expect(view.atLongLifeAge.medianEstate).toBe(700000);
	});

	it("reports estate planning state and life cover separately", () => {
		const view = buildEstateViewModel(createViewHousehold(), simulations(), {
			lowerAge: 88,
			centralAge: 92,
			upperAge: 96,
		});

		expect(view.current.liabilities).toBe(200000);

		expect(view.current.lifeInsuranceCover).toBe(500000);

		expect(view.planning.hasWill).toBe(true);

		expect(view.planning.hasSuperBeneficiaryNomination).toBe(false);
	});

	it("compares projected estate with the inheritance goal", () => {
		const view = buildEstateViewModel(createViewHousehold(), simulations(), {
			lowerAge: 88,
			centralAge: 92,
			upperAge: 96,
		});

		expect(view.inheritanceGoal.targetAmount).toBe(600000);

		expect(view.goalComparison.medianSurplusOrShortfall).toBe(300000);

		expect(view.goalComparison.p25SurplusOrShortfall).toBe(100000);
	});

	it("does not add life insurance to ordinary longevity estate projections", () => {
		const household = createViewHousehold();

		const view = buildEstateViewModel(household, simulations(), {
			lowerAge: 88,
			centralAge: 92,
			upperAge: 96,
		});

		expect(view.atCentralLongevityAge.medianEstate).toBe(900000);

		expect(view.atCentralLongevityAge.medianEstate).not.toBe(1400000);
	});

	it("rejects an invalid longevity range", () => {
		expect(() =>
			buildEstateViewModel(createViewHousehold(), simulations(), {
				lowerAge: 95,
				centralAge: 90,
				upperAge: 100,
			}),
		).toThrow(EstateViewModelError);
	});
});
