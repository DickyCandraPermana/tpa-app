# SibaQ Clean Architecture Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework and modernize the internal architecture of SibaQ (`tpa-app`) by replacing manual `localStorage` with native Firebase real-time Auth & Firestore snapshots, creating a robust Zod-validated service layer, encapsulating quiz state in a custom hook, upgrading dependencies, and replacing browser alerts with modern Tailwind modals.

**Architecture:** Clean modular architecture separating Presentation (Next.js App Router pages + UI components), State/Hooks (`useAuth`, `useQuizSession`, `useRewards`), Domain/Service Layer (`userService`, `courseService`, `rewardService` with Zod validation), and Infrastructure (Firebase Auth/Firestore SDK).

**Tech Stack:** Next.js 15, React 19, Tailwind CSS v4, Firebase 11/12 SDK, Zod, Lucide React, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-07-sibaq-clean-architecture-rework.md`

## Global Constraints
- No synchronous `localStorage` hacks for server-managed user state.
- All Firestore queries must pass through `lib/services/` with Zod schema parsing.
- Zero raw `window.alert()` or `window.confirm()` in UI components.
- Zero TypeScript compile errors (`npx tsc --noEmit`).
- All Vitest test suites must pass before merging.

## Review Focus
1. User profile snapshot unsubscription on unmount/signout (prevent memory leaks).
2. Point deduction and redeem request creation concurrency handling in `rewardService`.
3. Fallback defaults when legacy Firestore documents miss newly required fields (handled gracefully by Zod `.default()`).
4. Re-taking a quiz must not overwrite existing highest scores or produce duplicate user completions.
5. Responsive behavior on mobile devices for the new confirmation modals and quiz cards.

---

### Task 1: Dependency Modernization & Zod Schema Definition

**Files:**
- Modify: `package.json`
- Create: `types/schema.ts`
- Test: `tests/schema.test.ts`

**Interfaces:**
- Produces: `UserProfileSchema`, `CourseSchema`, `QuestionSchema`, `RewardSchema`, `RedeemRequestSchema`

- [ ] **Step 1: Install `zod` and update `@types/node`**
Run: `pnpm add zod` on laptop.
- [ ] **Step 2: Write failing test in `tests/schema.test.ts`**
Test parsing valid vs malformed user profiles and question data with default fallbacks.
- [ ] **Step 3: Implement Zod schemas in `types/schema.ts`**
Define schemas and export inferred TypeScript types.
- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm test`
- [ ] **Step 5: Commit**
`git commit -m "feat(types): define Zod schemas for user, course, question, and reward"`

---

### Task 2: Service Layer Extraction (`lib/services/`)

**Files:**
- Create: `lib/services/courseService.ts`
- Create: `lib/services/userService.ts`
- Create: `lib/services/rewardService.ts`
- Test: `tests/services.test.ts`

**Interfaces:**
- Consumes: Zod schemas from `types/schema.ts`, `db` from `@/lib/firebase`
- Produces:
  - `courseService.getCourses()`, `getCourseById()`, `getCourseQuestions()`
  - `userService.getUserProfile()`, `addPoints()`, `markCourseCompleted()`
  - `rewardService.getRewards()`, `redeemReward()`

- [ ] **Step 1: Write failing tests in `tests/services.test.ts`**
Test reward redemption affordability check and point calculation logic.
- [ ] **Step 2: Implement `lib/services/courseService.ts`**
- [ ] **Step 3: Implement `lib/services/userService.ts`**
- [ ] **Step 4: Implement `lib/services/rewardService.ts`**
- [ ] **Step 5: Run tests and verify**
Run: `pnpm test`
- [ ] **Step 6: Commit**
`git commit -m "feat(services): implement modular course, user, and reward services"`

---

### Task 3: Real-Time Auth & Profile State Refactor

**Files:**
- Modify: `context/AuthContext.tsx`
- Test: `tests/auth.test.ts`

**Interfaces:**
- Consumes: `auth`, `db` from `@/lib/firebase`, `UserProfile` from `types/schema.ts`
- Produces: `useAuth()` hook with real-time `userProfile`, `loading`, `signOutUser()`

- [ ] **Step 1: Write test for Auth state contract**
- [ ] **Step 2: Refactor `context/AuthContext.tsx`**
Replace `localStorage` with `onAuthStateChanged` and `onSnapshot(doc(db, "users", uid))`
- [ ] **Step 3: Run tests to verify**
Run: `pnpm test`
- [ ] **Step 4: Commit**
`git commit -m "refactor(auth): replace localStorage with native onAuthStateChanged and onSnapshot"`

---

### Task 4: Custom Quiz Hook & Presentation Refactor

**Files:**
- Create: `hooks/useQuizSession.ts`
- Modify: `app/dashboard/courses/[course]/take/page.tsx`
- Test: `tests/useQuizSession.test.ts`

**Interfaces:**
- Consumes: `Question` from `types/schema.ts`, `courseService`, `userService`
- Produces: `useQuizSession({ courseId, questions, onComplete })`

- [ ] **Step 1: Write failing test in `tests/useQuizSession.test.ts`**
- [ ] **Step 2: Implement `hooks/useQuizSession.ts`**
- [ ] **Step 3: Refactor `app/dashboard/courses/[course]/take/page.tsx`** to consume `useQuizSession`
- [ ] **Step 4: Run tests and verify**
Run: `pnpm test`
- [ ] **Step 5: Commit**
`git commit -m "feat(quiz): encapsulate quiz state machine in useQuizSession hook"`

---

### Task 5: Modern Dialog & Toast Feedback UI

**Files:**
- Create: `components/ui/ConfirmModal.tsx`
- Create: `components/ui/ToastNotification.tsx`
- Modify: `app/dashboard/exchange/page.tsx`

**Interfaces:**
- Produces: `ConfirmModal`, `ToastNotification`
- Consumes: `rewardService`

- [ ] **Step 1: Implement `components/ui/ConfirmModal.tsx`**
- [ ] **Step 2: Implement `components/ui/ToastNotification.tsx`**
- [ ] **Step 3: Refactor `app/dashboard/exchange/page.tsx`** to eliminate `window.alert`/`window.confirm`
- [ ] **Step 4: Verify type safety**
Run: `npx tsc --noEmit`
- [ ] **Step 5: Commit**
`git commit -m "feat(ui): add kid-friendly ConfirmModal and ToastNotification components"`

---

### Task 6: Full Verification, Clean Build, & Push

**Files:**
- All touched files

- [ ] **Step 1: Run full Vitest test suite**
Run: `pnpm test` -> Expect 100% PASS
- [ ] **Step 2: Run full TypeScript check**
Run: `npx tsc --noEmit` -> Expect 0 errors
- [ ] **Step 3: Clean cache & run production build**
Run: `Remove-Item -Path .next -Recurse -Force; pnpm build` -> Expect 14/14 pages compiled
- [ ] **Step 4: Push main to GitHub**
