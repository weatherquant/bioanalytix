import type { PaymentsConfig } from "./types";

export const config: PaymentsConfig = {
	billingAttachedTo: "user",
	requireActiveSubscription: false,
	plans: {
		subscriber: {
			recommended: false,
			prices: [
				{
					type: "subscription",
					priceId: process.env.PRICE_ID_SUBSCRIBER as string,
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
					priceId: process.env.PRICE_ID_PREMIUM as string,
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
					priceId: process.env.PRICE_ID_COMPREHENSIVE as string,
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
