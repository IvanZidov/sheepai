export type ThreatLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type VerificationStatus = "VERIFIED" | "UNVERIFIED" | "DISPUTED";

export interface Tag {
  id: string;
  label: string;
  type: "malware" | "actor" | "industry" | "tech";
}

export interface Article {
  id: string;
  title: string;
  url: string;
  source: "The Hacker News" | "BleepingComputer" | "Dark Reading";
  publishedAt: string;
  summary: string[]; // 3 bullet points
  threatLevel: ThreatLevel;
  threatScore: number; // 0-100
  tags: Tag[];
  verificationStatus: VerificationStatus;
  verificationNote?: string; // Note from Gemini Grounding
}

