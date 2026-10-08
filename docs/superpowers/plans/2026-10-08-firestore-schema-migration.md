# Firestore Schema Migration and Data Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menata ulang arsitektur skema data Firestore SibaQ (`tpa-app-d0d57`), menormalisasi role user lama (`user` -> `santri`), membersihkan dummy mock data, melakukan live seeding materi Tajwid & Hijaiyah autentik, serta mengintegrasikan audit ledger koin dan rekaman kuis.

**Architecture:** Memanfaatkan Zod schema preprocessing untuk kompatibilitas data lama, service account Firebase Admin SDK untuk eksekusi migrasi live di database produksi, serta abstraksi service layer modular (`coinService`, `quizService`, `userService`) pada Next.js.

**Tech Stack:** TypeScript, Next.js 15, Firebase Client SDK 11, Firebase Admin SDK, Zod 4, Vitest 5.

**Spec:** SibaQ TPA Data Architecture & Firestore Normalization Spec.

## Global Constraints
- Seluruh kredensial dan private keys wajib disensor `[REDACTED]` dalam report dan output.
- Zero-downtime: Schema parsing Zod wajib backward-compatible dengan data lama yang belum termigrasi.
- Suite tes Vitest wajib tetap 100% lulus di setiap commit.

## Review Focus
1. Preprocessing role `user` menjadi `santri` di Zod parser tanpa throwing ZodError.
2. Integritas saldo koin saat mutasi transaksi dicatat.
3. Seeding materi dan soal memiliki teks Arab asli (`Amiri`) dan opsi jawaban yang valid.
4. Idempotensi skrip migrasi (bisa dijalankan berulang kali tanpa merusak data yang sudah termigrasi).
5. Error handling ketika Firestore offline atau permissions bermasalah.

---

### Task 1: Zod Schema Normalization & New Data Entities

**Files:**
- Modify: `types/schema.ts`
- Create: `tests/schema_migration.test.ts`

- [ ] **Step 1: Write failing test for schema normalization**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement Zod preprocessing and new schemas in `types/schema.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

### Task 2: Implement Coin & Quiz Services

**Files:**
- Create: `lib/services/coinService.ts`
- Create: `lib/services/quizService.ts`
- Modify: `lib/services/rewardService.ts`
- Create: `tests/services.test.ts`

- [ ] **Step 1: Write failing test for coin and quiz services**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `coinService.ts`, `quizService.ts`, and integrate into `rewardService.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

### Task 3: Build & Execute Idempotent Live Firestore Migration Script

**Files:**
- Create: `scripts/migrate-firestore.js`
- Test run against live Firestore `tpa-app-d0d57` via Admin SDK

- [ ] **Step 1: Implement idempotent migration script `scripts/migrate-firestore.js`**
- [ ] **Step 2: Dry-run and execute migration against live Firestore database**
- [ ] **Step 3: Verify updated documents, cleaned mock data, and seeded courses/rewards**
- [ ] **Step 4: Commit migration script**

### Task 4: Full Suite Verification & Autoreview

**Files:**
- Verify entire test suite (`pnpm test`)
- Run typecheck (`pnpm tsc --noEmit`)
- Run production build (`pnpm build`)
- Execute code review checklist

- [ ] **Step 1: Run complete test suite and typecheck**
- [ ] **Step 2: Verify build output**
- [ ] **Step 3: Review diff and ensure clean code boundaries**
- [ ] **Step 4: Commit and finalize**
