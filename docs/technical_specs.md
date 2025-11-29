# ⚙️ Technical Architecture & User Flow - CyberShepherd

## 🎯 Core Value Proposition

**CyberShepherd is NOT a security tool. It's a *relevance* tool for cybersecurity professionals.**

*   **Problem:** Security teams drown in 100+ daily articles. 95% are irrelevant to their stack.
*   **Solution:** AI-powered filtering that understands YOUR company's tech stack and delivers only what matters.
*   **Outcome:** A CISO using AWS + Python doesn't see WordPress exploits. They see the Python supply chain attack that could hit them Monday morning.

---

## 🗺️ User Flow: The "Noise-to-Signal" Journey

### 1. Landing Page (The "Hook")

**Goal:** Convert a stressed security professional into a signed-up user in < 30 seconds.

#### Above the Fold
*   **Headline:** "Stop Reading. Start Knowing."
*   **Subheadline:** "Cybersecurity news filtered for YOUR tech stack. AI-summarized. Fact-checked. Zero noise."
*   **Visual:** Side-by-side comparison:
    *   *Left (Before):* A chaotic wall of text (The Hacker News homepage).
    *   *Right (After):* A clean CyberShepherd Card showing "Critical: Python Supply Chain Attack" with a red threat badge and "Verified ✓".
*   **CTA Button:** "Get Relevant News →" (Emerald Green)

#### Feature Section 1: "Your Stack. Your News."
*   **Graphic:** A chat bubble: "We use AWS Lambda, Python, and PostgreSQL" → Feed instantly filters to show only relevant threats.
*   **Copy:** "Tell us your infrastructure once. We filter 10,000 articles down to the 5 that matter to you."

#### Feature Section 2: "Trust, But Verify"
*   **Graphic:** The "Verify with Gemini" button animation → ✅ "Confirmed by CISA, NVD, BleepingComputer".
*   **Copy:** "AI hallucinations are the new vulnerabilities. Every critical alert is fact-checked against live sources before it reaches your inbox."

#### Feature Section 3: "Understand in Seconds"
*   **Graphic:** A Mermaid.js attack chain diagram (Attacker → npm package → Your Lambda → Data Exfil).
*   **Copy:** "Don't parse 3,000-word reports. See the attack vector visualized in 3 seconds."

#### Social Proof Bar
*   "Monitoring 50+ Cybersecurity Sources | 12,000 Articles Filtered Daily | Average Read Time: 2 min vs 45 min"

#### Final CTA
*   **Headline:** "Your competitors are still reading. You're already patched."
*   **Button:** "Start Free — No Credit Card"

---

### 2. Onboarding (The "Shepherd's Handshake")

*   **Entry:** User clicks CTA → Auth (Google/GitHub SSO via Supabase).
*   **Interactive Setup (Chat Interface):**
    *   **AI:** "Welcome to CyberShepherd. To show you only what matters, tell me about your company."
    *   **User:** "I'm a Security Engineer at a FinTech startup. We run on AWS (Lambda, RDS), use Python and Node.js, and handle PCI-DSS data."
    *   **System Parses:**
        *   `[Role: Security Engineer]`
        *   `[Sector: FinTech]`
        *   `[Cloud: AWS]`
        *   `[Services: Lambda, RDS]`
        *   `[Languages: Python, Node.js]`
        *   `[Compliance: PCI-DSS]`
    *   **AI:** "Got it. I'll prioritize: AWS vulnerabilities, Python/Node supply chain attacks, and PCI-DSS compliance updates. Sound good?"
    *   **User:** "Yes" → Tags saved to `user_preferences`.
*   **Result:** Redirect to personalized Dashboard.

---

### 3. The Dashboard (The "Watchtower")

*   **Layout:** 3-column responsive design.

| Left Column (Sticky) | Center Column (Feed) | Right Column (Insights) |
| :--- | :--- | :--- |
| **My Filters** | **The News Stream** | **Threat Pulse** |
| ☑️ AWS | Cards sorted by `relevance_score` | "Ransomware +40% this week" |
| ☑️ Python | (threat_score × tag_match) | **Trending Tags** |
| ☑️ Supply Chain | Red border = Critical | #SupplyChain #ZeroDay |
| ☑️ PCI-DSS | Yellow = Warning | **Quick Stats** |
| **Alert Threshold** | Green = Informational | "5 new relevant today" |
| Slider: 70+ | | |

---

### 4. News Consumption (The "Wolf Spotting")

*   **Trigger:** User sees a Red Border Card: "North Korean Hackers Deploy 197 npm Packages".
*   **Card Anatomy:**
    *   **Header:** Headline + Source + Time ("2 hours ago").
    *   **Body:** 2-3 sentence executive summary (TL;DR).
    *   **Key Takeaways:** Bullet points of critical info.
    *   **Footer:**
        *   `Badge`: "Supply Chain" (Red), "Node.js" (Blue).
        *   `Threat Meter`: 92/100 (Visual gauge based on Relevance Score).
        *   `Trust Status`: ⚠️ Unverified.
*   **Interaction Flow:**
    1.  **Glance:** User reads TL;DR in 10 seconds.
    2.  **Verify:** Clicks "Fact-Check" → Gemini + Google Search Grounding → ✅ "Verified by 3 sources".
    3.  **Expand:** Clicks card → Shows:
        *   Full AI-generated analysis (Long Summary).
        *   "Action Items" (Immediate/Soon).
        *   "Affected Entities" (Companies/Products).
        *   "Attack Chain" (Mermaid.js diagram).
    4.  **Act:** "Share to Slack" button → Sends formatted alert to their security channel.

---

### 5. Chat with Data (The "Shepherd's Counsel")

*   **Trigger:** User needs specific context.
*   **Action:** Clicks "Ask CyberShepherd" on any card.
*   **Example Conversation:**
    *   **User:** "Does this npm attack affect our Lambda functions?"
    *   **Backend (RAG):**
        *   Retrieves article + user's tech stack from `user_preferences`.
        *   Searches `pgvector` for similar past incidents.
        *   Sends context to Gemini.
    *   **AI:** "Yes. Your Lambda uses Node.js 18. The malicious packages target `npm install` hooks. Check your `package-lock.json` for these 197 package names: [link]. Remediation: Run `npm audit` and pin dependencies."

---

## 🏗️ Technical Specifications

### 1. Database Schema (Supabase)

#### `articles`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `url` | Text | Unique constraint (prevent duplicates) |
| `title` | Text | Original title |
| `content_raw` | Text | Full HTML/Text scraped |
| `published_at` | Timestamp | Original publish date |
| `source` | Text | "The Hacker News", etc. |
| `created_at` | Timestamp | When we ingested it |

#### `processed_insights` (1:1 with articles)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `article_id` | UUID | FK to articles |
| `analysis` | JSONB | Full structured `ArticleAnalysis` object |
| `embedding` | Vector(768) | For RAG (Summary + Title) |
| `trust_status` | Text | "unverified", "verified", "disputed" |
| `verification_sources` | JSONB | `["https://cisa.gov/...", "https://nvd.nist.gov/..."]` |

#### `user_preferences`
| Column | Type | Description |
| :--- | :--- | :--- |
| `user_id` | UUID | FK to auth.users |
| `company_name` | Text | Optional |
| `role` | Text | "CISO", "Security Engineer", etc. |
| `sector` | Text | "FinTech", "Healthcare", etc. |
| `tech_stack` | JSONB | `{"cloud": ["AWS"], "languages": ["Python"], "services": ["Lambda"]}` |
| `compliance` | JSONB | `["PCI-DSS", "SOC2"]` |
| `alert_threshold` | Int | Minimum threat score to notify (default: 70) |
| `slack_webhook` | Text | For notifications |

---

### 2. AI Pipeline (LangChain + Gemini)

#### Agent A: The Analyst (Ingestion)
*   **Trigger:** New RSS item from The Hacker News.
*   **Input:** Raw article text.
*   **Prompt:** Uses the `General News Article Analysis Schema` to extract structured data.
*   **Output:** Structured JSON (`ArticleAnalysis`) → Saved to `processed_insights`.

#### Agent B: The Skeptic (Verification)
*   **Trigger:** User clicks "Fact-Check" OR `priority == CRITICAL`.
*   **Tool:** Gemini 3.0 Pro with Google Search Grounding.
*   **Prompt:**
    ```
    Verify these claims from a cybersecurity article:
    "{tldr}"
    
    Search authoritative sources (CISA, NVD, vendor advisories, reputable security blogs).
    Return:
    1. Verification Status: "verified", "partially_verified", "disputed", "unverifiable".
    2. Supporting Sources: URLs of confirming sources.
    3. Discrepancies: Any conflicting information found.
    ```

#### Agent C: The Visualizer
*   **Trigger:** User expands a card.
*   **Prompt:**
    ```
    Based on this cybersecurity incident, generate a Mermaid.js flowchart showing the attack chain.
    Include: Initial vector → Exploitation → Payload → Impact.
    Keep it under 10 nodes. Use clear labels.
    ```
*   **Output:** Mermaid syntax string → Rendered client-side.

---

### 3. Article Analysis Schema

The core data structure for all processed articles:

```python
class ArticleAnalysis(BaseModel):
    headline: str               # Catchy 1-line summary
    tldr: str                  # 2-3 sentence executive summary
    priority: Priority         # CRITICAL, HIGH, MEDIUM, LOW, INFO
    categories: list[ContentCategory]
    content_type: ContentType
    key_takeaways: list[KeyTakeaway]
    affected_entities: list[AffectedEntity]
    action_items: list[ActionItem]
    short_summary: str
    long_summary: str
    relevance_score: int       # 1-10
    confidence_score: int      # 1-10
    is_breaking_news: bool
    is_sponsored: bool
    worth_full_read: bool
    read_time_minutes: int
    related_topics: list[str]
    mentioned_technologies: list[str]
    mentioned_companies: list[str]
```

---

### 4. API Routes (Next.js App Router)

| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/ingest` | POST | Cron-triggered. Fetches RSS → Agent A → DB. |
| `/api/feed` | GET | Returns paginated articles. Params: `categories[]`, `minPriority`, `page`. |
| `/api/article/[id]` | GET | Full article details + AI analysis. |
| `/api/verify/[id]` | POST | Triggers Agent B → Updates `trust_status`. |
| `/api/chat` | POST | RAG chat. Body: `{ message, articleId? }`. Streams response. |
| `/api/preferences` | GET/PUT | User's tech stack and notification settings. |
| `/api/notify/slack` | POST | Sends formatted alert to user's Slack webhook. |

---

### 5. Relevance Scoring Algorithm

```
relevance_score = (priority_score * 0.4) + (tag_match_score * 0.6)

Where:
- priority_score: CRITICAL=10, HIGH=8, MEDIUM=5, LOW=2, INFO=1
- tag_match_score: (matched_categories + matched_tech) / user_total_interests * 10
```

---

### 6. Security & Performance

*   **RLS (Row Level Security):**
    *   `articles` + `processed_insights`: Public read.
    *   `user_preferences`: User can only read/write their own row.
*   **Edge Caching:** Feed results cached for 5 minutes at edge.
*   **Rate Limiting:** 
    *   `/api/chat`: 20 requests/minute per user.
    *   `/api/verify`: 10 requests/minute per user.
*   **Data Retention:** Articles older than 90 days archived to cold storage.
