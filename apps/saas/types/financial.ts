export interface UserFinancialProfile {
	user_id: string;
	age: number;
	income: number;
	savings_rate: number;
	assets: number;
	retirement_age: number;
	gender: "male" | "female";
	country?: string;
	updated_at: string;
}
