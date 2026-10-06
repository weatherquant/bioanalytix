export const SUPPORTED_GENETIC_RSIDS = [
	"rs429358",
	"rs10757278",
	"rs7903146",
	"rs1801133",
	"rs1800896",
	"rs6025",
	"rs9939609",
	"rs2288373",
	"rs1801516",
	"rs2234671",
	"rs1360780",
	"rs6259",
	"rs1801260",
	"rs1815739",
	"rs12248560",
	"rs2802292",
	"rs4680",
	"rs1008805",
	"rs4880",
	"rs1801394",
] as const;

export type SupportedGeneticRsid = (typeof SUPPORTED_GENETIC_RSIDS)[number];

export const SUPPORTED_GENETIC_RSID_SET: ReadonlySet<string> = new Set(SUPPORTED_GENETIC_RSIDS);
