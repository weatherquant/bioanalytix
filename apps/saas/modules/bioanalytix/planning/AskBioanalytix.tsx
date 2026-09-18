"use client";

import { useMutation } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Brain, Loader2, MessageCircleQuestion } from "lucide-react";
import { useMemo, useState } from "react";

import { orpc } from "../../shared/lib/orpc-query-utils";

type AgentIntent =
	| "general_plan"
	| "retirement"
	| "protection"
	| "estate"
	| "financial_resilience"
	| "genetics_planning"
	| "unsupported";

type ToolName =
	| "review_plan"
	| "compare_retirement_age"
	| "assess_protection"
	| "run_survivor_scenario"
	| "compare_life_insurance"
	| "assess_estate";

type MissingAssumption = {
	key: string;
	question: string;
	reason: string;
};

type ToolParameters = {
	personId: string | null;
	alternativeRetirementAge: number | null;
	startDate: string | null;
	annualIncomeLost: number | null;
	annualAdditionalExpenses: number | null;
	oneOffExpense: number | null;
};

type AgentContinuation = {
	originalQuestion: string;
	intent: AgentIntent;
	tool: ToolName;
	parameters: ToolParameters;
};

type AskResponse = {
	answer: string;
	intent: AgentIntent;
	toolUsed: ToolName | null;
	missingAssumptions: MissingAssumption[];
	continuation: AgentContinuation | null;
	proposedPlanChange: unknown | null;
};

type AssumptionValues = Record<string, string>;

const exampleQuestions = [
	"What does my current estate position look like?",
	"Would my family be financially resilient if something happened to me?",
	"Do I need my current life insurance cover?",
];

function isNumericParameter(key: string): boolean {
	return [
		"alternativeRetirementAge",
		"annualIncomeLost",
		"annualAdditionalExpenses",
		"oneOffExpense",
	].includes(key);
}

function inputLabel(assumption: MissingAssumption): string {
	switch (assumption.key) {
		case "annualIncomeLost":
			return "Annual household income that would be lost";
		case "annualAdditionalExpenses":
			return "Additional annual expenses";
		case "oneOffExpense":
			return "One-off expense";
		case "alternativeRetirementAge":
			return "Retirement age to test";
		case "startDate":
			return "Comparison date";
		case "personId":
			return "Person";
		default:
			return assumption.question;
	}
}

function inputSuffix(key: string): string | null {
	switch (key) {
		case "annualIncomeLost":
		case "annualAdditionalExpenses":
		case "oneOffExpense":
			return "$";
		default:
			return null;
	}
}

export function AskBioanalytix() {
	const [question, setQuestion] = useState("");
	const [result, setResult] = useState<AskResponse | null>(null);
	const [assumptionValues, setAssumptionValues] = useState<AssumptionValues>({});

	const askMutation = useMutation(
		orpc.bioanalytix.ask.mutationOptions({
			onSuccess: (data) => {
				const nextResult = data as AskResponse;
				setResult(nextResult);

				setAssumptionValues((current) => {
					const next: AssumptionValues = {};

					for (const assumption of nextResult.missingAssumptions) {
						next[assumption.key] = current[assumption.key] ?? "";
					}

					return next;
				});
			},
		}),
	);

	const visibleMissingAssumptions = useMemo(() => {
		return result?.missingAssumptions ?? [];
	}, [result]);

	function submitQuestion(questionToAsk: string) {
		const trimmedQuestion = questionToAsk.trim();

		if (!trimmedQuestion || askMutation.isPending) {
			return;
		}

		setQuestion(trimmedQuestion);
		setResult(null);
		setAssumptionValues({});

		askMutation.mutate({
			question: trimmedQuestion,
			continuation: null,
		});
	}

	function updateAssumption(key: string, value: string) {
		setAssumptionValues((current) => ({
			...current,
			[key]: value,
		}));
	}

	function continueAnalysis() {
		if (!result?.continuation || askMutation.isPending) {
			return;
		}

		const parameters: ToolParameters = {
			...result.continuation.parameters,
		};

		for (const assumption of visibleMissingAssumptions) {
			const rawValue = assumptionValues[assumption.key]?.trim() ?? "";

			if (!rawValue) {
				return;
			}

			if (isNumericParameter(assumption.key)) {
				const numericValue = Number(rawValue);

				if (!Number.isFinite(numericValue) || numericValue < 0) {
					return;
				}

				switch (assumption.key) {
					case "alternativeRetirementAge":
						parameters.alternativeRetirementAge = numericValue;
						break;
					case "annualIncomeLost":
						parameters.annualIncomeLost = numericValue;
						break;
					case "annualAdditionalExpenses":
						parameters.annualAdditionalExpenses = numericValue;
						break;
					case "oneOffExpense":
						parameters.oneOffExpense = numericValue;
						break;
				}

				continue;
			}

			switch (assumption.key) {
				case "startDate":
					parameters.startDate = rawValue;
					break;
				case "personId":
					parameters.personId = rawValue;
					break;
			}
		}

		const continuation: AgentContinuation = {
			...result.continuation,
			parameters,
		};

		askMutation.mutate({
			question: result.continuation.originalQuestion,
			continuation,
		});
	}

	const canContinue =
		visibleMissingAssumptions.length === 0 ||
		visibleMissingAssumptions.every((assumption) => {
			const value = assumptionValues[assumption.key]?.trim() ?? "";

			if (!value) {
				return false;
			}

			if (!isNumericParameter(assumption.key)) {
				return true;
			}

			const numericValue = Number(value);

			return Number.isFinite(numericValue) && numericValue >= 0;
		});

	const awaitingInput = Boolean(result?.continuation) && result!.missingAssumptions.length > 0;

	return (
		<section
			style={{
				border: "1px solid var(--border)",
				borderRadius: "16px",
				padding: "24px",
				background: "var(--card)",
				display: "grid",
				gap: "20px",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "flex-start",
					gap: "12px",
				}}
			>
				<div
					style={{
						width: "40px",
						height: "40px",
						borderRadius: "12px",
						display: "grid",
						placeItems: "center",
						background: "var(--muted)",
						flexShrink: 0,
					}}
				>
					<Brain size={20} />
				</div>

				<div>
					<h2
						style={{
							margin: 0,
							fontSize: "18px",
							fontWeight: 650,
						}}
					>
						Ask Bioanalytix
					</h2>

					<p
						style={{
							margin: "6px 0 0",
							color: "var(--muted-foreground)",
							fontSize: "14px",
							lineHeight: 1.5,
						}}
					>
						Ask a question about your financial plan. Bioanalytix uses your current
						information and approved financial analysis tools to explore it.
					</p>
				</div>
			</div>

			<form
				onSubmit={(event) => {
					event.preventDefault();
					submitQuestion(question);
				}}
				style={{
					display: "grid",
					gap: "12px",
				}}
			>
				<textarea
					value={question}
					onChange={(event) => setQuestion(event.target.value)}
					placeholder="What would you like to explore?"
					rows={3}
					disabled={askMutation.isPending}
					style={{
						width: "100%",
						resize: "vertical",
						minHeight: "88px",
						border: "1px solid var(--border)",
						borderRadius: "12px",
						background: "var(--background)",
						color: "var(--foreground)",
						padding: "14px",
						font: "inherit",
						lineHeight: 1.5,
						outline: "none",
					}}
				/>

				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
					}}
				>
					<button
						type="submit"
						disabled={!question.trim() || askMutation.isPending}
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "8px",
							border: 0,
							borderRadius: "10px",
							padding: "10px 14px",
							background: "var(--primary)",
							color: "var(--primary-foreground)",
							font: "inherit",
							fontWeight: 600,
							cursor: askMutation.isPending ? "wait" : "pointer",
							opacity: !question.trim() || askMutation.isPending ? 0.65 : 1,
						}}
					>
						{askMutation.isPending ? (
							<>
								<Loader2 size={16} />
								Analysing
							</>
						) : (
							<>
								Ask Bioanalytix
								<ArrowRight size={16} />
							</>
						)}
					</button>
				</div>
			</form>

			{!result && !askMutation.isPending && !askMutation.isError && (
				<div
					style={{
						display: "grid",
						gap: "8px",
					}}
				>
					<div
						style={{
							fontSize: "12px",
							fontWeight: 600,
							color: "var(--muted-foreground)",
							textTransform: "uppercase",
							letterSpacing: "0.06em",
						}}
					>
						Questions you could explore
					</div>

					{exampleQuestions.map((example) => (
						<button
							key={example}
							type="button"
							onClick={() => submitQuestion(example)}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								textAlign: "left",
								border: 0,
								background: "transparent",
								color: "var(--foreground)",
								padding: "5px 0",
								font: "inherit",
								fontSize: "14px",
								cursor: "pointer",
							}}
						>
							<MessageCircleQuestion
								size={15}
								style={{
									flexShrink: 0,
								}}
							/>
							<span>{example}</span>
						</button>
					))}
				</div>
			)}

			{askMutation.isError && (
				<div
					style={{
						display: "flex",
						alignItems: "flex-start",
						gap: "10px",
						border: "1px solid var(--border)",
						borderRadius: "12px",
						padding: "14px",
					}}
				>
					<AlertCircle
						size={18}
						style={{
							flexShrink: 0,
							marginTop: "1px",
						}}
					/>

					<div>
						<div style={{ fontWeight: 600 }}>
							Bioanalytix couldn't complete that analysis.
						</div>

						<div
							style={{
								marginTop: "4px",
								fontSize: "14px",
								color: "var(--muted-foreground)",
							}}
						>
							Please try again or check the information entered below.
						</div>
					</div>
				</div>
			)}

			{result && (
				<div
					style={{
						borderTop: "1px solid var(--border)",
						paddingTop: "20px",
						display: "grid",
						gap: "16px",
					}}
				>
					{!awaitingInput && (
						<div>
							<div
								style={{
									fontSize: "12px",
									fontWeight: 600,
									color: "var(--muted-foreground)",
									textTransform: "uppercase",
									letterSpacing: "0.06em",
									marginBottom: "8px",
								}}
							>
								Bioanalytix
							</div>

							<div
								style={{
									whiteSpace: "pre-wrap",
									fontSize: "15px",
									lineHeight: 1.65,
								}}
							>
								{result.answer}
							</div>
						</div>
					)}

					{awaitingInput && (
						<div
							style={{
								border: "1px solid var(--border)",
								borderRadius: "12px",
								padding: "18px",
								background: "var(--muted)",
								display: "grid",
								gap: "16px",
							}}
						>
							<div>
								<div
									style={{
										fontWeight: 650,
										marginBottom: "5px",
									}}
								>
									I need a little more information
								</div>

								<div
									style={{
										fontSize: "14px",
										color: "var(--muted-foreground)",
										lineHeight: 1.5,
									}}
								>
									Provide the assumptions below and I'll continue the same
									analysis.
								</div>
							</div>

							{visibleMissingAssumptions.map((assumption) => {
								const suffix = inputSuffix(assumption.key);

								return (
									<label
										key={assumption.key}
										style={{
											display: "grid",
											gap: "7px",
										}}
									>
										<span
											style={{
												fontSize: "14px",
												fontWeight: 600,
											}}
										>
											{inputLabel(assumption)}
										</span>

										<span
											style={{
												fontSize: "13px",
												color: "var(--muted-foreground)",
												lineHeight: 1.45,
											}}
										>
											{assumption.question}
										</span>

										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "8px",
											}}
										>
											{suffix && (
												<span
													style={{
														fontSize: "14px",
														color: "var(--muted-foreground)",
													}}
												>
													{suffix}
												</span>
											)}

											<input
												type={
													isNumericParameter(assumption.key)
														? "number"
														: assumption.key === "startDate"
															? "date"
															: "text"
												}
												min={
													isNumericParameter(assumption.key)
														? "0"
														: undefined
												}
												value={assumptionValues[assumption.key] ?? ""}
												onChange={(event) =>
													updateAssumption(
														assumption.key,
														event.target.value,
													)
												}
												disabled={askMutation.isPending}
												style={{
													width: "100%",
													border: "1px solid var(--border)",
													borderRadius: "10px",
													background: "var(--background)",
													color: "var(--foreground)",
													padding: "10px 12px",
													font: "inherit",
												}}
											/>
										</div>
									</label>
								);
							})}

							<div
								style={{
									display: "flex",
									justifyContent: "flex-end",
								}}
							>
								<button
									type="button"
									onClick={continueAnalysis}
									disabled={!canContinue || askMutation.isPending}
									style={{
										display: "inline-flex",
										alignItems: "center",
										gap: "8px",
										border: 0,
										borderRadius: "10px",
										padding: "10px 14px",
										background: "var(--primary)",
										color: "var(--primary-foreground)",
										font: "inherit",
										fontWeight: 600,
										cursor: askMutation.isPending ? "wait" : "pointer",
										opacity: !canContinue || askMutation.isPending ? 0.65 : 1,
									}}
								>
									{askMutation.isPending ? (
										<>
											<Loader2 size={16} />
											Analysing
										</>
									) : (
										<>
											Run comparison
											<ArrowRight size={16} />
										</>
									)}
								</button>
							</div>
						</div>
					)}

					<div
						style={{
							fontSize: "12px",
							color: "var(--muted-foreground)",
						}}
					>
						General information only. Bioanalytix provides illustrative financial
						planning analysis using your information and stated assumptions. It does not
						provide personal financial, medical, legal or tax advice. Genetic
						information is not a diagnosis or prediction of future health. Any change to
						your Plan requires your confirmation.
					</div>
				</div>
			)}
		</section>
	);
}
