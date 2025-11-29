import { Article, Tag } from "./types";

const TAGS: Record<string, Tag> = {
  RANSOMWARE: { id: "t1", label: "Ransomware", type: "malware" },
  PYTHON: { id: "t2", label: "Python", type: "tech" },
  SUPPLY_CHAIN: { id: "t3", label: "Supply Chain", type: "malware" },
  AI: { id: "t4", label: "Artificial Intelligence", type: "tech" },
  FINANCE: { id: "t5", label: "Finance", type: "industry" },
  ZERO_DAY: { id: "t6", label: "Zero-Day", type: "malware" },
};

const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    title: "Legacy Python Bootstrap Scripts Create Domain-Takeover Risk in Multiple PyPI Packages",
    url: "https://thehackernews.com/2025/11/legacy-python-bootstrap-scripts-create.html",
    source: "The Hacker News",
    publishedAt: "2025-11-29T10:00:00Z",
    summary: [
      "Vulnerability found in legacy Python setup tools allows attackers to hijack domains.",
      "Affects multiple popular PyPI packages used in production environments.",
      "Immediate patch recommended for all Python 3.x environments."
    ],
    threatLevel: "CRITICAL",
    threatScore: 92,
    tags: [TAGS.PYTHON, TAGS.SUPPLY_CHAIN, TAGS.ZERO_DAY],
    verificationStatus: "VERIFIED",
    verificationNote: "Confirmed by multiple security researchers and CISA alert #2025-112."
  },
  {
    id: "2",
    title: "North Korean Hackers Deploy 197 npm Packages to Spread Updated OtterCookie Malware",
    url: "https://thehackernews.com/2025/11/north-korean-hackers-deploy-197-npm.html",
    source: "The Hacker News",
    publishedAt: "2025-11-28T14:30:00Z",
    summary: [
      "Lazarus Group identified flooding npm with malicious packages.",
      "OtterCookie malware exfiltrates developer credentials and SSH keys.",
      "Campaign specifically targets crypto and fintech developers."
    ],
    threatLevel: "HIGH",
    threatScore: 78,
    tags: [TAGS.RANSOMWARE, TAGS.FINANCE, TAGS.SUPPLY_CHAIN],
    verificationStatus: "VERIFIED",
    verificationNote: "Verified via cross-reference with Mandiant threat intelligence report."
  },
  {
    id: "3",
    title: "New AI Tool Claims to Break AES-256 Encryption in Seconds",
    url: "https://fake-news-site.com/ai-breaks-crypto",
    source: "Dark Reading",
    publishedAt: "2025-11-29T08:00:00Z",
    summary: [
      "Anonymous group claims quantum-AI hybrid can crack standard encryption.",
      "No proof of concept provided, only a paid tool download.",
      "Experts are skeptical and suspect a scam."
    ],
    threatLevel: "LOW",
    threatScore: 20,
    tags: [TAGS.AI, TAGS.RANSOMWARE],
    verificationStatus: "DISPUTED",
    verificationNote: "Gemini Grounding: No scientific evidence found. Multiple sources label this as a 'scamware' campaign."
  },
  {
    id: "4",
    title: "AWS Releases New AI Security Best Practices Cheat Sheet",
    url: "https://thehackernews.com/2025/11/aws-ai-security.html",
    source: "The Hacker News",
    publishedAt: "2025-11-29T09:15:00Z",
    summary: [
      "AWS publishes guide for securing LLM deployments.",
      "Focuses on prompt injection defense and data privacy.",
      "Useful resource for DevSecOps teams implementing GenAI."
    ],
    threatLevel: "LOW",
    threatScore: 5,
    tags: [TAGS.AI, TAGS.PYTHON],
    verificationStatus: "VERIFIED",
    verificationNote: "Source matches official AWS press release."
  }
];

export async function fetchArticles(): Promise<Article[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return MOCK_ARTICLES;
}

export async function verifyArticle(id: string): Promise<Article | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Longer delay for "AI processing"
  return MOCK_ARTICLES.find((a) => a.id === id);
}

