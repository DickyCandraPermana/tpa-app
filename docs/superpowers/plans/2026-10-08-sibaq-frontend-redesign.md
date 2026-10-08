# SibaQ Frontend Architectural Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the SibaQ (`tpa-app`) frontend into the "Taman Belajar Santri" design system featuring an Emerald Oasis & Warm Gold palette, mobile-first centered shell, tactile 3D interactive components, dual-script typography (Amiri & Nunito), gamified learning adventure path, and adaptive role experiences for santri and asatidz.

**Architecture:** Presentation-driven architecture layered atop clean services. Core UI primitives (`TactileButton`, `TactileCard`, `GoldBadge`, `ArabicText`) provide the tactile foundation; layout primitives (`MobileAppShell`, `AdaptiveTopBar`, `AdaptiveBottomNav`) enforce mobile-first viewport boundaries with dynamic role adaptation; feature modules (`LearningPathMap`, `HijaiyahCard`, `ScoreCelebration`, `RewardCard`, `SantriProgressCard`) consume Firebase services and custom hooks.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS v4, Lucide React, Firebase 11, Zod, Vitest, Happy-DOM, Testing Library React.

**Spec:** `docs/superpowers/specs/2026-10-08-sibaq-frontend-redesign.md`

## Global Constraints

- Canvas Background: `#FDFBF7` (*Warm Ivory / Qalam Paper*) with soft sand borders `#F3E8D6`.
- Emerald Palette: `emerald-deep` (`#064E3B`), `emerald-main` (`#047857`), `emerald-light` (`#10B981`), `emerald-tint` (`#ECFDF5`).
- Warm Gold Palette: `gold-star` (`#F59E0B`), `gold-shade` (`#D97706`), `gold-glow` (`#FEF3C7`).
- Mobile-First Viewport Container: centered container `max-w-md` (~448px) with `border-x border-[#F3E8D6]` on desktop; 100% width on mobile.
- Dual-Script Typography: Latin (`Nunito` / `Plus Jakarta Sans`) and Arabic (`Amiri`) with `dir="rtl"` and 36px–64px sizes.
- Tactile 3D Buttons: 3D bottom bevel (`border-b-4 active:border-b-0 active:translate-y-1`) for physical feedback.
- Role Adaptability: adaptive navigation and views for both `santri` and `ustaz`.
- Zero raw `window.alert()` / `window.confirm()`.
- Zero TypeScript compile errors (`pnpm exec tsc --noEmit`).
- All Vitest test suites must pass before task completion.

## Review Focus

1. **Exact balance redemption:** `RewardCard` when user points are exactly equal to required points (`userPoints === reward.pointsRequired`) must remain enabled with 0 remaining points, not disabled as insufficient (pinned to Task 4).
2. **Role fallback resilience:** `AdaptiveBottomNav` when passed an unrecognized or missing role must gracefully fallback to `santri` 5-tab navigation without throwing runtime exceptions (pinned to Task 3).
3. **Arabic text rendering & RTL safety:** `ArabicText` when passed empty strings or texts with dense harakat/tanwin must preserve `dir="rtl"` and render valid markup without line-breaking glitches (pinned to Task 2).
4. **Celebration score boundary handling:** `ScoreCelebration` when quiz score is 0% must render 0 stars and encouraging copy without NaN values or negative coin displays (pinned to Task 5).
5. **Tactile button disabled suppression:** `TactileButton` when `disabled={true}` must suppress click events and disable the active translate animation (pinned to Task 2).

---

### Task 1: Design System Tokens, Arabic Typography & Happy-DOM Test Setup

**Files:**
- Modify: `vitest.config.mjs`
- Modify: `package.json`
- Modify: `styles/globals.css`
- Modify: `app/layout.tsx`
- Test: `tests/theme.test.ts`

**Interfaces:**
- Produces: CSS color variables and theme tokens for `#FDFBF7`, `#F3E8D6`, `#064E3B`, `#047857`, `#10B981`, `#ECFDF5`, `#F59E0B`, `#D97706`, `#FEF3C7`; Google Font `Amiri` configured with CSS variable `--font-amiri` alongside `Nunito`.

- [ ] **Step 1: Write failing test in `tests/theme.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Design System Tokens & Configuration", () => {
  it("defines Islamic Oasis & Warm Gold color tokens in styles/globals.css", () => {
    const cssContent = fs.readFileSync(path.resolve(__dirname, "../styles/globals.css"), "utf-8");
    expect(cssContent).toContain("#FDFBF7");
    expect(cssContent).toContain("#047857");
    expect(cssContent).toContain("#F59E0B");
    expect(cssContent).toContain("#F3E8D6");
  });

  it("configures Amiri and Nunito fonts in app/layout.tsx", () => {
    const layoutContent = fs.readFileSync(path.resolve(__dirname, "../app/layout.tsx"), "utf-8");
    expect(layoutContent).toContain("Amiri");
    expect(layoutContent).toContain("Nunito");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/theme.test.ts`
Expected: FAIL (Amiri not yet in `app/layout.tsx` and custom palette tokens missing in `styles/globals.css`).

- [ ] **Step 3: Implement theme tokens and fonts**

In `styles/globals.css`, add `@theme` tokens for `canvas-ivory`, `sand-border`, `emerald-deep`, `emerald-main`, `emerald-light`, `emerald-tint`, `gold-star`, `gold-shade`, `gold-glow`, and tactile utility classes (`.btn-tactile`).
In `app/layout.tsx`, import `Amiri` from `next/font/google`, define `amiri` font with `subsets: ["arabic"]` and `variable: "--font-amiri"`, and apply it to `<body>` with background `#FDFBF7`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/theme.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.mjs styles/globals.css app/layout.tsx tests/theme.test.ts
git commit -m "feat(design-system): setup emerald oasis tokens, amiri arabic font, and happy-dom test runner"
```

---

### Task 2: Core Tactile UI Primitives (`TactileButton`, `TactileCard`, `GoldBadge`, `ArabicText`)

**Files:**
- Create: `components/ui/TactileButton.tsx`
- Create: `components/ui/TactileCard.tsx`
- Create: `components/ui/GoldBadge.tsx`
- Create: `components/ui/ArabicText.tsx`
- Test: `tests/components/TactileButton.test.tsx`
- Test: `tests/components/ArabicText.test.tsx`

**Interfaces:**
- Consumes: React standard props, Lucide icons
- Produces:
  - `TactileButton`: `({ variant?: "primary" | "secondary" | "accent" | "ghost" | "coral", size?: "sm" | "md" | "lg", disabled?: boolean, onClick?: () => void, children: React.ReactNode, className?: string, type?: "button" | "submit" }) => JSX.Element`
  - `TactileCard`: `({ children: React.ReactNode, className?: string, onClick?: () => void, hoverEffect?: boolean }) => JSX.Element`
  - `GoldBadge`: `({ type: "coin" | "lantern" | "star", value: number | string, size?: "sm" | "md" }) => JSX.Element`
  - `ArabicText`: `({ text: string, size?: "sm" | "md" | "lg" | "xl" | "2xl", className?: string }) => JSX.Element`

- [ ] **Step 1: Write failing tests in `tests/components/TactileButton.test.tsx` and `tests/components/ArabicText.test.tsx`**

In `tests/components/TactileButton.test.tsx`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TactileButton from "@/components/ui/TactileButton";

describe("TactileButton Component", () => {
  it("renders with 3D tactile bevel styling and handles click", () => {
    const handleClick = vi.fn();
    render(<TactileButton onClick={handleClick}>Mulai Kuis</TactileButton>);
    const btn = screen.getByRole("button", { name: /Mulai Kuis/i });
    expect(btn).toBeDefined();
    expect(btn.className).toContain("border-b-4");
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Review Focus #5: Disabled suppression
  it("suppresses click events and removes active movement when disabled", () => {
    const handleClick = vi.fn();
    render(<TactileButton disabled onClick={handleClick}>Terkunci</TactileButton>);
    const btn = screen.getByRole("button", { name: /Terkunci/i });
    expect(btn.hasAttribute("disabled")).toBe(true);
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
    expect(btn.className).toContain("opacity-50");
  });
});
```

In `tests/components/ArabicText.test.tsx`:
```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ArabicText from "@/components/ui/ArabicText";

describe("ArabicText Component", () => {
  it("renders arabic typography with dir='rtl' attribute", () => {
    render(<ArabicText text="بِسْمِ اللَّهِ" size="xl" />);
    const el = screen.getByText("بِسْمِ اللَّهِ");
    expect(el).toBeDefined();
    expect(el.getAttribute("dir")).toBe("rtl");
    expect(el.className).toContain("font-amiri");
  });

  // Review Focus #3: Empty string & composite harakat safety
  it("renders safely without crash when empty text is passed", () => {
    const { container } = render(<ArabicText text="" />);
    expect(container.querySelector("span")?.getAttribute("dir")).toBe("rtl");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/components/TactileButton.test.tsx tests/components/ArabicText.test.tsx`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement UI primitives**

Create `components/ui/TactileButton.tsx` with variant styles (`primary` emerald bevel `border-emerald-800 bg-emerald-600 active:border-b-0 active:translate-y-1`, `accent` gold bevel, etc.).
Create `components/ui/TactileCard.tsx` with `rounded-3xl bg-white border border-[#F3E8D6] shadow-sm`.
Create `components/ui/GoldBadge.tsx` with tactile chip styling for 🪙 coins, 🏮 streak, ⭐ stars.
Create `components/ui/ArabicText.tsx` with font Amiri, `dir="rtl"`, and size mapping (36px–64px).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/components/TactileButton.test.tsx tests/components/ArabicText.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/ui/TactileButton.tsx components/ui/TactileCard.tsx components/ui/GoldBadge.tsx components/ui/ArabicText.tsx tests/components/TactileButton.test.tsx tests/components/ArabicText.test.tsx
git commit -m "feat(ui): implement TactileButton, TactileCard, GoldBadge, and ArabicText primitives"
```

---

### Task 3: Mobile App Shell & Adaptive Role Navigation

**Files:**
- Create: `components/layout/MobileAppShell.tsx`
- Create: `components/layout/AdaptiveTopBar.tsx`
- Create: `components/layout/AdaptiveBottomNav.tsx`
- Modify: `app/dashboard/layout.tsx`
- Test: `tests/layout/AdaptiveBottomNav.test.tsx`

**Interfaces:**
- Consumes: `useAuth`, `GoldBadge`
- Produces:
  - `MobileAppShell`: `({ children: React.ReactNode, showTopBar?: boolean, showBottomNav?: boolean }) => JSX.Element`
  - `AdaptiveTopBar`: `() => JSX.Element` (renders avatar + coins/lanterns for santri; halaqah badge + pending claims for ustaz)
  - `AdaptiveBottomNav`: `({ role?: string, activePath?: string }) => JSX.Element` (5 tabs for santri, 4 tabs for ustaz)

- [ ] **Step 1: Write failing test in `tests/layout/AdaptiveBottomNav.test.tsx`**

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdaptiveBottomNav from "@/components/layout/AdaptiveBottomNav";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("AdaptiveBottomNav Component", () => {
  it("renders 5 santri tabs when role is 'santri'", () => {
    render(<AdaptiveBottomNav role="santri" activePath="/dashboard" />);
    expect(screen.getByText("Peta")).toBeDefined();
    expect(screen.getByText("Materi")).toBeDefined();
    expect(screen.getByText("Kuis")).toBeDefined();
    expect(screen.getByText("Toko")).toBeDefined();
    expect(screen.getByText("Profil")).toBeDefined();
  });

  it("renders 4 ustaz tabs when role is 'ustaz'", () => {
    render(<AdaptiveBottomNav role="ustaz" activePath="/dashboard" />);
    expect(screen.getByText("Progres")).toBeDefined();
    expect(screen.getByText("Modul")).toBeDefined();
    expect(screen.getByText("Klaim")).toBeDefined();
    expect(screen.getByText("Akun")).toBeDefined();
  });

  // Review Focus #2: Fallback resilience
  it("gracefully falls back to santri navigation if role is unrecognized or undefined", () => {
    render(<AdaptiveBottomNav role={undefined as any} activePath="/dashboard" />);
    expect(screen.getByText("Peta")).toBeDefined();
    expect(screen.getByText("Materi")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/layout/AdaptiveBottomNav.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement MobileAppShell, AdaptiveTopBar, and AdaptiveBottomNav**

Create `components/layout/MobileAppShell.tsx`:
- Desktop wrapper with background `#FDFBF7`, centered container `max-w-md min-h-screen bg-[#FDFBF7] border-x border-[#F3E8D6] shadow-2xl relative flex flex-col pb-20`.
Create `components/layout/AdaptiveTopBar.tsx`:
- Sticky header with blur backdrop `#FDFBF7/90`, border-b `#F3E8D6/60`.
- If role is `santri`: avatar + name on left, GoldBadges (🪙 `totalPoint`, 🏮 `streak = 3`) on right.
- If role is `ustaz`: Halaqah badge on left, pending claim indicator on right.
Create `components/layout/AdaptiveBottomNav.tsx`:
- Fixed bottom dock (`max-w-md w-full bottom-0 bg-white/95 backdrop-blur-md border-t border-[#F3E8D6] rounded-t-3xl shadow-lg pb-safe`).
- Role-based tabs routing to `/dashboard`, `/dashboard/courses`, `/dashboard/soal`, `/dashboard/exchange`, `/dashboard/profile`.
Update `app/dashboard/layout.tsx`:
- Wrap children with `MobileAppShell` using `AdaptiveTopBar` and `AdaptiveBottomNav`, replacing the desktop sidebar with the responsive tactile shell.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/layout/AdaptiveBottomNav.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/layout/MobileAppShell.tsx components/layout/AdaptiveTopBar.tsx components/layout/AdaptiveBottomNav.tsx app/dashboard/layout.tsx tests/layout/AdaptiveBottomNav.test.tsx
git commit -m "feat(layout): implement MobileAppShell, AdaptiveTopBar, and AdaptiveBottomNav"
```

---

### Task 4: Feature Components (`RewardCard` & `SantriProgressCard`)

**Files:**
- Create: `components/features/RewardCard.tsx`
- Create: `components/features/SantriProgressCard.tsx`
- Test: `tests/components/RewardCard.test.tsx`

**Interfaces:**
- Consumes: `TactileButton`, `TactileCard`, `GoldBadge`, `Reward`
- Produces:
  - `RewardCard`: `({ reward: Reward, userPoints: number, onRedeem: (reward: Reward) => void, isRedeeming?: boolean }) => JSX.Element`
  - `SantriProgressCard`: `({ santriName: string, jilid: string, page: number, totalPages: number, completedCount: number, onUpdateProgress?: () => void }) => JSX.Element`

- [ ] **Step 1: Write failing test in `tests/components/RewardCard.test.tsx`**

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RewardCard from "@/components/features/RewardCard";
import { Reward } from "@/types/schema";

const mockReward: Reward = {
  id: "r1",
  name: "Buku Kisah Nabi",
  pointsRequired: 20,
};

describe("RewardCard Component", () => {
  it("renders reward details and enables redemption when user has more points", () => {
    const handleRedeem = vi.fn();
    render(<RewardCard reward={mockReward} userPoints={25} onRedeem={handleRedeem} />);
    expect(screen.getByText("Buku Kisah Nabi")).toBeDefined();
    const btn = screen.getByRole("button", { name: /Tukar Hadiah/i });
    expect(btn.hasAttribute("disabled")).toBe(false);
    fireEvent.click(btn);
    expect(handleRedeem).toHaveBeenCalledWith(mockReward);
  });

  // Review Focus #1: Exact point balance equality
  it("enables redemption when userPoints is exactly equal to pointsRequired", () => {
    const handleRedeem = vi.fn();
    render(<RewardCard reward={mockReward} userPoints={20} onRedeem={handleRedeem} />);
    const btn = screen.getByRole("button", { name: /Tukar Hadiah/i });
    expect(btn.hasAttribute("disabled")).toBe(false);
    fireEvent.click(btn);
    expect(handleRedeem).toHaveBeenCalledWith(mockReward);
  });

  it("disables redemption and shows missing coins when user points are insufficient", () => {
    const handleRedeem = vi.fn();
    render(<RewardCard reward={mockReward} userPoints={15} onRedeem={handleRedeem} />);
    expect(screen.getByText(/Kurang 5 Poin/i)).toBeDefined();
    const btn = screen.getByRole("button", { name: /Kurang 5 Poin/i });
    expect(btn.hasAttribute("disabled")).toBe(true);
    fireEvent.click(btn);
    expect(handleRedeem).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/components/RewardCard.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement RewardCard and SantriProgressCard**

Create `components/features/RewardCard.tsx`:
- Render with `TactileCard`.
- Dynamic calculation: if `userPoints >= reward.pointsRequired`, button says "Tukar Hadiah" with `variant="accent"`.
- If `userPoints < reward.pointsRequired`, button says `Kurang ${reward.pointsRequired - userPoints} Poin` and is `disabled={true}`.
Create `components/features/SantriProgressCard.tsx`:
- For ustaz monitoring: santri name, jilid label, visual progress bar (`page / totalPages`), and a tactile "Update Setoran" button.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/components/RewardCard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/features/RewardCard.tsx components/features/SantriProgressCard.tsx tests/components/RewardCard.test.tsx
git commit -m "feat(features): implement RewardCard and SantriProgressCard with balance checking"
```

---

### Task 5: Learning & Quiz Components (`HijaiyahCard`, `ScoreCelebration`, `QuestionCard` Enhancement)

**Files:**
- Create: `components/features/HijaiyahCard.tsx`
- Create: `components/features/ScoreCelebration.tsx`
- Modify: `components/QuestionCard.tsx`
- Modify: `hooks/useQuizSession.ts`
- Test: `tests/hooks/useQuizSession.test.ts`
- Test: `tests/components/ScoreCelebration.test.tsx`

**Interfaces:**
- Consumes: `ArabicText`, `TactileButton`, `TactileCard`, `Question`
- Produces:
  - `HijaiyahCard`: `({ arabic: string, transliteration: string, description?: string, audioUrl?: string }) => JSX.Element`
  - `ScoreCelebration`: `({ isOpen: boolean, scorePercent: number, correctCount: number, totalQuestions: number, sessionPoints: number, onRestart: () => void, onContinue: () => void }) => JSX.Element`

- [ ] **Step 1: Write failing test in `tests/components/ScoreCelebration.test.tsx`**

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ScoreCelebration from "@/components/features/ScoreCelebration";

describe("ScoreCelebration Modal", () => {
  it("renders 3 stars and mumtaz celebration for 100% score", () => {
    render(
      <ScoreCelebration
        isOpen={true}
        scorePercent={100}
        correctCount={5}
        totalQuestions={5}
        sessionPoints={15}
        onRestart={vi.fn()}
        onContinue={vi.fn()}
      />
    );
    expect(screen.getByText(/Mumtaz! Kamu Hebat!/i)).toBeDefined();
    expect(screen.getByText("+15 🪙")).toBeDefined();
  });

  // Review Focus #4: 0% boundary handling
  it("renders encouraging message without crash or NaN when score is 0%", () => {
    render(
      <ScoreCelebration
        isOpen={true}
        scorePercent={0}
        correctCount={0}
        totalQuestions={5}
        sessionPoints={0}
        onRestart={vi.fn()}
        onContinue={vi.fn()}
      />
    );
    expect(screen.getByText(/Tetap Semangat!/i)).toBeDefined();
    expect(screen.getByText("0%")).toBeDefined();
    expect(screen.getByText("+0 🪙")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/components/ScoreCelebration.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement ScoreCelebration, HijaiyahCard, and update QuestionCard**

Create `components/features/ScoreCelebration.tsx`:
- Display stars based on score: 100% -> 3 stars, >=60% -> 2 stars, >0% -> 1 star, 0% -> 0 stars.
- Headline: 100% -> "Mumtaz! Kamu Hebat!", >=60% -> "Bagus Sekali!", else -> "Tetap Semangat! Ayo Coba Lagi!".
- Show points earned, correct answer counter, and tactile action buttons.
Create `components/features/HijaiyahCard.tsx`:
- Render large `ArabicText` (56px–64px) on warm ivory surface, with audio player trigger button.
Enhance `components/QuestionCard.tsx`:
- Modernize option buttons to tactile 3D cards with emerald (correct) and coral (incorrect) feedback.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/components/ScoreCelebration.test.tsx tests/hooks/useQuizSession.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/features/HijaiyahCard.tsx components/features/ScoreCelebration.tsx components/QuestionCard.tsx tests/components/ScoreCelebration.test.tsx
git commit -m "feat(quiz): implement ScoreCelebration modal, HijaiyahCard, and tactile QuestionCard"
```

---

### Task 6: Screen Redesign - Landing Page (`/`) and Auth Screens (`/login`, `/register`, `/auth`)

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/login/page.tsx`
- Modify: `app/register/page.tsx`
- Modify: `app/auth/page.tsx`

**Interfaces:**
- Consumes: `MobileAppShell`, `TactileButton`, `TactileCard`, `ArabicText`
- Produces: Redesigned landing page with "Taman Belajar Santri" aesthetic and role-switched login/register forms.

- [ ] **Step 1: Write verification test for landing and auth routes**

Verify routes compile and render cleanly with Next.js page tests or build verification.

- [ ] **Step 2: Redesign `app/page.tsx`**

Replace old gradient background with `#FDFBF7` canvas, arabesque watermark pattern, Hero banner "Belajar Mengaji Asyik & Berkah Bersama SibaQ", massive tactile CTA "Mulai Petualangan Mengaji" leading to `/auth` or `/dashboard`, and 3 tactile cards for Peta Jalur Iqro, Arena Kuis Pahala, and Toko Hadiah Santri.

- [ ] **Step 3: Redesign `app/auth/page.tsx`, `app/login/page.tsx`, and `app/register/page.tsx`**

In `app/login/page.tsx` and `app/register/page.tsx`:
- Role switcher pill tab: **[ 👦 Santri ]** / **[ 👳 Ustadz ]**.
- Tactile inputs with soft sand borders and friendly password eye icon.
- Appreciative error cards replacing raw red texts.
- Tactile submit button in emerald variant.

- [ ] **Step 4: Verify with test runner and typecheck**

Run: `pnpm test && pnpm exec tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/login/page.tsx app/register/page.tsx app/auth/page.tsx
git commit -m "feat(screens): redesign landing page and role-switchable auth screens"
```

---

### Task 7: Screen Redesign - Peta Belajar Santri & Halaqah Dashboard (`/dashboard`)

**Files:**
- Create: `components/features/LearningPathMap.tsx`
- Modify: `app/dashboard/page.tsx`
- Test: `tests/features/LearningPathMap.test.tsx`

**Interfaces:**
- Consumes: `useAuth`, `TactileCard`, `TactileButton`, `GoldBadge`, `SantriProgressCard`
- Produces:
  - `LearningPathMap`: `({ completedCourses: string[], onSelectCourse: (id: string) => void }) => JSX.Element`
  - `/dashboard`: Unified dashboard rendering `LearningPathMap` for santri or Halaqah monitoring for ustaz.

- [ ] **Step 1: Write failing test in `tests/features/LearningPathMap.test.tsx`**

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LearningPathMap from "@/components/features/LearningPathMap";

describe("LearningPathMap Component", () => {
  it("renders course nodes with completed, active, and locked states", () => {
    const handleSelect = vi.fn();
    render(
      <LearningPathMap
        completedCourses={["c1"]}
        onSelectCourse={handleSelect}
      />
    );
    expect(screen.getByText("Huruf Hijaiyah Dasar")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/features/LearningPathMap.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement LearningPathMap and update `app/dashboard/page.tsx`**

Create `components/features/LearningPathMap.tsx`:
- Vertical winding SVG curve with nodes representing curriculum milestones (Hijaiyah 1, 2, Fathah, Kasrah, Dhommah, Tanwin, Tajwid).
- Node states:
  - Completed: gold border, ⭐⭐⭐ icons, checkmark.
  - Active: pulsing emerald ring, open book icon.
  - Locked: sand border, mosque dome / lock icon.
Update `app/dashboard/page.tsx`:
- When role is `santri`: render daily mission banner ("Selesaikan 1 Materi Hari Ini!"), followed by `LearningPathMap`.
- When role is `ustaz`: render Halaqah summary cards (Total Santri, Santri Tuntas Pekan Ini, Klaim Pending) followed by santri progress cards.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/features/LearningPathMap.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/features/LearningPathMap.tsx app/dashboard/page.tsx tests/features/LearningPathMap.test.tsx
git commit -m "feat(dashboard): implement gamified LearningPathMap and halaqah monitoring dashboard"
```

---

### Task 8: Screen Redesign - Ruang Belajar Materi (`/dashboard/courses` & `.../[course]`)

**Files:**
- Modify: `app/dashboard/courses/page.tsx`
- Modify: `app/dashboard/courses/[course]/page.tsx`

**Interfaces:**
- Consumes: `MobileAppShell`, `TactileCard`, `HijaiyahCard`, `TactileButton`, `getCourseById`, `getCourses`
- Produces: Warm ivory course catalog and interactive hijaiyah learning view with audio trigger.

- [ ] **Step 1: Write integration check for courses pages**

Verify that course catalog and course detail render without breaking types or routes.

- [ ] **Step 2: Update `app/dashboard/courses/page.tsx`**

Style courses grid with `TactileCard`, level pills, and emerald tactile action buttons. Add search/filter by category (Tahsin, Hijaiyah, Hafalan).

- [ ] **Step 3: Update `app/dashboard/courses/[course]/page.tsx`**

Replace generic container with `HijaiyahCard` display, large Arabic font with `dir="rtl"`, audio pronunciation player, tactile step indicators, and "Mulai Kuis Sekarang" button.

- [ ] **Step 4: Run tests and typecheck**

Run: `pnpm test && pnpm exec tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/courses/page.tsx app/dashboard/courses/[course]/page.tsx
git commit -m "feat(courses): redesign catalog and course detail screen with tactile hijaiyah card"
```

---

### Task 9: Screen Redesign - Quiz Arena (`.../take`) & Toko Berkah (`/dashboard/exchange`)

**Files:**
- Modify: `app/dashboard/courses/[course]/take/page.tsx`
- Modify: `app/dashboard/exchange/page.tsx`

**Interfaces:**
- Consumes: `MobileAppShell`, `QuestionCard`, `ScoreCelebration`, `RewardCard`, `ConfirmModal`, `ToastNotification`, `rewardService`, `useQuizSession`
- Produces: Fully redesigned quiz arena with lantern progress bar and Toko Berkah with kid-friendly reward catalog and ustaz claim verification.

- [ ] **Step 1: Redesign `app/dashboard/courses/[course]/take/page.tsx`**

- Integrate relaxed lantern progress bar (🏮 `Soal 3 dari 5`).
- Replace alert messages with `ScoreCelebration` modal on quiz completion.
- Wire sound/confetti trigger on correct answer.
- Tactile Previous/Next buttons with smooth transitions.

- [ ] **Step 2: Redesign `app/dashboard/exchange/page.tsx`**

- Header with large coin balance and treasure chest graphic.
- Grid of `RewardCard` components calculating coin shortage dynamically.
- `ConfirmModal` child-friendly confirmation dialog.
- For `ustaz` role: tab "Daftar Klaim Santri" displaying pending requests with "Tandai Diterima Santri" action.

- [ ] **Step 3: Run full tests and typecheck**

Run: `pnpm test && pnpm exec tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/courses/[course]/take/page.tsx app/dashboard/exchange/page.tsx
git commit -m "feat(exchange-quiz): complete Quiz Arena and Toko Berkah screen redesigns"
```

---

### Task 10: End-to-End Build Verification & Quality Gate

**Files:**
- All touched files

**Interfaces:**
- Build and test pipeline verification

- [ ] **Step 1: Run complete Vitest suite**

Run: `pnpm test`
Expected: All tests pass with zero failures.

- [ ] **Step 2: Run TypeScript static analysis**

Run: `pnpm exec tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Run Next.js production build**

Run: `pnpm build`
Expected: Build succeeds with static/dynamic pages compiled cleanly.

- [ ] **Step 4: Final Git cleanup and status verification**

Run: `git status`
Expected: Working tree clean.
