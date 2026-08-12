// Official, currently-active AWS certifications.
// Image URLs are the official AWS badge template images hosted on Credly's CDN.

export type CertTier = "Foundational" | "Associate" | "Professional" | "Specialty"

/** Role-based track (the columns of the AWS certification chart). */
export type CertTrack = "Architect" | "Operations" | "Developer" | "Data & AI" | "Foundational" | "Specialty"

export interface Certification {
  /** Exam code, used as a stable local id */
  code: string
  /** Official certification name (matches the Credly badge template name) */
  name: string
  tier: CertTier
  /** Role-based track, used to place the badge in a fixed grid column */
  track: CertTrack
  /** Official AWS badge image (Credly CDN) */
  image: string
}

/** Fixed column order for the role-based matrix. */
export const TRACKS: CertTrack[] = ["Architect", "Operations", "Developer", "Data & AI"]

/** Level bands, top to bottom, matching the official chart. */
export const LEVELS: CertTier[] = ["Professional", "Associate", "Foundational"]

// Order within a tier group is preserved for the "missing" section.
export const CERTIFICATIONS: Certification[] = [
  // Foundational
  {
    code: "CLF-C02",
    name: "AWS Certified Cloud Practitioner",
    tier: "Foundational",
    track: "Foundational",
    image: "https://images.credly.com/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/image.png",
  },
  {
    code: "AIF-C01",
    name: "AWS Certified AI Practitioner",
    tier: "Foundational",
    track: "Foundational",
    image: "https://images.credly.com/images/4d4693bb-530e-4bca-9327-de07f3aa2348/image.png",
  },
  // Associate
  {
    code: "SAA-C03",
    name: "AWS Certified Solutions Architect \u2013 Associate",
    tier: "Associate",
    track: "Architect",
    image: "https://images.credly.com/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png",
  },
  {
    code: "SOA-C02",
    name: "AWS Certified CloudOps Administrator \u2013 Associate",
    tier: "Associate",
    track: "Operations",
    image: "https://images.credly.com/images/88a6405e-0f26-442a-95ed-f9b9db4c857e/blob",
  },
  {
    code: "DVA-C02",
    name: "AWS Certified Developer \u2013 Associate",
    tier: "Associate",
    track: "Developer",
    image: "https://images.credly.com/images/b9feab85-1a43-4f6c-99a5-631b88d5461b/image.png",
  },
  {
    code: "DEA-C01",
    name: "AWS Certified Data Engineer \u2013 Associate",
    tier: "Associate",
    track: "Data & AI",
    image: "https://images.credly.com/images/e5c85d7f-4e50-431e-b5af-fa9d9b0596e7/image.png",
  },
  {
    code: "MLA-C01",
    name: "AWS Certified Machine Learning Engineer \u2013 Associate",
    tier: "Associate",
    track: "Data & AI",
    image: "https://images.credly.com/images/1a634b4e-3d6b-4a74-b118-c0dcb429e8d2/image.png",
  },
  // Professional
  {
    code: "SAP-C02",
    name: "AWS Certified Solutions Architect \u2013 Professional",
    tier: "Professional",
    track: "Architect",
    image: "https://images.credly.com/images/2d84e428-9078-49b6-a804-13c15383d0de/image.png",
  },
  {
    code: "DOP-C02",
    name: "AWS Certified DevOps Engineer \u2013 Professional",
    tier: "Professional",
    track: "Operations",
    image: "https://images.credly.com/images/bd31ef42-d460-493e-8503-39592aaf0458/image.png",
  },
  {
    code: "AIP-C01",
    name: "AWS Certified Generative AI Developer \u2013 Professional",
    tier: "Professional",
    track: "Developer",
    image: "https://images.credly.com/images/52c6e5ac-9516-4944-a4df-e31b23c9bbf2/blob",
  },
  // Specialty
  {
    code: "ANS-C01",
    name: "AWS Certified Advanced Networking \u2013 Specialty",
    tier: "Specialty",
    track: "Specialty",
    image: "https://images.credly.com/images/4d08274f-64c1-495e-986b-3143f51b1371/image.png",
  },
  {
    code: "MLS-C01",
    name: "AWS Certified Machine Learning \u2013 Specialty",
    tier: "Specialty",
    track: "Specialty",
    image: "https://images.credly.com/images/778bde6c-ad1c-4312-ac33-2fa40d50a147/image.png",
  },
  {
    code: "SCS-C02",
    name: "AWS Certified Security \u2013 Specialty",
    tier: "Specialty",
    track: "Specialty",
    image: "https://images.credly.com/images/53acdae5-d69f-4dda-b650-d02ed7a50dd7/image.png",
  },
]

export const TIER_ORDER: Record<CertTier, number> = {
  Foundational: 0,
  Associate: 1,
  Professional: 2,
  Specialty: 3,
}

/** Normalize a certification name for tolerant matching (handles dashes/spaces/case). */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212]/g, "-") // any dash variant -> hyphen
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, " - ")
    .trim()
}
