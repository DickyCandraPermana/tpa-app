# Implementation Plan: True OLED Dark Mode & Adaptive Tablet/Desktop Responsiveness (Mobile-First)

- **Date:** 2026-10-10
- **Project:** SibaQ (`/opt/data/tpa-app`)
- **Target Branch:** `feat/true-oled-dark-mode-and-responsive-layout`
- **Spec:** `docs/superpowers/specs/2026-10-10-true-oled-dark-mode-and-responsive-layout-spec.md`

---

## 1. Context & Global Constraints
- **Visual:** True OLED Black (`#000000`), stark minimalism ala Geist/Vercel: hairline borders (`border-neutral-800` / `#262626`), functional dark surfaces (`#000000` / `#0A0A0A`), ZERO AI gradient bloat (`bg-gradient-*`), ZERO decorative blob blur (`blur-3xl`, `bg-emerald-200/40`).
- **Responsive:** Mobile-first basis (<768px: single column, floating bottom nav), tablet (md: 768px: expanded container max-w-4xl, 2-column grids), desktop (lg: 1024px, xl: 1280px: expanded container max-w-5xl, 3-column grids).
- **Two-Tier Persistence:** L1 LocalStorage (`sibaq_user_settings`) untuk zero-FOUC instant loading + L2 Firestore (`users/{uid}.settings`) untuk cross-device persistence.
- **TDD Requirement:** Strict RED -> GREEN -> REFACTOR on all changes. Existing 169 Vitest tests must remain 100% passing.

---

## 2. Tasks & Execution Steps

### Task 1: Extend UserSettingsSchema & settingsService (Theme Modes & applyThemeToDOM)
- **Files:** `types/schema.ts`, `lib/services/settingsService.ts`, `tests/services/settingsService.test.ts`
- **Steps:**
  1. RED: Update `tests/services/settingsService.test.ts` to test `ThemeModeSchema`, `darkMode`, `applyThemeToDOM`, and verify default values maintain backward compatibility.
  2. GREEN: Update `types/schema.ts` with `ThemeModeSchema = z.enum(["light", "oled", "system"]).default("light")`, `darkMode: z.boolean().default(false)`, and `theme: ThemeModeSchema.default("light")`. Implement `applyThemeToDOM` in `lib/services/settingsService.ts`.
  3. REFACTOR: Run Vitest, verify all settingsService tests pass.

### Task 2: True OLED CSS Tokens & Tailwind v4 Custom Variant
- **Files:** `styles/globals.css`, `tests/theme.test.ts`
- **Steps:**
  1. RED: Extend `tests/theme.test.ts` to assert `@custom-variant dark`, OLED tokens (`#000000`, `#0A0A0A`, `#262626`), and verify preservation of oasis tokens (`#FDFBF7`, `#F3E8D6`, `#047857`, `#F59E0B`).
  2. GREEN: Update `styles/globals.css` with `@custom-variant dark (&:where([data-theme="oled"], [data-theme="oled"] *, .dark, .dark *));`, semantic `:root` and `.dark` variables, and OLED utility classes.
  3. REFACTOR: Run `tests/theme.test.ts` to verify green.

### Task 3: Root Layout Anti-FOUC Script & Theme Viewport
- **Files:** `app/layout.tsx`, `tests/pwa/serviceWorker.test.tsx`
- **Steps:**
  1. RED: Verify root layout hydration and DOM attribute expectations.
  2. GREEN: Add `suppressHydrationWarning` on `<html>`, inject blocking inline script in `<head>` to read L1 settings and set `data-theme="oled"` and `.dark` synchronously. Update `viewport` with adaptive `themeColor`.
  3. REFACTOR: Run Vitest across layout and PWA tests.

### Task 4: Responsive Layout Shell (MobileAppShell) & Zero Blob Blur
- **Files:** `components/layout/MobileAppShell.tsx`, `tests/layout/responsiveLayout.test.tsx`
- **Steps:**
  1. RED: Create `tests/layout/responsiveLayout.test.tsx` verifying:
     - Removal of all decorative `blur-3xl` blob divs.
     - Responsive container expansion: `w-full max-w-md md:max-w-4xl lg:max-w-5xl`.
     - Dark mode styling `dark:bg-black dark:text-neutral-100`.
  2. GREEN: Refactor `components/layout/MobileAppShell.tsx` to remove background blur blobs, apply adaptive width classes (`w-full max-w-md md:max-w-4xl lg:max-w-5xl mx-auto`), and add dark mode classes.
  3. REFACTOR: Verify `tests/layout/responsiveLayout.test.tsx` passes.

### Task 5: Core UI Components True OLED Styling (TactileCard, TactileButton, AdaptiveTopBar, AdaptiveBottomNav)
- **Files:** `components/ui/TactileCard.tsx`, `components/ui/TactileButton.tsx`, `components/layout/AdaptiveTopBar.tsx`, `components/layout/AdaptiveBottomNav.tsx`, `tests/components/zeroGradient.test.tsx`
- **Steps:**
  1. RED: Create `tests/components/trueOledComponents.test.tsx` asserting dark mode classes and clean borders without gradient.
  2. GREEN: Add `dark:bg-black dark:border-neutral-800 dark:text-neutral-100` to `TactileCard`, `AdaptiveTopBar`, `AdaptiveBottomNav`, and `TactileButton`.
  3. REFACTOR: Run Vitest component tests and `tests/components/zeroGradient.test.tsx`.

### Task 6: True OLED Dark Mode Toggle in Settings Page
- **Files:** `app/dashboard/settings/page.tsx`, `tests/pages/darkMode.test.tsx`
- **Steps:**
  1. RED: Create `tests/pages/darkMode.test.tsx` verifying the presence of OLED/Dark Mode toggle, state initialization from L1, toggling calls `persistSettings` and updates DOM attributes.
  2. GREEN: Update `app/dashboard/settings/page.tsx` with OLED Dark Mode toggle switch and responsive 2-column layout on tablet/desktop (`grid grid-cols-1 md:grid-cols-2 gap-6`).
  3. REFACTOR: Run `tests/pages/darkMode.test.tsx` and `tests/pages/settings.test.tsx`.

### Task 7: Responsive Grid Scaling on Dashboard & Courses Pages
- **Files:** `app/dashboard/courses/page.tsx`, `app/dashboard/page.tsx`
- **Steps:**
  1. RED: Assert multi-column grid classes in `tests/layout/responsiveLayout.test.tsx` (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
  2. GREEN: Ensure `app/dashboard/courses/page.tsx` and `app/dashboard/page.tsx` use `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` for course cards and santri progress cards.
  3. REFACTOR: Verify courses and dashboard tests pass.

### Task 8: Full Verification, TypeScript Check, Next.js Build & Git Delivery
- **Steps:**
  1. Run full Vitest suite: `npx vitest run`.
  2. Run TypeScript strict typecheck: `npx tsc --noEmit`.
  3. Run Next.js production build: `npm run build`.
  4. Git commit, push, create PR, squash merge, pull main, and update backlog.
