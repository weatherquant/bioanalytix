/**
 * Genetic observations retained by Bioanalytix.
 *
 * This allowlist contains:
 * - variants interpreted by the current evidence pipeline; and
 * - selected established disease-associated variants retained so that
 *   future Bioanalytix evidence models can analyse them without requiring
 *   the user to upload their source DNA file again.
 *
 * The source DNA file itself is not retained.
 */
export const GENETIC_MARKER_CATALOGUE_VERSION = "1.0.0";

export const SUPPORTED_GENETIC_RSIDS = [
	// Existing Bioanalytix markers
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

	// Additional established variants already represented in the
	// Bioanalytix evidence catalogue
	"rs10246939",
	"rs10455872",
	"rs10490924",
	"rs1061170",
	"rs1229984",
	"rs1726866",
	"rs17580",
	"rs1799945",
	"rs1799963",
	"rs1800562",
	"rs28929474",
	"rs34612342",
	"rs34637584",
	"rs36053993",
	"rs3798220",
	"rs41293455",
	"rs4988235",
	"rs5742904",
	"rs671",
	"rs713598",
	"rs7412",
	"rs762551",
	"rs76992529",
	"rs80358928",
	"rs80358972",
] as const;

export type SupportedGeneticRsid = (typeof SUPPORTED_GENETIC_RSIDS)[number];

export const SUPPORTED_GENETIC_RSID_SET: ReadonlySet<string> = new Set(SUPPORTED_GENETIC_RSIDS);
