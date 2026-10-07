# SibaQ (tpa-app) Clean Architecture Rework & Modernization Specification

- **Date:** 2026-10-07
- **Project:** SibaQ (`DickyCandraPermana/tpa-app`)
- **Author:** The Key & Dicky Candra Permana
- **Target Path:** `docs/superpowers/specs/2026-10-07-sibaq-clean-architecture-rework.md`

---

## 1. Executive Summary & Problem Statement

SibaQ adalah aplikasi web pembelajaran interaktif Taman Pendidikan Al-Qur'an (TPA) berbasis Next.js, Tailwind CSS, dan Firebase. Meskipun fitur esensial seperti kuis dan gamifikasi poin telah berjalan, arsitektur internal saat ini memiliki sejumlah kerapuhan (*code smells*):

1. **State & Auth Mengandalkan Multi-`localStorage` Manual:**
   `context/AuthContext.tsx` mengelola 7 state terpisah (`uid`, `role`, `username`, `totalPoint`, `completedCourse`, dll.) dengan menyimpan dan membaca secara imperatif ke `localStorage` via 7 `useEffect`. Ini menyebabkan race conditions, desync saat token Firebase kedaluwarsa, dan potensi desinkronisasi multi-tab.
2. **Ketiadaan Service Layer:**
   Query Firestore (`collection`, `getDocs`, `updateDoc`) bercampur langsung di dalam file komponen halaman (`app/dashboard/...`). Tidak ada enkapsulasi domain dan tidak ada penanganan transaksi atomik saat menukar hadiah.
3. **Monolithic Page Components:**
   Komponen halaman menangani fetching, state navigasi, kalkulasi penskoran, update poin, dialog, dan rendering secara bersamaan tanpa pemisahan custom hooks.
4. **Dialog Browser Primitif:**
   Penukaran hadiah dan notifikasi masih menggunakan `window.alert()` dan `window.confirm()` yang memblokir thread JavaScript dan tidak ramah mobile santri.
5. **Ketergantungan Dependensi Lama:**
   Perlu pembaruan versi paket Next.js, React 19 types, Lucide React, Node types (`v22`), serta penambahan Zod untuk schema validation.

---

## 2. Dependency & Stack Modernization

### 2.1 Paket yang Diperbarui & Ditambahkan
* **Core:**
  * `next`: Dipin ke versi stabil Next.js 15 LTS / stable (`^15.3.9` / compatible)
  * `react` & `react-dom`: `^19.0.0`
  * `@types/react` & `@types/react-dom`: `^19.0.0`
  * `@types/node`: `^22.0.0` (sesuai Node v22.14 LTS host)
  * `lucide-react`: Upgrade ke `^1.52.0`
  * `firebase`: `^11.10.0` / `^12.x`
* **Library Baru Ditambahkan:**
  * `zod`: Schema definition dan runtime validation untuk data Firestore (User, Course, Question, Reward).
  * `vitest`: Testing framework unit test modern (sudah disiapkan dan diintegrasikan).

---

## 3. Desain Arsitektur Baru (Clean Modular Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  Pages (/dashboard/courses, /take, /exchange, /profile)     │
│  UI Components (QuestionCard, CourseCard, ConfirmDialog)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ uses
┌──────────────────────────────▼──────────────────────────────┐
│                  Custom Hooks / State Layer                 │
│  useAuth, useQuizSession, useRewards, useUserProgress       │
└──────────────────────────────┬──────────────────────────────┘
                               │ uses
┌──────────────────────────────▼──────────────────────────────┐
│                    Domain & Service Layer                   │
│  userService, courseService, rewardService                  │
│  Zod Schemas & Domain Types (user.ts, course.ts, reward.ts) │
└──────────────────────────────┬──────────────────────────────┘
                               │ calls
┌──────────────────────────────▼──────────────────────────────┐
│                     Infrastructure Layer                    │
│  Firebase Auth (onAuthStateChanged), Firestore (Client SDK) │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Real-Time Auth & User Profile (`context/AuthContext.tsx`)
* Mengganti seluruh pembacaan/penulisan `localStorage` manual.
* Memasang listener Firebase `onAuthStateChanged(auth, async (user) => ...)`.
* Jika user login:
  * Pasang realtime listener `onSnapshot(doc(db, "users", user.uid), (docSnap) => ...)` untuk memantau profil (`username`, `totalPoint`, `completedCourse`, `role`).
  * Setiap perubahan poin atau penyelesaian materi di Firestore langsung terefleksi secara reaktif ke seluruh UI tanpa reload.
* Jika user logout:
  * Memanggil `signOut(auth)` dan otomatis meng-unsubscribe listener Firestore.

### 3.2 Service Layer (`lib/services/`)
1. **`lib/services/userService.ts`**:
   * `getUserProfile(uid: string): Promise<UserProfile | null>`
   * `addPoints(uid: string, points: number): Promise<void>` (menggunakan Firestore `increment`)
   * `markCourseCompleted(uid: string, courseId: string): Promise<void>` (menggunakan Firestore `arrayUnion`)
2. **`lib/services/courseService.ts`**:
   * `getCourses(): Promise<Course[]>`
   * `getCourseById(id: string): Promise<Course | null>`
   * `getCourseQuestions(courseId: string): Promise<Question[]>`
   * Semua data di-parse dan divalidasi via Zod schemas sebelum dikembalikan ke UI.
3. **`lib/services/rewardService.ts`**:
   * `getRewards(): Promise<Reward[]>`
   * `redeemReward(userId: string, currentPoints: number, reward: Reward): Promise<RedeemResult>`:
     * Menjalankan validasi apakah poin mencukupi (`currentPoints >= reward.cost`).
     * Menjalankan write ke koleksi `redeem_requests` dan memotong poin user secara atomik.

### 3.3 Custom Hooks Berbasis Single Responsibility
1. **`hooks/useQuizSession.ts`**:
   * Menerima `courseId` dan array `questions`.
   * Mengelola state:
     * `currentIndex`: nomor soal aktif
     * `selectedAnswers`: map jawaban
     * `isCorrectMap`: status benar/salah tiap nomor
     * `sessionPoints`: akumulasi poin yang didapatkan
     * `isCompleted`: boolean status kuis selesai
   * Menyediakan fungsi aksi deklaratif:
     * `selectOption(option: string)`
     * `nextQuestion()`, `prevQuestion()`
     * `finishQuiz()`
     * `restartQuiz()`
2. **`hooks/useRewards.ts`**:
   * Mengelola katalog rewards, status loading, dan trigger dialog penukaran hadiah.

### 3.4 Modern Dialog & Toast Feedback UI
* Menghilangkan `window.alert()` dan `window.confirm()`.
* Membuat:
  * `components/ui/ConfirmModal.tsx`: Modal konfirmasi penukaran hadiah ramah anak dengan kartu ringkasan reward dan tombol konfirmasi yang menarik.
  * `components/ui/ToastNotification.tsx`: Toast pop-up elegan di pojok kanan bawah yang otomatis hilang dalam 3 detik.

---

## 4. Verification & Testing Strategy

1. **Unit Testing (Vitest):**
   * Menguji Zod schema validation saat menerima data valid vs invalid dari Firestore.
   * Menguji perhitungan state & skor kuis pada `useQuizSession`.
   * Menguji aturan logika pemotongan dan kelayakan poin reward.
2. **Type Safety Verification:**
   * Menjalankan `npx tsc --noEmit` untuk memastikan 100% bebas dari type error atau parameter `any`.
3. **Production Build Verification:**
   * Membersihkan `.next` cache (`Remove-Item -Path .next -Recurse -Force`).
   * Menjalankan `pnpm build` untuk memastikan 14 halaman App Router terkompilasi optimal.

---

## 5. Phased Implementation Plan

- **Fase 1: Stack Upgrades & Schemas Definition:**
  - Update dependensi `package.json` (`next`, `@types/node`, `zod`, `lucide-react`).
  - Buat `types/schema.ts` dengan Zod schemas & TypeScript types.
- **Fase 2: Service Layer Extraction:**
  - Implementasi `userService.ts`, `courseService.ts`, `rewardService.ts`.
- **Fase 3: Real-Time Auth Refactor:**
  - Rework `context/AuthContext.tsx` dengan `onAuthStateChanged` & `onSnapshot` Firestore listener.
- **Fase 4: Presentation Components & Custom Hooks:**
  - Implementasi `useQuizSession.ts` dan refactor `take/page.tsx`.
  - Implementasi `ConfirmModal.tsx` & `ToastNotification.tsx` pada `exchange/page.tsx`.
- **Fase 5: Verification & Green Build:**
  - Jalankan `pnpm test`, `npx tsc --noEmit`, dan `pnpm build`.
