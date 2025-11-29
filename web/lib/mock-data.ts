import { Article } from "./types";

const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    headline: "Legacy Python Bootstrap Scripts Create Domain-Takeover Risk",
    tldr: "A vulnerability in legacy Python setup tools allows attackers to hijack domains, affecting multiple PyPI packages.",
    title: "Legacy Python Bootstrap Scripts Create Domain-Takeover Risk in Multiple PyPI Packages",
    url: "https://thehackernews.com/2025/11/legacy-python-bootstrap-scripts-create.html",
    source: "The Hacker News",
    publishedAt: "2025-11-29T10:00:00Z",
    
    priority: "CRITICAL",
    categories: ["security", "vulnerability", "open_source", "programming"],
    content_type: "breaking_news",
    
    key_takeaways: [
        { point: "Legacy Python bootstrap scripts are vulnerable to domain takeover.", is_technical: true, highlight: true },
        { point: "Attackers can inject malicious code into PyPI packages.", is_technical: true, highlight: true },
        { point: "Immediate patch required for Python 3.x environments.", is_technical: false, highlight: true }
    ],
    affected_entities: [
        { entity_type: "technology", name: "Python", details: "Versions using legacy setup tools" },
        { entity_type: "platform", name: "PyPI", details: "Package repository" }
    ],
    action_items: [
        { priority: "immediate", action: "Audit Python environment for legacy bootstrap scripts.", target_audience: "DevOps" },
        { priority: "soon", action: "Update setuptools to latest version.", target_audience: "Developers" }
    ],
    
    short_summary: "Critical vulnerability in Python tools exposes PyPI packages to hijacking.",
    long_summary: "Researchers have identified a critical flaw in legacy Python bootstrap scripts that could allow attackers to register expired domains and hijack PyPI packages. This supply chain vulnerability affects a significant number of projects that rely on older setup tools. The issue stems from hardcoded URLs in the bootstrap scripts that point to domains which have since lapsed.",
    
    relevance_score: 9,
    confidence_score: 10,
    
    is_breaking_news: true,
    is_sponsored: false,
    worth_full_read: true,
    
    read_time_minutes: 5,
    related_topics: ["Python Security", "Supply Chain Attack", "PyPI", "Open Source Vulnerabilities"],
    
    mentioned_technologies: ["Python", "PyPI", "setuptools"],
    mentioned_companies: ["Python Software Foundation"],
    
    verificationStatus: "VERIFIED",
    verificationNote: "Confirmed by multiple security researchers and CISA alert #2025-112."
  },
  {
    id: "2",
    headline: "North Korean Hackers Deploy 197 npm Packages with Malware",
    tldr: "Lazarus Group is flooding npm with malicious packages to spread OtterCookie malware targeting crypto developers.",
    title: "North Korean Hackers Deploy 197 npm Packages to Spread Updated OtterCookie Malware",
    url: "https://thehackernews.com/2025/11/north-korean-hackers-deploy-197-npm.html",
    source: "The Hacker News",
    publishedAt: "2025-11-28T14:30:00Z",
    
    priority: "HIGH",
    categories: ["security", "malware", "web_dev", "crypto"],
    content_type: "news",
    
    key_takeaways: [
        { point: "Lazarus Group is behind a new wave of malicious npm packages.", is_technical: false, highlight: true },
        { point: "OtterCookie malware exfiltrates developer credentials and SSH keys.", is_technical: true, highlight: true },
        { point: "Campaign specifically targets crypto and fintech developers.", is_technical: false, highlight: false }
    ],
    affected_entities: [
        { entity_type: "platform", name: "npm", details: "Node.js package registry" },
        { entity_type: "industry", name: "FinTech/Crypto", details: "Targeted sector" },
        { entity_type: "company", name: "Lazarus Group", details: "Threat Actor" }
    ],
    action_items: [
        { priority: "immediate", action: "Check package-lock.json against IOC list.", target_audience: "Developers" },
        { priority: "immediate", action: "Rotate SSH keys if suspicious packages found.", target_audience: "All Users" }
    ],
    
    short_summary: "Lazarus Group targets crypto devs with malicious npm packages.",
    long_summary: "State-sponsored threat actors from North Korea, known as the Lazarus Group, have been observed deploying nearly 200 malicious packages to the npm registry. These packages masquerade as popular tools and, once installed, deploy the OtterCookie malware to steal SSH keys, AWS credentials, and wallet private keys from developer machines.",
    
    relevance_score: 8,
    confidence_score: 9,
    
    is_breaking_news: false,
    is_sponsored: false,
    worth_full_read: true,
    
    read_time_minutes: 4,
    related_topics: ["npm", "Malware", "Lazarus Group", "Crypto Heist"],
    
    mentioned_technologies: ["npm", "Node.js", "OtterCookie"],
    mentioned_companies: ["Lazarus Group"],
    
    verificationStatus: "VERIFIED",
    verificationNote: "Verified via cross-reference with Mandiant threat intelligence report."
  },
  {
    id: "3",
    headline: "New AI Tool Claims to Break AES-256 Encryption",
    tldr: "An anonymous group claims to have broken AES-256 with AI, but experts are skeptical and suspect a scam.",
    title: "New AI Tool Claims to Break AES-256 Encryption in Seconds",
    url: "https://fake-news-site.com/ai-breaks-crypto",
    source: "Dark Reading",
    publishedAt: "2025-11-29T08:00:00Z",
    
    priority: "LOW",
    categories: ["ai_ml", "crypto", "security"],
    content_type: "news",
    
    key_takeaways: [
        { point: "Claims of breaking AES-256 are likely fraudulent.", is_technical: true, highlight: true },
        { point: "No proof of concept provided, only a paid download.", is_technical: false, highlight: true },
        { point: "Experts warn this is likely a 'scamware' campaign.", is_technical: false, highlight: false }
    ],
    affected_entities: [
        { entity_type: "technology", name: "AES-256", details: "Encryption Standard" }
    ],
    action_items: [
        { priority: "when_possible", action: "Ignore claims and do not download the tool.", target_audience: "All Users" }
    ],
    
    short_summary: "Dubious claims of AI cracking AES-256 likely a scam.",
    long_summary: "A new tool circulating on dark web forums claims to use quantum-AI hybrid algorithms to crack AES-256 encryption in seconds. However, cryptographic experts have dismissed the claims as mathematically impossible with current technology. The tool is distributed via a paid download link, strongly suggesting a scam or malware distribution campaign.",
    
    relevance_score: 2,
    confidence_score: 8,
    
    is_breaking_news: false,
    is_sponsored: false,
    worth_full_read: false,
    
    read_time_minutes: 2,
    related_topics: ["Cryptography", "AI Scams", "Encryption"],
    
    mentioned_technologies: ["AES-256", "AI"],
    mentioned_companies: [],
    
    verificationStatus: "DISPUTED",
    verificationNote: "Gemini Grounding: No scientific evidence found. Multiple sources label this as a 'scamware' campaign."
  },
  {
    id: "4",
    headline: "AWS Releases New AI Security Best Practices",
    tldr: "AWS has published a new comprehensive guide for securing Generative AI workloads and LLM deployments.",
    title: "AWS Releases New AI Security Best Practices Cheat Sheet",
    url: "https://thehackernews.com/2025/11/aws-ai-security.html",
    source: "The Hacker News",
    publishedAt: "2025-11-29T09:15:00Z",
    
    priority: "INFO",
    categories: ["cloud", "ai_ml", "security", "best_practices"],
    content_type: "guide",
    
    key_takeaways: [
        { point: "New guide focuses on prompt injection and data privacy.", is_technical: true, highlight: true },
        { point: "Includes architecture patterns for secure RAG implementations.", is_technical: true, highlight: false },
        { point: "Essential reading for DevSecOps teams.", is_technical: false, highlight: false }
    ],
    affected_entities: [
        { entity_type: "company", name: "AWS", details: "Cloud Provider" },
        { entity_type: "technology", name: "LLMs", details: "Generative AI" }
    ],
    action_items: [
        { priority: "soon", action: "Review AWS AI Security Guide.", target_audience: "Architects" },
        { priority: "when_possible", action: "Update internal AI policies.", target_audience: "Security Team" }
    ],
    
    short_summary: "AWS releases security guide for LLMs.",
    long_summary: "Amazon Web Services (AWS) has released a detailed whitepaper and cheat sheet for securing Generative AI applications. The guide covers critical topics such as prompt injection defense, model theft prevention, and data privacy in RAG (Retrieval-Augmented Generation) architectures. It aligns with the NIST AI Risk Management Framework.",
    
    relevance_score: 5,
    confidence_score: 10,
    
    is_breaking_news: false,
    is_sponsored: false,
    worth_full_read: true,
    
    read_time_minutes: 15,
    related_topics: ["AWS", "LLM Security", "DevSecOps"],
    
    mentioned_technologies: ["AWS Bedrock", "LLM", "RAG"],
    mentioned_companies: ["AWS", "NIST"],
    
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
