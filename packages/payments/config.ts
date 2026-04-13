import type { PaymentsConfig } from "./types";

export const config: PaymentsConfig = {
	billingAttachedTo: "user",
	requireActiveSubscription: true,
	plans: {
		subscriber: {
			recommended: false,
			prices: [
				{
					type: "subscription",
					priceId: "price_1TLBNTGuAGsL9n0uJzu7WpWV",
					interval: "year",
					amount: 79,
					currency: "AUD",
					seatBased: false,
					trialPeriodDays: 0,
				},
			],
		},
		premium: {
			recommended: true,
			prices: [
				{
					type: "subscription",
					priceId: "price_1TKmcIGuAGsL9n0uMieb10c3",
					interval: "year",
					amount: 199,
					currency: "AUD",
					seatBased: false,
					trialPeriodDays: 7,
				},
			],
		},
		comprehensive: {
			prices: [
				{
					type: "subscription",
					priceId: "price_1TLBQ0GuAGsL9n0u5o0dFVGX",
					interval: "year",
					amount: 499,
					currency: "AUD",
					seatBased: false,
					trialPeriodDays: 0,					
				},
			],
		},
	},
};
