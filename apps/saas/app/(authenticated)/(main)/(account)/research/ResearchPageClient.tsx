"use client";

import {
	HeartPulse,
	Brain,
	Radiation,
	Flame,
	Timer,
	ShieldAlert,
	Weight,
	Battery,
	Dna,
	Sparkles,
	Zap,
	Activity,
} from "lucide-react";
import { useState } from "react";

import RiskCard from "./components/RiskCard";

export default function ResearchPageClient({ genetics }) {
	const [category, setCategory] = useState("cardiometabolic");

	const categories = [
		{ key: "cardiometabolic", label: "Cardiometabolic", icon: HeartPulse },
		{ key: "neuro", label: "Neurodegeneration", icon: Brain },
		{ key: "cancer", label: "Cancer", icon: Radiation },
		{ key: "inflammation", label: "Inflammation", icon: Flame },
		{ key: "longevity", label: "Longevity Pathways", icon: Timer },
		{ key: "thrombosis", label: "Clotting", icon: ShieldAlert },
		{ key: "adiposity", label: "Adiposity", icon: Weight },
		{ key: "mitochondria", label: "Mitochondria", icon: Battery },
		{ key: "dna", label: "DNA Repair", icon: Dna },
		{ key: "epigenetics", label: "Epigenetics", icon: Sparkles },
		{ key: "stress", label: "Stress Response", icon: Zap },
		{ key: "hormones", label: "Hormonal Aging", icon: Activity },
	];

	return (
		<div className="p-6 space-y-8">
			<h1 className="text-2xl font-bold">Genetic Research & Longevity Insights</h1>
			<p className="text-muted-foreground">
				These insights help you understand how your genetic profile may shape long-term
				financial planning, retirement timing, and lifetime risk. This is not medical
				advice.
			</p>

			{/* FLEX LAYOUT FIX */}
			<div className="md:flex-row gap-8 flex flex-col">
				{/* LEFT SIDEBAR */}
				<div className="w-44 md:w-40 space-y-2 pr-4 flex-shrink-0 border-r">
					{categories.map((c) => (
						<button
							key={c.key}
							onClick={() => setCategory(c.key)}
							className={`px-3 py-2 gap-2 flex w-full items-center rounded-md text-left transition ${
								category === c.key
									? "bg-primary text-primary-foreground"
									: "hover:bg-muted"
							}`}
						>
							<c.icon className="h-4 w-4" />
							{c.label}
						</button>
					))}
				</div>

				{/* RIGHT CONTENT */}
				<div className="space-y-6 flex-1">
					{category === "cardiometabolic" && (
						<div className="space-y-6">
							{/* CARDIOMETABOLIC */}
							<RiskCard
								icon={HeartPulse}
								className="mb-6"
								title="Cholesterol & Lipid Handling"
								riskLevel={genetics?.cardiometabolic?.lipids || "moderate"}
								researchSummary="Variants affecting LDL, HDL, and triglyceride metabolism may influence lifetime vascular aging."
								financialImplications="Higher probability of midlife health shocks affecting income stability, retirement timing, and long-term healthcare costs."
								futureOutlook="Emerging lipid-modulating therapies may reduce lifetime risk; projections will update as research evolves."
							/>

							<RiskCard
								icon={HeartPulse}
								className="mb-6"
								title="Blood Pressure Regulation"
								riskLevel={genetics?.cardiometabolic?.bloodPressure || "moderate"}
								researchSummary="Genetic signals related to salt sensitivity and vascular tone may increase lifetime blood pressure variability."
								financialImplications="Greater likelihood of earlier cardiovascular events may require more conservative retirement assumptions."
								futureOutlook="Research into vascular aging biomarkers may refine future risk estimates."
							/>

							<RiskCard
								icon={ShieldAlert}
								className="mb-6"
								title="Insulin Sensitivity & Glucose Control"
								riskLevel={genetics?.cardiometabolic?.glucose || "moderate"}
								researchSummary="Variants linked to insulin signaling may increase susceptibility to metabolic disruption over time."
								financialImplications="Higher volatility in earning capacity and increased late-life care costs may require stronger financial buffers."
								futureOutlook="Precision metabolic therapeutics may alter long-term projections."
							/>
						</div>
					)}

					{category === "neuro" && (
						<div className="space-y-6">
							{/* NEURODEGENERATION */}
							<RiskCard
								icon={Brain}
								className="mb-6"
								title="Alzheimer’s & Cognitive Aging"
								riskLevel={genetics?.neuro?.alzheimer || "moderate"}
								researchSummary="Variants in APOE and related pathways influence how the brain handles amyloid, inflammation, and repair over decades."
								financialImplications="Higher probability of cognitive decline can affect long-term earning capacity, retirement timing, and late-life care costs."
								futureOutlook="Research into amyloid-targeting therapies and early biomarkers is rapidly evolving."
							/>

							<RiskCard
								icon={Brain}
								className="mb-6"
								title="Brain Resilience & Repair"
								riskLevel={genetics?.neuro?.repair || "moderate"}
								researchSummary="Signals related to neuronal repair and synaptic maintenance may shape how the brain recovers from wear-and-tear."
								financialImplications="Lower resilience may shorten peak earning years and increase late-life care needs."
								futureOutlook="Neuroprotective strategies and lifestyle-linked epigenetic changes may shift long-term projections."
							/>

							<RiskCard
								icon={Flame}
								className="mb-6"
								title="Neuroinflammation & Vascular Brain Health"
								riskLevel={genetics?.neuro?.inflammation || "moderate"}
								researchSummary="Variants affecting microglial activation and vascular inflammation can influence lifetime risk of small-vessel disease."
								financialImplications="Higher neuroinflammatory risk may increase uncertainty in healthy lifespan and care costs."
								futureOutlook="Advances in inflammation-modulating therapies and imaging biomarkers may refine future risk estimates."
							/>
						</div>
					)}

					{category === "cancer" && (
						<div className="space-y-6">
							{/* CANCER */}
							<RiskCard
								icon={Radiation}
								className="mb-6"
								title="DNA Damage & Repair Capacity"
								riskLevel={genetics?.cancer?.dnaDamage || "moderate"}
								researchSummary="Variants in DNA repair pathways may influence how efficiently cells correct damage over time."
								financialImplications="Higher genomic instability may increase long-term cancer risk and late-life healthcare costs."
								futureOutlook="Emerging screening tools and repair-targeted therapies may alter projected risk."
							/>

							<RiskCard
								icon={Radiation}
								className="mb-6"
								title="Tumor Suppressor Signaling"
								riskLevel={genetics?.cancer?.tumorSuppression || "moderate"}
								researchSummary="Signals in key tumor suppressor genes can modulate how cells respond to oncogenic stress."
								financialImplications="Elevated risk may justify more conservative longevity assumptions and stronger insurance buffers."
								futureOutlook="Precision oncology and early detection may change the financial impact of these risks."
							/>

							<RiskCard
								icon={Flame}
								className="mb-6"
								title="Inflammation-Linked Carcinogenesis"
								riskLevel={genetics?.cancer?.inflammatoryDrivers || "moderate"}
								researchSummary="Chronic inflammatory signaling can interact with genetic predisposition to shape lifetime cancer risk."
								financialImplications="Higher risk may increase expected medical expenditure and impact retirement timing."
								futureOutlook="Anti-inflammatory strategies and risk stratification tools are evolving rapidly."
							/>
						</div>
					)}

					{category === "inflammation" && (
						<div className="space-y-6">
							{/* INFLAMMATION */}
							<RiskCard
								icon={Flame}
								className="mb-6"
								title="Systemic Inflammatory Load"
								riskLevel={genetics?.inflammation?.systemic || "moderate"}
								researchSummary="Variants in cytokine and CRP-related pathways may influence baseline inflammatory tone."
								financialImplications="Higher chronic inflammation can accelerate vascular and organ aging, affecting healthy working years."
								futureOutlook="Biomarker-guided anti-inflammatory strategies may refine future projections."
							/>

							<RiskCard
								icon={Flame}
								className="mb-6"
								title="Autoimmune Susceptibility"
								riskLevel={genetics?.inflammation?.autoimmune || "moderate"}
								researchSummary="Immune regulation variants may increase susceptibility to autoimmune conditions over the life course."
								financialImplications="Potential for episodic health shocks and treatment costs may warrant stronger financial buffers."
								futureOutlook="Targeted immunomodulatory therapies may change the long-term impact of these risks."
							/>
						</div>
					)}

					{category === "longevity" && (
						<div className="space-y-6">
							{/* LONGEVITY PATHWAYS */}
							<RiskCard
								icon={Timer}
								className="mb-6"
								title="FOXO3 & Longevity Signaling"
								riskLevel={genetics?.longevity?.foxo3 || "moderate"}
								researchSummary="FOXO3 variants are frequently associated with exceptional longevity and stress resilience."
								financialImplications="Favorable signaling may extend healthy lifespan, affecting retirement timing and asset drawdown."
								futureOutlook="Research into longevity pathways may refine how these signals translate into real-world outcomes."
							/>

							<RiskCard
								icon={Timer}
								className="mb-6"
								title="mTOR & Autophagy Balance"
								riskLevel={genetics?.longevity?.mtor || "moderate"}
								researchSummary="Genetic influences on mTOR and autophagy may shape cellular cleanup and aging trajectories."
								financialImplications="Higher cellular resilience may support longer productive years and different retirement planning assumptions."
								futureOutlook="Longevity therapeutics targeting these pathways are an active area of research."
							/>
						</div>
					)}

					{category === "thrombosis" && (
						<div className="space-y-6">
							{/* CLOTTING */}
							<RiskCard
								icon={ShieldAlert}
								className="mb-6"
								title="Clotting Predisposition"
								riskLevel={genetics?.thrombosis?.baseline || "moderate"}
								researchSummary="Variants in coagulation pathways can influence baseline clotting tendency."
								financialImplications="Elevated risk may increase the probability of acute vascular events affecting income and independence."
								futureOutlook="Risk-stratified prevention strategies may alter long-term projections."
							/>

							<RiskCard
								icon={ShieldAlert}
								className="mb-6"
								title="Fibrinolysis & Recovery"
								riskLevel={genetics?.thrombosis?.fibrinolysis || "moderate"}
								researchSummary="Genetic signals in fibrinolytic pathways may affect how efficiently clots are cleared."
								financialImplications="Impaired recovery may increase long-term disability risk and care costs."
								futureOutlook="Therapies targeting clot dynamics continue to evolve."
							/>
						</div>
					)}

					{category === "adiposity" && (
						<div className="space-y-6">
							{/* ADIPOSITY */}
							<RiskCard
								icon={Weight}
								className="mb-6"
								title="Body Fat Distribution"
								riskLevel={genetics?.adiposity?.distribution || "moderate"}
								researchSummary="Variants in adiposity-related genes may influence central vs peripheral fat storage."
								financialImplications="Central adiposity is linked to cardiometabolic risk, affecting long-term health and earning capacity."
								futureOutlook="Risk-aware lifestyle and medical strategies may mitigate downstream impact."
							/>

							<RiskCard
								icon={Weight}
								className="mb-6"
								title="Appetite & Satiety Signaling"
								riskLevel={genetics?.adiposity?.appetite || "moderate"}
								researchSummary="Signals in appetite regulation pathways can shape long-term weight trajectories."
								financialImplications="Higher predisposition to weight gain may increase cardiometabolic risk and healthcare costs."
								futureOutlook="Emerging therapies targeting appetite and energy balance may change projections."
							/>
						</div>
					)}

					{category === "mitochondria" && (
						<div className="space-y-6">
							{/* MITOCHONDRIA */}
							<RiskCard
								icon={Battery}
								className="mb-6"
								title="Mitochondrial Efficiency"
								riskLevel={genetics?.mitochondria?.efficiency || "moderate"}
								researchSummary="Variants affecting mitochondrial function may influence energy availability and fatigue over time."
								financialImplications="Lower efficiency may shorten peak productivity years or increase health-related work interruptions."
								futureOutlook="Mitochondria-targeted therapies are an emerging area of longevity research."
							/>

							<RiskCard
								icon={Zap}
								className="mb-6"
								title="Oxidative Stress & ROS Handling"
								riskLevel={genetics?.mitochondria?.ros || "moderate"}
								researchSummary="Signals in oxidative stress pathways can shape how cells handle reactive oxygen species."
								financialImplications="Higher oxidative burden may accelerate aging and increase long-term health costs."
								futureOutlook="Antioxidant and stress-modulating strategies may refine future risk estimates."
							/>
						</div>
					)}

					{category === "dna" && (
						<div className="space-y-6">
							{/* DNA REPAIR */}
							<RiskCard
								icon={Dna}
								className="mb-6"
								title="Base & Nucleotide Excision Repair"
								riskLevel={genetics?.dna?.repair || "moderate"}
								researchSummary="Variants in core repair pathways may influence how efficiently everyday DNA damage is corrected."
								financialImplications="Reduced repair capacity can increase long-term cancer and aging risk, affecting planning horizons."
								futureOutlook="Repair-targeted interventions and screening may change the financial impact of these signals."
							/>

							<RiskCard
								icon={Dna}
								className="mb-6"
								title="Telomere Maintenance"
								riskLevel={genetics?.dna?.telomeres || "moderate"}
								researchSummary="Genetic influences on telomere dynamics may shape cellular aging and replicative lifespan."
								financialImplications="Shorter effective telomere maintenance may shorten healthy lifespan assumptions."
								futureOutlook="Telomere-focused research may refine how these signals are interpreted."
							/>
						</div>
					)}

					{category === "epigenetics" && (
						<div className="space-y-6">
							{/* EPIGENETICS */}
							<RiskCard
								icon={Sparkles}
								className="mb-6"
								title="Epigenetic Aging Tendencies"
								riskLevel={genetics?.epigenetics?.ageAcceleration || "moderate"}
								researchSummary="Genetic and environmental interactions can influence how quickly epigenetic age diverges from chronological age."
								financialImplications="Faster epigenetic aging may shorten healthy lifespan assumptions and increase care costs."
								futureOutlook="Epigenetic clocks and interventions are rapidly evolving."
							/>

							<RiskCard
								icon={Sparkles}
								className="mb-6"
								title="Epigenetic Plasticity & Adaptation"
								riskLevel={genetics?.epigenetics?.plasticity || "moderate"}
								researchSummary="Signals related to epigenetic flexibility may influence how responsive your biology is to lifestyle change."
								financialImplications="Higher plasticity may increase the payoff of health investments over time."
								futureOutlook="Personalized epigenetic interventions may become more accessible."
							/>
						</div>
					)}

					{category === "stress" && (
						<div className="space-y-6">
							{/* STRESS RESPONSE */}
							<RiskCard
								icon={Zap}
								className="mb-6"
								title="Oxidative Stress Handling"
								riskLevel={genetics?.stress?.oxidative || "moderate"}
								researchSummary="Variants in antioxidant pathways can shape how cells handle everyday oxidative stress."
								financialImplications="Higher stress burden may accelerate aging and increase health-related volatility."
								futureOutlook="Stress-modulating strategies and biomarker-guided interventions may refine projections."
							/>

							<RiskCard
								icon={Zap}
								className="mb-6"
								title="Cellular Stress Resilience"
								riskLevel={genetics?.stress?.cellular || "moderate"}
								researchSummary="Signals in cellular stress response pathways may influence resilience to environmental and metabolic challenges."
								financialImplications="Lower resilience may increase the probability of health shocks affecting work and retirement."
								futureOutlook="Resilience-focused therapies and lifestyle strategies are an active research area."
							/>
						</div>
					)}

					{category === "hormones" && (
						<div className="space-y-6">
							{/* HORMONAL AGING */}
							<RiskCard
								icon={Activity}
								className="mb-6"
								title="IGF-1 & Growth Signaling"
								riskLevel={genetics?.hormones?.igf1 || "moderate"}
								researchSummary="Variants in growth signaling pathways may influence aging speed and metabolic risk."
								financialImplications="Higher growth signaling may increase cardiometabolic risk and long-term healthcare costs."
								futureOutlook="Longevity strategies increasingly consider IGF-1 modulation."
							/>

							<RiskCard
								icon={Activity}
								className="mb-6"
								title="Sex Hormone Metabolism"
								riskLevel={genetics?.hormones?.sexHormones || "moderate"}
								researchSummary="Genetic influences on estrogen and testosterone metabolism can shape aging trajectories and disease risk."
								financialImplications="Hormone-linked risks may affect late-life health costs and independence."
								futureOutlook="Hormone-aware longevity planning is an emerging field."
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
