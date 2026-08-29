export const SNP_REFERENCE: SNPRecord[] = [
	// -----------------------------
	// Alzheimer’s
	// -----------------------------
	{
		rsid: "rs429358",
		gene: "APOE",
		trait: "Late-onset Alzheimer's disease",
		category: "disease",
		subcategory: "alzheimer",
		riskAlleles: ["C"],
		effectDirection: "increased",
		effectSize: -1.06, // β ≈ -1.06 yrs
		description:
			"Primary driver of the pathogenic ε4 isoform; accelerates β-amyloid accumulation.",
	},

	// -----------------------------
	// Heart / Cardiovascular
	// -----------------------------
	{
		rsid: "rs10757278",
		gene: "9p21.3",
		trait: "Coronary artery disease",
		category: "disease",
		subcategory: "heart",
		riskAlleles: ["G"],
		effectDirection: "increased",
		effectSize: -0.2, // β ≈ -0.20 yrs
		description:
			"Located in a non-coding RNA region; disrupts vascular endothelial cellular stability.",
	},

	// -----------------------------
	// Diabetes / Glucose
	// -----------------------------
	{
		rsid: "rs7903146",
		gene: "TCF7L2",
		trait: "Type 2 diabetes mellitus",
		category: "disease",
		subcategory: "diabetes",
		riskAlleles: ["T"],
		effectDirection: "increased",
		effectSize: 1.37, // OR ≈ 1.37
		description:
			"Impairs pancreatic β-cell function and alters insulin/GLP-1 secretory pathways.",
	},

	// -----------------------------
	// Cancer (via folate pathway)
	// -----------------------------
	{
		rsid: "rs1801133",
		gene: "MTHFR",
		trait: "Folate pathway disruption",
		category: "disease",
		subcategory: "cancer",
		riskAlleles: ["T"],
		effectDirection: "increased",
		effectSize: 1.15, // OR ≈ 1.15
		description:
			"Reduces methylenetetrahydrofolate reductase activity; compromises DNA repair and methylation.",
	},

	// -----------------------------
	// Inflammation
	// -----------------------------
	{
		rsid: "rs1800896",
		gene: "IL10",
		trait: "Baseline systemic inflammation",
		category: "disease",
		subcategory: "inflammation",
		riskAlleles: ["A"],
		effectDirection: "increased",
		effectSize: 1.25, // OR ≈ 1.25
		description:
			"Downregulates anti-inflammatory IL-10 expression, driving a pro-inflammatory profile.",
	},

	// -----------------------------
	// Thrombosis
	// -----------------------------
	{
		rsid: "rs6025",
		gene: "F5",
		trait: "Factor V Leiden thrombophilia",
		category: "disease",
		subcategory: "thrombosis",
		riskAlleles: ["A"],
		effectDirection: "increased",
		effectSize: 4.0, // OR 3–5
		description:
			"Introduces resistance to activated protein C; significantly raises thrombosis risk.",
	},

	// -----------------------------
	// Adiposity
	// -----------------------------
	{
		rsid: "rs9939609",
		gene: "FTO",
		trait: "High Body Mass Index (BMI)",
		category: "disease",
		subcategory: "adiposity",
		riskAlleles: ["A"],
		effectDirection: "increased",
		effectSize: 0.1, // β ≈ 0.10 SD
		description:
			"Modulates hypothalamus expression; increases appetite and preference for calorie-dense foods.",
	},

	// -----------------------------
	// Mitochondria
	// -----------------------------
	{
		rsid: "rs2288373",
		gene: "ND2",
		trait: "Oxidative phosphorylation",
		category: "disease",
		subcategory: "mitochondria",
		riskAlleles: ["C"],
		effectDirection: "decreased",
		effectSize: -0.15, // β ≈ -0.15
		description:
			"Alters mitochondrial Complex I performance, reducing baseline ATP production.",
	},

	// -----------------------------
	// DNA Repair
	// -----------------------------
	{
		rsid: "rs1801516",
		gene: "ATM",
		trait: "Radiation sensitivity",
		category: "disease",
		subcategory: "dnaRepair",
		riskAlleles: ["C"],
		effectDirection: "decreased",
		effectSize: 1.2, // OR ≈ 1.20
		description:
			"Attenuates double-strand break repair machinery; impairs genome stability under stress.",
	},

	// -----------------------------
	// Epigenetics
	// -----------------------------
	{
		rsid: "rs2234671",
		gene: "DNMT3A",
		trait: "De novo DNA methylation",
		category: "disease",
		subcategory: "epigenetics",
		riskAlleles: ["A"],
		effectDirection: "decreased",
		effectSize: -0.12, // β ≈ -0.12
		description:
			"Modulates DNA methyltransferase expression; alters global epigenetic programming.",
	},

	// -----------------------------
	// Stress (HPA axis)
	// -----------------------------
	{
		rsid: "rs1360780",
		gene: "FKBP5",
		trait: "HPA axis dysregulation",
		category: "disease",
		subcategory: "stress",
		riskAlleles: ["T"],
		effectDirection: "increased",
		effectSize: 1.4, // OR ≈ 1.40
		description:
			"Causes glucocorticoid receptor resistance; delays physiological recovery after stress.",
	},

	// -----------------------------
	// Hormones
	// -----------------------------
	{
		rsid: "rs6259",
		gene: "SHBG",
		trait: "Bioavailable sex steroids",
		category: "disease",
		subcategory: "hormones",
		riskAlleles: ["A"],
		effectDirection: "decreased",
		effectSize: -0.18, // β ≈ -0.18
		description: "Reduces SHBG clearance; increases circulating active free testosterone.",
	},

	// -----------------------------
	// Sleep
	// -----------------------------
	{
		rsid: "rs1801260",
		gene: "CLOCK",
		trait: "Circadian phase shifting",
		category: "trait",
		subcategory: "sleep",
		riskAlleles: ["G"],
		effectDirection: "increased",
		effectSize: 1.12, // OR ≈ 1.12
		description:
			"Disrupts core transcriptional feedback loops; associated with insomnia and evening preference.",
	},

	// -----------------------------
	// Fitness
	// -----------------------------
	{
		rsid: "rs1815739",
		gene: "ACTN3",
		trait: "Muscle fiber composition",
		category: "trait",
		subcategory: "fitness",
		riskAlleles: ["T"],
		effectDirection: "decreased",
		effectSize: -0.22, // β ≈ -0.22
		description:
			"Induces a stop codon preventing α-actinin-3 expression; shifts profile from power to endurance.",
	},

	// -----------------------------
	// Metabolism
	// -----------------------------
	{
		rsid: "rs12248560",
		gene: "CYP2C19",
		trait: "Xenobiotic clearance",
		category: "trait",
		subcategory: "metabolism",
		riskAlleles: ["A"],
		effectDirection: "increased",
		effectSize: 0.45, // β ≈ 0.45 activity
		description:
			"Creates an ultra-rapid metaboliser phenotype; accelerates chemical and drug breakdown.",
	},

	// -----------------------------
	// Longevity
	// -----------------------------
	{
		rsid: "rs2802292",
		gene: "FOXO3",
		trait: "Exceptional longevity",
		category: "trait",
		subcategory: "longevity",
		riskAlleles: ["G"],
		effectDirection: "decreased",
		effectSize: 1.36, // OR ≈ 1.36 survival
		description:
			"Enhances insulin/IGF-1 signaling pathways; associated with extended healthspan.",
	},

	// -----------------------------
	// Stress Response (trait)
	// -----------------------------
	{
		rsid: "rs4680",
		gene: "COMT",
		trait: "Catecholamine degradation",
		category: "trait",
		subcategory: "stressResponse",
		riskAlleles: ["G"],
		effectDirection: "decreased",
		effectSize: -0.14, // β ≈ -0.14 dopamine
		description:
			"Elevates COMT activity; rapidly clears dopamine; limits panic under extreme pressure.",
	},

	// -----------------------------
	// Hormonal Aging (trait)
	// -----------------------------
	{
		rsid: "rs1008805",
		gene: "CYP19A1",
		trait: "Androgen-to-oestrogen conversion",
		category: "trait",
		subcategory: "hormonalAging",
		riskAlleles: ["A"],
		effectDirection: "increased",
		effectSize: 1.18, // OR ≈ 1.18
		description:
			"Accelerates aromatase transcription; increases estrogen conversion; affects bone mass.",
	},

	// -----------------------------
	// Mitochondrial Function (trait)
	// -----------------------------
	{
		rsid: "rs4880",
		gene: "SOD2",
		trait: "Mitochondrial ROS defense",
		category: "trait",
		subcategory: "mitochondrialFunction",
		riskAlleles: ["C"],
		effectDirection: "decreased",
		effectSize: -0.11, // β ≈ -0.11
		description:
			"Reduces mitochondrial import efficiency; increases superoxide free-radical levels.",
	},

	// -----------------------------
	// Epigenetic Aging (trait)
	// -----------------------------
	{
		rsid: "rs1801394",
		gene: "MTR",
		trait: "Methionine-homocysteine cycle",
		category: "trait",
		subcategory: "epigeneticAging",
		riskAlleles: ["G"],
		effectDirection: "decreased",
		effectSize: -0.08, // β ≈ -0.08
		description: "Constricts SAMe methyl donor pools; accelerates epigenetic aging patterns.",
	},
];
