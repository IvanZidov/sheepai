# 🎨 CyberShepherd Branding & UI/UX Strategy

## 🧠 Core Identity
*   **Name:** CyberShepherd
*   **Tagline:** *Your guide in the wolf-filled web.*
*   **Archetype:** The Protector / The Vigilant Guardian.
*   **Vibe:** Trustworthy, High-Tech, Calm in the Chaos.

## 🖌️ Color Palette (Dark Mode First)
Since this is a cybersecurity tool, **Dark Mode** is the default.

*   **Background:** `Zinc 950` (Deep, dark grey/black, easier on eyes than pure black).
*   **Primary (The Shepherd's Light):** `#10b981` (Emerald 500) - Represents safety, verified status, and "Go".
*   **Secondary (The Tech):** `#3b82f6` (Blue 500) - Used for AI interactions, trusted information.
*   **Destructive (The Wolf):** `#ef4444` (Red 500) - High threat levels, critical alerts.
*   **Warning:** `#f59e0b` (Amber 500) - Potential threats, caution needed.

## 🧱 Shadcn/UI Component System
We will use `shadcn/ui` for a clean, accessible, and rapid UI.

### 1. Typography
*   **Headings:** `Inter` (Clean, modern, authoritative).
*   **Data/Code/Tags:** `JetBrains Mono` or `Geist Mono` (Tech aesthetic, easy to scan).

### 2. Key Components & Usage
*   **The Threat Card (`Card`)**
    *   **Header:** Title of the news article.
    *   **Content:** AI Summary (3 bullet points).
    *   **Footer:** 
        *   `Badge` for Tags (e.g., "Ransomware", "Zero-Day").
        *   `Progress` bar for **Threat Level** (Color-coded: Green -> Red).
    *   **Border:** Subtle glow indicating threat level.

*   **The Trust Badge (`Badge` + Tooltip)**
    *   A special component next to the title.
    *   States: 
        *   ✅ **Verified** (Gemini Grounding confirmed).
        *   ⚠️ **Unverified** (New source/Low confidence).
        *   ❌ **Disputed** (Fact check found conflicting info).

*   **The Shepherd Chat (`Sheet` / `Drawer`)**
    *   Slide-out panel for the "Chat with News" feature.
    *   User: "Is my company affected by this Python vulnerability?"
    *   AI: RAG response with citations.

*   **The Pulse Dashboard (`ScrollArea`)**
    *   A live feed layout, similar to TweetDeck or a Security Operations Center (SOC) monitor.

## 🖼️ Visual Assets ("The WOW Factor")
*   **Logo:** A minimalist line-art Shield combined with a Shepherd's Crook (or a pixelated sheep head inside a shield).
*   **Threat Meter:** Instead of a boring progress bar, maybe a semi-circle gauge (Speedometer style).
*   **Fact Check Animation:** A "scanning" effect when the user clicks "Verify with Gemini" (Shimmer effect on the card).

## 📱 Layout Structure (Next.js App Router)
*   **Navbar:** Minimal. Logo (Left) + "Pulse/Feed" (Center) + User Profile (Right).
*   **Hero Section (Landing):** 
    *   Big text: "Silence the Noise. Spot the Wolves."
    *   Interactive Demo: A fake "Malware Alert" transforming into a summarized, calm card.
*   **Main Feed:** 
    *   Left col: Filters & Personalization (Sticky).
    *   Center col: The News Feed (Infinite Scroll).
    *   Right col: "Threat Map" (Visualizing current global hotspots) or Trending Tags.

## 🎬 Interaction Design
*   **Hover Effects:** Cards slightly lift and glow.
*   **Micro-interactions:** 
    *   Clicking "Summarize" expands the card.
    *   Clicking a "Tag" adds it to the filter immediately.

