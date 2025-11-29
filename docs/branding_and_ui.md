# 🎨 CyberShepherd Branding & UI/UX Strategy

## 🧠 Core Identity

*   **Name:** CyberShepherd
*   **Domain:** [cybershepherd.app](https://cybershepherd.app)
*   **Tagline:** *Your guide in the wolf-filled web.*
*   **Archetype:** The Protector / The Vigilant Guardian
*   **Vibe:** Trustworthy, High-Tech, Calm in the Chaos, Network-Connected

---

## 🐑 Logo Analysis

The logo features a **network mesh sheep** — a sheep silhouette filled with interconnected nodes and lines, representing:
*   **The Flock:** Users protected together in a network.
*   **Data Connections:** The AI processing and linking information.
*   **Tech Aesthetic:** Modern, digital, cybersecurity-forward.

**Logo Typography:**
*   "CYBER" — Dark charcoal grey (`#374151` / Zinc 700)
*   "SHEPHERD" — Emerald green (`#10b981` / Emerald 500)
*   Font style: Bold, sans-serif, tech-forward (similar to **Space Grotesk** or **Outfit**)

---

## 🖌️ Color Palette

### Primary Colors (Derived from Logo)

| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Shepherd Green** | `#10b981` | Primary actions, verified status, logo accent |
| **Deep Teal** | `#0d9488` | Gradient start, secondary highlights |
| **Network Dark** | `#064e3b` | Dark gradient, depth effects |
| **Charcoal** | `#374151` | Body text, "CYBER" in logo |
| **Slate** | `#1e293b` | Card backgrounds (dark mode) |
| **Zinc 950** | `#09090b` | Page background (dark mode) |

### Semantic Colors

| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Critical (Wolf Red)** | `#ef4444` | High threat (80-100), critical alerts |
| **Warning (Amber)** | `#f59e0b` | Medium threat (50-79), caution |
| **Safe (Emerald)** | `#10b981` | Low threat (0-49), verified, safe |
| **Info (Blue)** | `#3b82f6` | AI interactions, informational |

### Gradient (The "Network Glow")

```css
/* Primary gradient - matches logo sheep body */
background: linear-gradient(135deg, #064e3b 0%, #10b981 100%);

/* Subtle card glow for critical items */
box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
```

---

## 🔤 Typography

### Font Stack

| Role | Font | Fallback | Weight |
| :--- | :--- | :--- | :--- |
| **Headings** | Outfit | system-ui | 600-700 |
| **Body** | Inter | system-ui | 400-500 |
| **Code/Tags/Data** | JetBrains Mono | monospace | 400 |

### Type Scale

| Element | Size | Weight | Color |
| :--- | :--- | :--- | :--- |
| H1 (Hero) | 48px / 3rem | 700 | White |
| H2 (Section) | 32px / 2rem | 600 | White |
| H3 (Card Title) | 20px / 1.25rem | 600 | White |
| Body | 16px / 1rem | 400 | Zinc 300 |
| Caption/Meta | 14px / 0.875rem | 400 | Zinc 500 |
| Badge/Tag | 12px / 0.75rem | 500 | White on colored bg |

---

## 🧱 Component Design System (Shadcn/UI)

### 1. The Threat Card

The primary content unit. Displays a single news item.

```
┌─────────────────────────────────────────────────────┐
│ [🔴 Critical]  Supply Chain  •  2 hours ago         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  North Korean Hackers Deploy 197 npm Packages       │
│                                                     │
│  • Malicious packages target Node.js projects       │
│  • Install hooks execute data exfiltration          │
│  • Active exploitation confirmed by CISA            │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [npm] [Node.js] [Lazarus]     ████████░░ 92/100   │
│                                                     │
│  [✓ Fact-Check]  [💬 Discuss]  [📤 Share]          │
└─────────────────────────────────────────────────────┘
```

**Visual States:**
*   **Critical (80-100):** Red left border, red glow on hover
*   **Warning (50-79):** Amber left border
*   **Safe (0-49):** Green left border
*   **Verified:** Green checkmark badge in header

### 2. Threat Meter (Gauge)

A semi-circular speedometer-style gauge showing threat level.

```
        ╭─────────────╮
       ╱   🔴 92/100   ╲
      ╱                 ╲
     │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░│
      ╲                 ╱
       ╲    CRITICAL   ╱
        ╰─────────────╯
```

*   0-49: Green fill, "LOW" label
*   50-79: Amber fill, "MEDIUM" label
*   80-100: Red fill, "CRITICAL" label

### 3. Trust Badge

Displays verification status next to article title.

| Status | Visual | Description |
| :--- | :--- | :--- |
| Unverified | ⚠️ Grey outline badge | New, not yet checked |
| Verified | ✅ Green filled badge | Confirmed by sources |
| Disputed | ❌ Red outline badge | Conflicting info found |

### 4. Tag Pills

Small, rounded badges for categories and technologies.

*   **Category Tags:** Solid colored background (e.g., red for "Malware")
*   **Tech Tags:** Outline style with colored border (e.g., blue outline for "AWS")
*   **Matched Tags:** Highlighted with glow effect (matches user's stack)

### 5. The Shepherd Chat (Side Drawer)

Slide-in panel for RAG conversations.

```
┌──────────────────────────────────────┐
│  💬 Ask CyberShepherd          [✕]  │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Does this affect AWS Lambda?  │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 🐑 Yes, specifically Node.js  │  │
│  │ 18 runtimes. Check your       │  │
│  │ package-lock.json for...      │  │
│  │                               │  │
│  │ Sources: [CISA] [npm Blog]    │  │
│  └────────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│  [Type your question...]      [Send] │
└──────────────────────────────────────┘
```

---

## 📱 Layout Structure

### Landing Page

```
┌─────────────────────────────────────────────────────────────┐
│  [🐑 Logo]                    [Features] [Pricing] [Login]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           Stop Reading. Start Knowing.                      │
│                                                             │
│    Cybersecurity news filtered for YOUR tech stack.         │
│    AI-summarized. Fact-checked. Zero noise.                 │
│                                                             │
│              [Get Relevant News →]                          │
│                                                             │
│     ┌─────────────┐    ┌─────────────┐                     │
│     │   BEFORE    │ →  │   AFTER     │                     │
│     │  (chaos)    │    │  (clean)    │                     │
│     └─────────────┘    └─────────────┘                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Feature 1]        [Feature 2]        [Feature 3]          │
│  Your Stack.        Trust, But         Understand in        │
│  Your News.         Verify.            Seconds.             │
├─────────────────────────────────────────────────────────────┤
│  "12,000 articles filtered daily"  •  "2 min avg read"      │
├─────────────────────────────────────────────────────────────┤
│              [Start Free — No Credit Card]                  │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard (3-Column)

```
┌─────────────────────────────────────────────────────────────┐
│  [🐑 Logo]    [Dashboard]    [Settings]    [👤 Profile]     │
├─────────┬───────────────────────────────────┬───────────────┤
│         │                                   │               │
│ FILTERS │         NEWS FEED                 │  INSIGHTS     │
│         │                                   │               │
│ ☑ AWS   │  ┌─────────────────────────────┐  │  Threat Pulse │
│ ☑ Python│  │ [Card 1 - Critical]         │  │  ────────────│
│ ☑ Supply│  └─────────────────────────────┘  │  Ransomware   │
│   Chain │                                   │  ▲ +40%       │
│         │  ┌─────────────────────────────┐  │               │
│ ─────── │  │ [Card 2 - Warning]          │  │  Trending     │
│ Alert   │  └─────────────────────────────┘  │  ────────────│
│ Level   │                                   │  #SupplyChain │
│ [===70] │  ┌─────────────────────────────┐  │  #ZeroDay     │
│         │  │ [Card 3 - Safe]             │  │  #npm         │
│         │  └─────────────────────────────┘  │               │
└─────────┴───────────────────────────────────┴───────────────┘
```

---

## 🎬 Micro-Interactions & Animations

### 1. Card Hover
*   Slight lift (`translateY(-2px)`)
*   Border glow intensifies
*   "Discuss" and "Share" buttons fade in

### 2. Fact-Check Loading
*   Shimmer effect across the card
*   Pulsing "Verifying..." text
*   Checkmark or X animates in on completion

### 3. Tag Click
*   Tag "pops" with scale animation
*   Feed instantly filters with fade transition

### 4. Threat Meter
*   Gauge fills from 0 to final value on card load
*   Color transitions smoothly through green → amber → red

### 5. Network Background (Landing Page)
*   Subtle animated mesh/nodes in the background (matching logo aesthetic)
*   Nodes slowly drift and reconnect
*   Low opacity to not distract from content

---

## 🌙 Dark Mode (Default)

CyberShepherd is **dark mode first** — security professionals work in dark environments.

| Element | Light Mode | Dark Mode (Default) |
| :--- | :--- | :--- |
| Background | `#ffffff` | `#09090b` (Zinc 950) |
| Card BG | `#f4f4f5` | `#1e293b` (Slate 800) |
| Text Primary | `#18181b` | `#fafafa` (Zinc 50) |
| Text Secondary | `#71717a` | `#a1a1aa` (Zinc 400) |
| Border | `#e4e4e7` | `#27272a` (Zinc 800) |

---

## 📦 Asset Checklist

- [ ] Logo (SVG, PNG - light & dark variants)
- [ ] Favicon (32x32, 16x16)
- [ ] OG Image (1200x630) for social sharing
- [ ] App Icon (192x192, 512x512) for PWA
- [ ] Loading spinner (animated sheep or network pulse)
- [ ] Empty state illustrations
- [ ] Error state illustrations
