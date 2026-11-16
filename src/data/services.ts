export interface PracticeArea {
  id: number;
  num: string;
  tabCategory: string;
  tabTitle: string;
  badge: string;
  title: string;
  desc: string;
  tags: string[];
  reportText: string;
  ctaText: string;
  slug: string;
  // TEMPORARY marker & replacement instructions
  assetStatus: 'TEMPORARY';
  sourceFile: string;
  alt: string;
}

/**
 * PRACTICE AREAS IMAGE REGISTRY
 *
 * NOTE ON ASSET STATUS:
 * All 6 practice area images below are marked TEMPORARY. The current files are
 * code-generated ink/gold artwork produced by `scripts/generate-practice-art.mjs`
 * so the page no longer depends on quarantined prototype image URLs.
 *
 * HOW TO REPLACE WITH FINAL CLIENT PHOTOGRAPHY:
 * Drop licensed 1440x700 PNG/JPEG images into `src/assets/images/` using the exact
 * filenames listed below (practice-01.png through practice-06.png), then run:
 * `npm run images && npm run build`
 * The artwork generator is never run by `npm run images`; it only touches the
 * masters when called directly with `npm run art`.
 */
export const practiceAreas: PracticeArea[] = [
  {
    id: 1,
    num: "01",
    tabCategory: "01 // TITLE",
    tabTitle: "Due Diligence",
    badge: "PRACTICE 01 // CORE DUE DILIGENCE",
    title: "End-to-end title due diligence",
    desc: "Complete chain-of-title examination from root Pahanis to registered deeds, Section 22-A prohibited checks, and certified title opinions.",
    tags: ["Root Pahanis & ROR", "Section 22-A Ledger", "Certified Title Opinion"],
    reportText: "Advocate-Signed Legal Report",
    ctaText: "Initiate Scrutiny",
    slug: "practice-01",
    assetStatus: "TEMPORARY",
    sourceFile: "src/assets/images/practice-01.png",
    alt: "Topographic contour lines beneath a surveyed land parcel with boundary plots and marker points"
  },
  {
    id: 2,
    num: "02",
    tabCategory: "02 // ADVISORY",
    tabTitle: "Pre-Litigation",
    badge: "PRACTICE 02 // PREEMPTIVE DEFENSE",
    title: "Pre-litigation opinions",
    desc: "Preemptive legal risk advisory, boundary validation, and dispute mitigation prior to financial commitment.",
    tags: ["Adverse Claim Assessment", "Boundary Scrutiny", "Dispute Insulation"],
    reportText: "Advisory & Risk Matrix",
    ctaText: "Request Legal Opinion",
    slug: "practice-02",
    assetStatus: "TEMPORARY",
    sourceFile: "src/assets/images/practice-02.png",
    alt: "Layered legal document sheets with a gold seal ring and margin annotations"
  },
  {
    id: 3,
    num: "03",
    tabCategory: "03 // DEEDS",
    tabTitle: "Documentation",
    badge: "PRACTICE 03 // CONVEYANCING",
    title: "Property documentation",
    desc: "Vetted drafting and execution of absolute sale deeds, partition deeds, settlement deeds, and registration filings.",
    tags: ["Sale Deeds", "Family Partition Instruments", "Sub-Registrar Execution"],
    reportText: "Vetted Executed Instruments",
    ctaText: "Schedule Drafting",
    slug: "practice-03",
    assetStatus: "TEMPORARY",
    sourceFile: "src/assets/images/practice-03.png",
    alt: "Deed paper with an embossed stamp ring, signature strokes and a folded corner"
  },
  {
    id: 4,
    num: "04",
    tabCategory: "04 // CORPORATE",
    tabTitle: "Institutional",
    badge: "PRACTICE 04 // CORPORATE LAND HOLDINGS",
    title: "Corporate legal advisory",
    desc: "Institutional due diligence for REITs, multi-acre corporate acquisitions, mergers, and project financing.",
    tags: ["REIT Asset Scrutiny", "Banking Project Finance", "Statutory Ceilings"],
    reportText: "Corporate Due Diligence Dossier",
    ctaText: "Engage Advisory Counsel",
    slug: "practice-04",
    assetStatus: "TEMPORARY",
    sourceFile: "src/assets/images/practice-04.png",
    alt: "Architectural grid with a building elevation and boardroom perspective lines"
  },
  {
    id: 5,
    num: "05",
    tabCategory: "05 // CONTRACTS",
    tabTitle: "Contract Drafting",
    badge: "PRACTICE 05 // COMMERCIAL COVENANTS",
    title: "Contract drafting",
    desc: "Bespoke Joint Development Agreements (JDA), development rights transfers, and commercial EPC covenants.",
    tags: ["JDA & GPA Agreements", "Long-term Lease Deeds", "EPC Safeguards"],
    reportText: "Customized Transaction Contracts",
    ctaText: "Structure Covenants",
    slug: "practice-05",
    assetStatus: "TEMPORARY",
    sourceFile: "src/assets/images/practice-05.png",
    alt: "Contract clause marks, bracketed paragraphs and a gold pen flourish"
  },
  {
    id: 6,
    num: "06",
    tabCategory: "06 // DEFENSE",
    tabTitle: "Litigation Support",
    badge: "PRACTICE 06 // FORENSIC DEFENSE",
    title: "Litigation support",
    desc: "Historical forensic research, revenue and civil court defense, and title defect rectification strategies.",
    tags: ["Revenue Appellate Defense", "Defect Rectification Deeds", "Lis Pendens Resolution"],
    reportText: "Advocate Courtroom Strategy",
    ctaText: "Consult Defense Counsel",
    slug: "practice-06",
    assetStatus: "TEMPORARY",
    sourceFile: "src/assets/images/practice-06.png",
    alt: "Court arches and columns with a gavel silhouette and scales of justice"
  }
];

