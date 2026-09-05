"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type EmploymentStatus =
	| "employed"
	| "self_employed"
	| "not_employed"
	| "retired"
	| "student"
	| "other";

interface SetupDraft {
	dateOfBirth: string;
	country: string;
	currency: string;
	employmentStatus: EmploymentStatus;

	hasPartner: boolean;
	hasDependants: boolean;

	annualHouseholdIncome: number;
	cashAndSavings: number;
	investments: number;
	propertyAndOtherAssets: number;
	retirementSavings: number;
	totalDebt: number;

	annualHouseholdSpending: number;
	lifeInsuranceCover: number;
	incomeProtectionAnnualBenefit: number;

	desiredInheritance?: number;
	expectedRetirementAge: number;
}

interface HouseholdResponse {
	household: {
		id: string;
		onboardingStep: number;
		onboardingComplete: boolean;
		onboardingDraft?: unknown;
	};
}

const DEFAULT_DRAFT: SetupDraft = {
	dateOfBirth: "",
	country: "AU",
	currency: "AUD",
	employmentStatus: "employed",

	hasPartner: false,
	hasDependants: false,

	annualHouseholdIncome: 0,
	cashAndSavings: 0,
	investments: 0,
	propertyAndOtherAssets: 0,
	retirementSavings: 0,
	totalDebt: 0,

	annualHouseholdSpending: 0,
	lifeInsuranceCover: 0,
	incomeProtectionAnnualBenefit: 0,

	expectedRetirementAge: 67,
};

const STEPS = [
	{
		number: 1,
		title: "About you",
		description: "The basics we need to anchor your planning horizon.",
	},
	{
		number: 2,
		title: "Your position",
		description: "Approximate amounts are completely fine.",
	},
	{
		number: 3,
		title: "Protection",
		description: "Enough context to make future What-If scenarios meaningful.",
	},
	{
		number: 4,
		title: "DNA",
		description: "Add your genetics to personalise which possibilities are worth exploring.",
	},
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function draftFromUnknown(value: unknown): Partial<SetupDraft> {
	if (!isRecord(value)) {
		return {};
	}

	return value as Partial<SetupDraft>;
}

function numericValue(value: string): number {
	if (value.trim() === "") {
		return 0;
	}

	const parsed = Number(value.replace(/,/g, ""));

	return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function MoneyInput({
	label,
	value,
	onChange,
	helper,
}: {
	label: string;
	value: number;
	onChange: (value: number) => void;
	helper?: string;
}) {
	return (
		<label className="space-y-2">
			<span className="text-sm font-medium block">{label}</span>

			<div className="px-3 flex items-center rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring">
				<span className="mr-2 text-muted-foreground">$</span>

				<input
					inputMode="decimal"
					value={value === 0 ? "" : String(value)}
					onChange={(event) => onChange(numericValue(event.target.value))}
					placeholder="0"
					className="h-11 w-full bg-transparent outline-none"
				/>
			</div>

			{helper ? <span className="text-xs block text-muted-foreground">{helper}</span> : null}
		</label>
	);
}

function Choice({
	active,
	children,
	onClick,
}: {
	active: boolean;
	children: React.ReactNode;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={[
				"rounded-xl border px-4 py-3 text-left text-sm transition",
				active
					? "border-foreground bg-foreground text-background"
					: "bg-background hover:bg-muted",
			].join(" ")}
		>
			{children}
		</button>
	);
}

export function BioanalytixSetupWizard() {
	const router = useRouter();

	const [householdId, setHouseholdId] = useState<string>();
	const [step, setStep] = useState(1);
	const [draft, setDraft] = useState<SetupDraft>(DEFAULT_DRAFT);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string>();

	const progress = useMemo(() => (step / 4) * 100, [step]);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			try {
				const response = await fetch("/api/bioanalytix/onboarding", {
					method: "GET",
					credentials: "include",
					headers: {
						Accept: "application/json",
					},
				});

				if (!response.ok) {
					throw new Error("Could not load your Bioanalytix profile.");
				}

				const data = (await response.json()) as HouseholdResponse;

				if (cancelled) {
					return;
				}

				setHouseholdId(data.household.id);

				if (data.household.onboardingComplete) {
					router.replace("/v2/overview");
					return;
				}

				const restored = draftFromUnknown(data.household.onboardingDraft);

				setDraft({
					...DEFAULT_DRAFT,
					...restored,
				});

				setStep(Math.min(4, Math.max(1, data.household.onboardingStep || 1)));
			} catch (caught) {
				setError(caught instanceof Error ? caught.message : "Could not load your profile.");
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		void load();

		return () => {
			cancelled = true;
		};
	}, [router]);

	function update<K extends keyof SetupDraft>(key: K, value: SetupDraft[K]) {
		setDraft((current) => ({
			...current,
			[key]: value,
		}));
	}

	async function saveDraft(nextStep: number) {
		if (!householdId) {
			throw new Error("Your household profile has not loaded.");
		}

		const response = await fetch("/api/bioanalytix/onboarding/draft", {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				householdId,
				onboardingStep: nextStep,
				draft,
			}),
		});

		if (!response.ok) {
			throw new Error("We couldn't save your progress.");
		}
	}

	function validateCurrentStep(): string | undefined {
		if (step === 1) {
			if (!draft.dateOfBirth) {
				return "Please enter your date of birth.";
			}

			if (!draft.country.trim()) {
				return "Please enter your country.";
			}
		}

		if (step === 3) {
			if (draft.expectedRetirementAge < 40 || draft.expectedRetirementAge > 100) {
				return "Please enter an expected retirement age between 40 and 100.";
			}
		}

		return undefined;
	}

	async function next() {
		const validationError = validateCurrentStep();

		if (validationError) {
			setError(validationError);
			return;
		}

		setSaving(true);
		setError(undefined);

		try {
			const nextStep = Math.min(4, step + 1);

			await saveDraft(nextStep);

			setStep(nextStep);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "We couldn't save your progress.");
		} finally {
			setSaving(false);
		}
	}

	async function back() {
		const previousStep = Math.max(1, step - 1);

		setStep(previousStep);
		setError(undefined);

		if (householdId) {
			try {
				await saveDraft(previousStep);
			} catch {
				// Navigation backwards should not be blocked by
				// a transient save failure.
			}
		}
	}

	async function complete(destination: "dna" | "overview") {
		if (!householdId) {
			return;
		}

		setSaving(true);
		setError(undefined);

		try {
			const response = await fetch("/api/bioanalytix/onboarding/complete", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					householdId,
					...draft,
				}),
			});

			if (!response.ok) {
				let message = "We couldn't complete your Bioanalytix profile.";

				try {
					const body = (await response.json()) as {
						message?: string;
					};

					if (body.message) {
						message = body.message;
					}
				} catch {
					// Keep the friendly fallback.
				}

				throw new Error(message);
			}

			router.push(destination === "dna" ? "/v2/dna" : "/v2/overview");

			router.refresh();
		} catch (caught) {
			setError(
				caught instanceof Error ? caught.message : "We couldn't complete your profile.",
			);
		} finally {
			setSaving(false);
		}
	}

	if (loading) {
		return (
			<div className="max-w-4xl px-6 py-10 mx-auto">
				<div className="p-8 rounded-2xl border bg-card">
					<p className="text-sm text-muted-foreground">Loading your profile…</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl px-4 py-6 sm:px-6 lg:py-10 mx-auto">
			<div className="mb-8">
				<div className="mb-3 text-sm flex items-center justify-between">
					<span className="font-medium">About 5 minutes</span>

					<span className="text-muted-foreground">Step {step} of 4</span>
				</div>

				<div className="h-2 overflow-hidden rounded-full bg-muted">
					<div
						className="h-full bg-foreground transition-all duration-300"
						style={{ width: `${progress}%` }}
					/>
				</div>

				<div className="mt-4 gap-2 grid grid-cols-4">
					{STEPS.map((item) => (
						<div key={item.number}>
							<div
								className={[
									"text-xs font-medium",
									item.number <= step
										? "text-foreground"
										: "text-muted-foreground",
								].join(" ")}
							>
								{item.title}
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="shadow-sm rounded-2xl border bg-card">
				<div className="p-6 sm:p-8 border-b">
					<p className="mb-2 text-sm font-medium text-muted-foreground">
						{STEPS[step - 1]?.description}
					</p>

					<h2 className="text-2xl font-semibold tracking-tight">
						{STEPS[step - 1]?.title}
					</h2>

					{step !== 4 ? (
						<p className="mt-3 max-w-2xl text-sm text-muted-foreground">
							Approximate information is fine. You can refine it later — this is
							enough to make your first Bioanalytix scenarios useful.
						</p>
					) : null}
				</div>

				<div className="p-6 sm:p-8">
					{step === 1 ? (
						<div className="space-y-8">
							<div className="gap-6 sm:grid-cols-2 grid">
								<label className="space-y-2">
									<span className="text-sm font-medium block">Date of birth</span>

									<input
										type="date"
										value={draft.dateOfBirth}
										onChange={(event) =>
											update("dateOfBirth", event.target.value)
										}
										className="h-11 px-3 w-full rounded-xl border bg-background outline-none focus:ring-2 focus:ring-ring"
									/>
								</label>

								<label className="space-y-2">
									<span className="text-sm font-medium block">Country</span>

									<select
										value={draft.country}
										onChange={(event) => {
											const country = event.target.value;

											update("country", country);

											if (country === "AU") {
												update("currency", "AUD");
											} else if (country === "US") {
												update("currency", "USD");
											} else if (country === "GB") {
												update("currency", "GBP");
											} else if (country === "NZ") {
												update("currency", "NZD");
											}
										}}
										className="h-11 px-3 w-full rounded-xl border bg-background outline-none focus:ring-2 focus:ring-ring"
									>
										<option value="AU">Australia</option>
										<option value="US">United States</option>
										<option value="GB">United Kingdom</option>
										<option value="NZ">New Zealand</option>
										<option value="CA">Canada</option>
										<option value="SG">Singapore</option>
										<option value="OTHER">Other</option>
									</select>
								</label>

								<label className="space-y-2 sm:col-span-2">
									<span className="text-sm font-medium block">Employment</span>

									<select
										value={draft.employmentStatus}
										onChange={(event) =>
											update(
												"employmentStatus",
												event.target.value as EmploymentStatus,
											)
										}
										className="h-11 px-3 w-full rounded-xl border bg-background outline-none focus:ring-2 focus:ring-ring"
									>
										<option value="employed">Employed</option>
										<option value="self_employed">Self-employed</option>
										<option value="not_employed">Not currently employed</option>
										<option value="retired">Retired</option>
										<option value="student">Student</option>
										<option value="other">Other</option>
									</select>
								</label>
							</div>

							<div className="gap-4 sm:grid-cols-2 grid">
								<div className="space-y-3">
									<p className="text-sm font-medium">Do you have a partner?</p>

									<div className="gap-2 grid grid-cols-2">
										<Choice
											active={draft.hasPartner}
											onClick={() => update("hasPartner", true)}
										>
											Yes
										</Choice>

										<Choice
											active={!draft.hasPartner}
											onClick={() => update("hasPartner", false)}
										>
											No
										</Choice>
									</div>
								</div>

								<div className="space-y-3">
									<p className="text-sm font-medium">Financial dependants?</p>

									<div className="gap-2 grid grid-cols-2">
										<Choice
											active={draft.hasDependants}
											onClick={() => update("hasDependants", true)}
										>
											Yes
										</Choice>

										<Choice
											active={!draft.hasDependants}
											onClick={() => update("hasDependants", false)}
										>
											No
										</Choice>
									</div>
								</div>
							</div>
						</div>
					) : null}

					{step === 2 ? (
						<div className="gap-6 sm:grid-cols-2 grid">
							<MoneyInput
								label="Annual household income"
								value={draft.annualHouseholdIncome}
								onChange={(value) => update("annualHouseholdIncome", value)}
							/>

							<MoneyInput
								label="Cash and savings"
								value={draft.cashAndSavings}
								onChange={(value) => update("cashAndSavings", value)}
							/>

							<MoneyInput
								label="Investments"
								value={draft.investments}
								onChange={(value) => update("investments", value)}
								helper="Shares, managed funds and other non-retirement investments."
							/>

							<MoneyInput
								label="Property and other assets"
								value={draft.propertyAndOtherAssets}
								onChange={(value) => update("propertyAndOtherAssets", value)}
								helper="An approximate combined value is sufficient."
							/>

							<MoneyInput
								label="Super / retirement savings"
								value={draft.retirementSavings}
								onChange={(value) => update("retirementSavings", value)}
							/>

							<MoneyInput
								label="Total debt"
								value={draft.totalDebt}
								onChange={(value) => update("totalDebt", value)}
								helper="Mortgage, loans, credit and other material debt."
							/>
						</div>
					) : null}

					{step === 3 ? (
						<div className="gap-6 sm:grid-cols-2 grid">
							<MoneyInput
								label="Annual household spending"
								value={draft.annualHouseholdSpending}
								onChange={(value) => update("annualHouseholdSpending", value)}
								helper="A broad annual estimate is enough."
							/>

							<label className="space-y-2">
								<span className="text-sm font-medium block">
									Expected retirement age
								</span>

								<input
									type="number"
									min={40}
									max={100}
									value={draft.expectedRetirementAge}
									onChange={(event) =>
										update("expectedRetirementAge", Number(event.target.value))
									}
									className="h-11 px-3 w-full rounded-xl border bg-background outline-none focus:ring-2 focus:ring-ring"
								/>
							</label>

							<MoneyInput
								label="Life insurance cover"
								value={draft.lifeInsuranceCover}
								onChange={(value) => update("lifeInsuranceCover", value)}
								helper="Enter zero if you do not currently have life cover."
							/>

							<MoneyInput
								label="Annual income-protection benefit"
								value={draft.incomeProtectionAnnualBenefit}
								onChange={(value) => update("incomeProtectionAnnualBenefit", value)}
								helper="Approximate annual benefit if you know it."
							/>

							<div className="sm:col-span-2">
								<MoneyInput
									label="Desired inheritance"
									value={draft.desiredInheritance ?? 0}
									onChange={(value) =>
										update(
											"desiredInheritance",
											value === 0 ? undefined : value,
										)
									}
									helper="Optional. Leave blank if this is not currently an objective."
								/>
							</div>
						</div>
					) : null}

					{step === 4 ? (
						<div className="space-y-6">
							<div className="p-6 rounded-2xl border bg-muted/30">
								<p className="text-sm font-medium">
									Your financial context is ready.
								</p>

								<h3 className="mt-2 text-xl font-semibold">
									Now make it biological.
								</h3>

								<p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
									Add raw genetic data so Bioanalytix can identify evidence-backed
									associations that may be worth considering in your long-term
									planning.
								</p>

								<p className="mt-3 max-w-2xl text-xs leading-5 text-muted-foreground">
									A genetic association is not a diagnosis or a prediction that an
									event will occur. Bioanalytix uses supported findings to
									identify scenarios worth exploring.
								</p>
							</div>

							<div className="gap-4 sm:grid-cols-2 grid">
								<button
									type="button"
									disabled={saving}
									onClick={() => void complete("dna")}
									className="p-6 rounded-2xl border bg-foreground text-left text-background transition hover:opacity-90 disabled:opacity-50"
								>
									<span className="text-sm font-medium">Add my DNA</span>

									<span className="mt-2 text-sm block opacity-80">
										Continue to the secure DNA upload and interpretation flow.
									</span>
								</button>

								<button
									type="button"
									disabled={saving}
									onClick={() => void complete("overview")}
									className="p-6 rounded-2xl border bg-background text-left transition hover:bg-muted disabled:opacity-50"
								>
									<span className="text-sm font-medium">
										Continue without DNA
									</span>

									<span className="mt-2 text-sm block text-muted-foreground">
										Explore general longevity and financial scenarios first. You
										can add DNA later.
									</span>
								</button>
							</div>
						</div>
					) : null}

					{error ? (
						<div className="mt-6 px-4 py-3 text-sm rounded-xl border border-destructive/30 bg-destructive/5 text-destructive">
							{error}
						</div>
					) : null}
				</div>

				{step < 4 ? (
					<div className="p-6 sm:px-8 flex items-center justify-between border-t">
						<button
							type="button"
							onClick={() => void back()}
							disabled={step === 1 || saving}
							className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-muted disabled:opacity-30"
						>
							Back
						</button>

						<button
							type="button"
							onClick={() => void next()}
							disabled={saving}
							className="px-5 py-2.5 text-sm font-medium rounded-xl bg-foreground text-background transition hover:opacity-90 disabled:opacity-50"
						>
							{saving ? "Saving…" : "Continue"}
						</button>
					</div>
				) : (
					<div className="p-6 sm:px-8 flex items-center border-t">
						<button
							type="button"
							onClick={() => void back()}
							disabled={saving}
							className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-muted disabled:opacity-50"
						>
							Back
						</button>
					</div>
				)}
			</div>

			<p className="mt-6 max-w-2xl text-xs leading-5 mx-auto text-center text-muted-foreground">
				Bioanalytix uses these details for scenario modelling. It is not a financial adviser
				and this setup does not constitute personal financial advice.
			</p>
		</div>
	);
}
