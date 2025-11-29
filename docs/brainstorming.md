# 🛡️ CyberShepherd (formerly SheepAI)

**Domain:** [cybershepherd.app](https://cybershepherd.app)
**Tagline:** *Your guide in the wolf-filled web.*

## 📋 Problem Statement

Cybersecurity professionals and tech enthusiasts face **information overload**. Sites like *The Hacker News* publish large volumes of content daily.
*   **Too much noise:** Hard to filter relevant topics (Malware vs. AI vs. Policy).
*   **Time-consuming:** Long articles require time to digest.
*   **Trust issues:** Fear of AI hallucinations or fake news.
*   **Manual checking:** Users don't want to refresh the page constantly.
*   **Plain text:** Lack of quick visual indicators (Threat Level, Impact).

**Solution:** An AI-powered "Cybersecurity Intelligence Hub" that automates collection, verification, summarization, and delivery of news.

---

## 🎯 Core Value Proposition

1.  **Automated Intelligence:** Scrapes, categorizes, and summarizes news automatically.
2.  **Trust & Verification:** **"Fact-Check" button** powered by **Gemini 3.0 Pro with Google Search Grounding** to validate claims.
3.  **Visual First:**
    *   **Threat Meter:** 0-100 Gauge for severity.
    *   **TL;DR Cards:** 3 bullet points + threat score (shareable).
    *   **Mind Maps:** Visualizing affected systems (using AI generation).
4.  **Personalized:** Chat-based onboarding ("I work in FinTech") creates dynamic filters.
5.  **Proactive:** Notifications via **Slack** (MVP).

---

## 🛠 Tech Stack

*   **Frontend:** Next.js (App Router) + Tailwind CSS
*   **Database:** Supabase (Postgres)
    *   `pgvector` for RAG (Chat with News)
*   **AI & Logic:**
    *   **Orchestration:** LangChain
    *   **LLM:** Google Gemini 3.0 Pro (Summary, Threat Score, Fact Checking)
    *   **Visuals:** Custom UI components + AI-generated JSON for graphs
*   **Data Ingestion:**
    *   Source: `thehackernews.com` (RSS Feed)
    *   Fallback: Firecrawl (for deep scraping if needed)
*   **Notifications:** Slack Webhook Integration

---

## ⚡ Execution Plan (Hackathon Strategy)

### Phase 1: The Foundation (Data & Storage)
*   [ ] Setup Next.js project (`sheep-ai`)
*   [ ] Setup Supabase project & Schema
    *   `articles` (raw content)
    *   `processed_insights` (summary, score, tags)
    *   `users` (preferences)
*   [ ] Build Ingestion Script (RSS Parser)

### Phase 2: The AI Factory
*   [ ] **Processor Agent (LangChain):**
    *   Input: Article Text
    *   Output: Summary, Categories, Threat Score (0-100), Entities (for Mind Map)
*   [ ] **Fact-Check Agent:**
    *   Tool: Gemini 3.0 Pro + Google Search Grounding
    *   Output: Verified/Context Added status

### Phase 3: The Experience (UI & Demo)
*   [ ] **News Feed:** Cards with Threat Meter & TL;DR
*   [ ] **Chat Onboarding:** "Tell me about your role" -> Generates JSON filters
*   [ ] **Fact Check Button:** Interactive verification demo
*   [ ] **Slack Bot:** Push high-threat news to channel

---

## 🏆 Scoring Strategy (Judging Criteria)

| Criteria | Our Strategy |
| :--- | :--- |
| **Creativity** | **Threat Meter** & **Mind Maps** visuals; "Chat to configure" UX. |
| **Technical Execution** | **Multi-model consensus** (Fact Check w/ Grounding); RAG implementation. |
| **Business Impact** | Solves real "alert fatigue" for security pros. Slack integration fits B2B workflows. |
| **UI/UX Design** | Clean, visual-heavy cards (not walls of text). Green/Red/Yellow color coding. |
| **Demonstration** | Live demo of: Ingestion -> Alert -> Fact Check verification. |

---

## 🔮 Future Roadmap (Post-Hackathon)
*   Mobile App (React Native)
*   Discord & Email Integrations
*   Enterprise SSO
*   API for Security Operations Centers (SOC)

