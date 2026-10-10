# SibaQ Roadmap & Backlog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengimplementasikan 5 pilar roadmap & backlog aplikasi SibaQ: Zero-Gradient Stark Minimalism, Settings Persistence, Web Audio Synthesizer, Course Search & Filter, dan PWA Service Worker.

**Architecture:** Arsitektur modular offline-first berbasis Next.js 15 App Router: UI bersih bebas gradasi, persistensi preferensi dual-layer (LocalStorage L1 + Firestore L2), synthesizer prosedural berbasis Web Audio API (0 byte binary bloat), client-side memoized course filtering, dan standalone Service Worker caching shell.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Web Audio API, Service Worker API, Vitest 5, Firebase Firestore.

**Spec:** `docs/superpowers/specs/2026-10-10-approval-governance-and-implementation-spec.md`

## Global Constraints
- Desain UI wajib mematuhi standar Clean Stark Minimalist / True OLED border hairline: zero gradient bloatware (`bg-gradient-*` dihapus dari seluruh surface fungsional).
- Kompilasi TypeScript `npx tsc --noEmit` wajib 0 error (clean compile).
- Test suite Vitest `npx vitest run` wajib 100% PASS (zero regression dari 145 baseline tests).
- PWA Service Worker wajib SSR-safe dan tidak mengganggu RSC/Server Actions maupun gRPC/Firebase network traffic.
- Web Audio API wajib memiliki fallback aman tanpa melempar unhandled promise rejection saat autoplay diblokir atau browser offline.

## Review Focus
1. SSR Hydration Mismatch pada `settingsService` / `app/dashboard/settings/page.tsx` saat membaca LocalStorage.
2. Web Audio API crash pada lingkungan non-browser atau mobile browser yang men-suspend AudioContext.
3. Class `bg-gradient-*` terlewat di komponen modal dialog.
4. Cumulative Layout Shift (CLS) pada halaman `/dashboard/courses` saat memfilter kursus.
5. Inkompatibilitas Service Worker dengan Turbopack / Next.js production chunks.

---

### Task 1: Eliminasi Seluruh Sisa Gradien ke Clean Stark Minimalist Hairline Borders

**Files:**
- Modify: `components/features/ScoreCelebration.tsx:50-60`
- Modify: `components/features/AvatarUploadModal.tsx:135-145`
- Modify: `components/features/SetoranModal.tsx:105-115`
- Test: `tests/components/zeroGradient.test.tsx`

**Interfaces:**
- Consumes: Tailwind utility classes, Lucide icons
- Produces: Clean UI surface tanpa `bg-gradient-*`

- [ ] **Step 1: Write failing test verifying zero gradient in modals**
Buat `tests/components/zeroGradient.test.tsx` yang memverifikasi `ScoreCelebration`, `AvatarUploadModal`, dan `SetoranModal` tidak lagi memuat substring class `bg-gradient`.

- [ ] **Step 2: Run test to verify it fails**
`npx vitest run tests/components/zeroGradient.test.tsx` -> Expected: FAIL

- [ ] **Step 3: Refactor 3 modal components to solid hairline borders**
  - `ScoreCelebration.tsx`: Trophy wrapper diganti dari `bg-gradient-to-tr from-amber-400 to-amber-200` menjadi `bg-amber-100 border-2 border-amber-300 text-amber-800`.
  - `AvatarUploadModal.tsx`: Avatar ring diganti dari `bg-gradient-to-tr from-emerald-500 to-amber-400` menjadi `bg-white border-2 border-emerald-600`.
  - `SetoranModal.tsx`: Header diganti dari `bg-gradient-to-r from-emerald-700 to-emerald-800` menjadi `bg-emerald-800 border-b border-emerald-900`.

- [ ] **Step 4: Run test to verify it passes**
`npx vitest run tests/components/zeroGradient.test.tsx` -> Expected: PASS

---

### Task 2: Settings Persistence Service & Settings Page Integration

**Files:**
- Modify: `types/schema.ts`
- Create: `lib/services/settingsService.ts`
- Modify: `app/dashboard/settings/page.tsx`
- Create: `tests/services/settingsService.test.ts`
- Modify: `tests/pages/settings.test.tsx`

**Interfaces:**
- Consumes: `UserSettingsSchema`
- Produces: `getLocalSettings()`, `saveLocalSettings()`, `fetchRemoteSettings()`, `persistSettings()`

- [ ] **Step 1: Write failing unit test for `settingsService`**
Buat `tests/services/settingsService.test.ts` menguji default fallback, penyimpanan LocalStorage, dan sync Firestore.

- [ ] **Step 2: Run test to verify it fails**
`npx vitest run tests/services/settingsService.test.ts` -> Expected: FAIL

- [ ] **Step 3: Define schema & implement `settingsService.ts`**
  - Update `types/schema.ts` dengan `UserSettingsSchema`.
  - Implementasikan `lib/services/settingsService.ts` dengan try/catch guard untuk SSR dan LocalStorage security error.
  - Hubungkan ke `app/dashboard/settings/page.tsx` dengan pattern hydration-safe.

- [ ] **Step 4: Run tests to verify they pass**
`npx vitest run tests/services/settingsService.test.ts tests/pages/settings.test.tsx` -> Expected: PASS

---

### Task 3: Procedural Web Audio Synthesizer (`lib/audio/soundManager.ts`)

**Files:**
- Create: `lib/audio/soundManager.ts`
- Create: `tests/audio/soundManager.test.ts`
- Modify: `app/dashboard/courses/[course]/take/page.tsx`
- Modify: `components/features/ScoreCelebration.tsx`

**Interfaces:**
- Consumes: `SoundType: "tactile-click" | "chime-success" | "celebration" | "quiz-wrong"`
- Produces: `soundManager.play(type: SoundType)`, `soundManager.setMuted(muted: boolean)`

- [ ] **Step 1: Write failing test for `soundManager`**
Buat `tests/audio/soundManager.test.ts` memverifikasi initial state, muting behavior, dan invocation AudioContext oscillators.

- [ ] **Step 2: Run test to verify it fails**
`npx vitest run tests/audio/soundManager.test.ts` -> Expected: FAIL

- [ ] **Step 3: Implement `lib/audio/soundManager.ts`**
Implementasikan Web Audio API oscillator synthesis untuk nada `chime-success`, `celebration`, `tactile-click`, dan `quiz-wrong` dengan perlindungan SSR dan autoplay suspension resume.
Sambungkan ke `ScoreCelebration.tsx` (play celebration sound jika terbuka) dan `TakeCoursePage` (play sound saat menjawab benar).

- [ ] **Step 4: Run test to verify it passes**
`npx vitest run tests/audio/soundManager.test.ts` -> Expected: PASS

---

### Task 4: Interactive Courses Search & Category Filtering di `/dashboard/courses`

**Files:**
- Modify: `app/dashboard/courses/page.tsx`
- Create: `tests/pages/courses.test.tsx`

**Interfaces:**
- Consumes: `getCourses()`, `useAuth()`
- Produces: Filtered course cards berdasarkan keyword dan kategori chip ("Semua", "Hijaiyah", "Tahsin", "Tajwid")

- [ ] **Step 1: Write failing test for courses search & filter**
Buat `tests/pages/courses.test.tsx` memverifikasi rendering search bar, filtering kategori saat chip diklik, dan penanganan empty state pencarian.

- [ ] **Step 2: Run test to verify it fails**
`npx vitest run tests/pages/courses.test.tsx` -> Expected: FAIL

- [ ] **Step 3: Implement search input & category chips in `app/dashboard/courses/page.tsx`**
Tambahkan search text input dengan debounce ringan dan category pills berestetika Stark Minimalist hairline border.

- [ ] **Step 4: Run test to verify it passes**
`npx vitest run tests/pages/courses.test.tsx` -> Expected: PASS

---

### Task 5: PWA Service Worker & Registration Component

**Files:**
- Create: `public/sw.js`
- Create: `components/pwa/ServiceWorkerRegister.tsx`
- Modify: `app/layout.tsx`
- Create: `tests/pwa/sw_registration.test.tsx`

**Interfaces:**
- Consumes: Browser ServiceWorker API
- Produces: Offline caching static shell & fonts, bypass API/Firestore calls

- [ ] **Step 1: Write test for `ServiceWorkerRegister`**
Buat `tests/pwa/sw_registration.test.tsx` memverifikasi komponen me-register worker pada client-side dan tidak melempar error saat SSR.

- [ ] **Step 2: Run test to verify it fails**
`npx vitest run tests/pwa/sw_registration.test.tsx` -> Expected: FAIL

- [ ] **Step 3: Implement `public/sw.js`, `ServiceWorkerRegister.tsx`, and attach to `app/layout.tsx`**
Implementasikan cache-first untuk fonts/icons dan stale-while-revalidate untuk shell, bypass API/Firestore. Pasang di root layout.

- [ ] **Step 4: Run test to verify it passes**
`npx vitest run tests/pwa/sw_registration.test.tsx` -> Expected: PASS

---

### Task 6: Full Verification, Production Build, Git Branch, PR & Merge

**Files:**
- All touched files

- [ ] **Step 1: Run full Vitest suite**
`npx vitest run` -> All tests PASS.

- [ ] **Step 2: Run TypeScript compiler**
`npx tsc --noEmit` -> 0 errors.

- [ ] **Step 3: Run Next.js production build**
`npm run build` -> Build successful.

- [ ] **Step 4: Git branch, commit, push, create PR & squash merge**
Buat branch `feat/roadmap-and-backlog-execution`, commit, push, create PR, squash merge ke `main`, pull local `main`.
