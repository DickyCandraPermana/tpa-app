# SibaQ Approval Governance & Implementation Specification
## True OLED / Stark Minimalist & Strict TDD Code Contracts

- **Date:** 2026-10-10
- **Project:** SibaQ (`DickyCandraPermana/tpa-app`)
- **Status:** Approved Architecture Contract for TDD Execution
- **Target Path:** `docs/superpowers/specs/2026-10-10-approval-governance-and-implementation-spec.md`

---

## 1. Ringkasan Eksekutif & Prinsip Desain

Spesifikasi ini menetapkan tata kelola persetujuan (approval governance), kontrak interface TypeScript, skema preferensi pengguna, struktur event audio, dan panduan styling True OLED / Stark Minimalist untuk platform SibaQ.

### Prinsip Fondasi:
1. **Zero Defect Type Checking:** Seluruh interface dan Zod schema divalidasi ketat pada waktu kompilasi (`tsc --noEmit` wajib 0 error) dan runtime. Tidak ada toleransi untuk penggunaan tipe `any` yang tidak terkontrol.
2. **True OLED / Stark Minimalism (Zero Gradient Bloatware):** Mengeliminasi semua gradasi visual (`bg-gradient-*`, `radial-gradient`), glow pendaran, dan bayangan berlapis yang membebani rendering. Mengutamakan hitam pekat murni (`#000000`) untuk efisiensi piksel OLED, batas tepi tegas (1px crisp borders), kontras rasio ultra tinggi (≥ 7:1), dan estetika fungsional murni.
3. **Approval Governance Atomik & Audit Konsisten:** Transaksi penukaran dan persetujuan hadiah santri memiliki garansi atomik tanpa race condition, pencegahan pemotongan ganda (*no double deduction*), perlindungan pengembalian dana ganda (*no double refund*), dan audit ledger yang immutable pada koleksi `coin_transactions`.
4. **Strict TDD (Test-Driven Development):** Mengikuti hukum besi TDD: tidak ada kode produksi yang ditulis tanpa failing test (RED) terlebih dahulu, lolos minimal (GREEN), lalu pembersihan (REFACTOR).

---

## 2. Tata Kelola Approval (Approval Governance Architecture)

### 2.1 State Lifecycle & State Machine
Dokumen pada koleksi `redeem_requests` diatur oleh state machine berikut:

```
[Santri Inisiasi Klaim]
        │
        ▼
   ( PENDING ) ───[ Ustadz: Setujui ]────► ( APPROVED )
        │                                  (Selesai, serah terima fisik)
        │
        └─────────[ Ustadz: Tolak ]───────► ( REJECTED )
                                           (Atomik: koin dikembalikan + audit ledger)
```

### 2.2 Aturan Transaksional & Pencegahan Cacat Sistem
1. **Inisiasi Klaim (`redeemReward`):**
   - Wajib dieksekusi dalam Firestore `runTransaction`.
   - Mengambil saldo santri saat ini dari `users/{userId}`.
   - Guard: jika `userPoints < pointsRequired`, transaksi dibatalkan dengan error eksplisit.
   - Mutasi:
     - `users/{userId}.totalPoint` dikurangi sebesar `pointsRequired` via `increment(-pointsRequired)`.
     - Dokumen baru dibuat di `redeem_requests/{requestId}` dengan `status: "PENDING"`.
     - Dokumen dicatat di `coin_transactions/{txId}` dengan `type: "SPENT"`, `source: "REWARD_REDEEM"`.
2. **Persetujuan Klaim (`approveRedeemRequest`):**
   - Idempotency Guard: Status dokumen harus diverifikasi bernilai `"PENDING"`. Jika sudah `"APPROVED"` atau `"REJECTED"`, operasi ditolak.
   - Poin **tidak dipotong lagi** karena pemotongan sudah terjadi di awal siklus.
   - Mutasi: Status diubah ke `"APPROVED"`, mencatat `ustadzId`, `resolvedAt`, `updatedAt`.
3. **Penolakan Klaim (`rejectRedeemRequest`):**
   - Wajib dieksekusi dalam Firestore `runTransaction`.
   - Idempotency Guard: Status dokumen diverifikasi bernilai `"PENDING"`. Jika bukan `"PENDING"`, batalkan transaksi.
   - Mutasi Atomik:
     - `redeem_requests/{requestId}` diubah ke `"REJECTED"`, mencatat `rejectionReason`, `ustadzId`, `resolvedAt`.
     - `users/{userId}.totalPoint` ditambah kembali sebesar `pointsRequired` via `increment(pointsRequired)`.
   - Post-Transaction Audit Ledger:
     - Mencatat audit ledger di `coin_transactions` dengan `type: "EARNED"`, `source: "REWARD_REFUND"`, `referenceId: requestId`.
4. **Enforcement Hak Akses di Firestore Security Rules:**
   - Santri hanya memiliki izin `create` pada dokumen `redeem_requests` miliknya sendiri.
   - Hanya user dengan role `ustadz`, `ustaz`, atau `admin` yang berhak melakukan `update` (approval/rejection) pada `redeem_requests`.
   - Koleksi `coin_transactions` bersifat append-only (`allow update, delete: if false;`).

---

## 3. Kontrak Interface TypeScript & Skema Zod

### 3.1 Skema Preferensi Pengguna (`UserPreferences`)
Menampung konfigurasi visual True OLED, preferensi audio, dan notifikasi.

```typescript
import { z } from "zod";

export const AppThemeSchema = z.enum(["oled", "system", "light"]).default("oled");
export type AppTheme = z.infer<typeof AppThemeSchema>;

export const UserPreferencesSchema = z.object({
  theme: AppThemeSchema,
  soundEffects: z.boolean().default(true),      // Gamification SFX (kuis benar/salah, selebrasi koin)
  makhrajAudio: z.boolean().default(true),      // Audio fungsional pelafalan hijaiyah & tajwid
  notifications: z.boolean().default(true),     // Pengingat halaqah & jadwal setoran
  hapticFeedback: z.boolean().default(false),    // Getaran taktil (jika didukung perangkat)
  volume: z.number().min(0).max(1).default(1.0), // Master volume gain (0.0 - 1.0)
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
```

### 3.2 Integrasi Preferensi ke `UserProfileSchema`
```typescript
export const UserProfileSchema = z.object({
  uid: z.string(),
  email: z.string().nullable().optional(),
  username: z.string().default("Santri Hebat"),
  role: UserRoleSchema,
  avatarURL: z.string().nullable().optional(),
  totalPoint: z.number().int().nonnegative().default(0),
  completedCourse: z.array(z.string()).default([]),
  halaqahId: z.string().optional(),
  preferences: UserPreferencesSchema.default({
    theme: "oled",
    soundEffects: true,
    makhrajAudio: true,
    notifications: true,
    hapticFeedback: false,
    volume: 1.0,
  }),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
```

### 3.3 Struktur Event Audio (`AudioEvent`)
Menstandarkan interaksi suara di seluruh aplikasi secara type-safe.

```typescript
export const AudioEventTypeSchema = z.enum([
  "QUIZ_CORRECT",     // Suara chime benar pada kuis tajwid
  "QUIZ_INCORRECT",   // Suara lembut indikasi jawaban belum tepat
  "COIN_EARNED",      // Efek koin masuk saat menuntaskan setoran/kuis
  "REWARD_CLAIMED",   // Efek klaim hadiah berhasil diajukan
  "MAKHRAJ_PLAY",     // Pelafalan makhraj huruf hijaiyah (Fungsional Utama)
  "LEVEL_UP",         // Selebrasi naik level halaqah
  "CLICK_TACTILE",    // Efek klik tombol taktil mikro
]);

export type AudioEventType = z.infer<typeof AudioEventTypeSchema>;

export const AudioEventSchema = z.object({
  type: AudioEventTypeSchema,
  soundUrl: z.string().optional(),
  volume: z.number().min(0).max(1).optional(),
  timestamp: z.number().int().default(() => Date.now()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type AudioEvent = z.infer<typeof AudioEventSchema>;

export interface AudioServiceContract {
  play(event: AudioEvent, userPrefs?: Partial<UserPreferences>): Promise<boolean>;
  preload(urls: string[]): Promise<void>;
  stopAll(): void;
  isAudioEnabled(type: AudioEventType, userPrefs?: Partial<UserPreferences>): boolean;
}
```

#### Aturan Evaluasi Preferensi Audio:
- Jika `type === "MAKHRAJ_PLAY"`: Diizinkan jika `preferences.makhrajAudio !== false`.
- Jika `type !== "MAKHRAJ_PLAY"`: Diizinkan jika `preferences.soundEffects !== false`.

---

## 4. Panduan Styling True OLED / Stark Minimalist

### 4.1 Prinsip Desain: Zero Gradient Bloatware
- **Anti-Pattern (Dilarang):**
  - Penggunaan `bg-gradient-to-*`, `from-*`, `to-*`, `radial-gradient`.
  - Efek blur dekoratif berat (`backdrop-blur-xl`, `filter blur-*`, pendaran ambient).
  - Bayangan multi-tumpuk tebal (`shadow-2xl shadow-emerald-500/20`).
  - Skeuomorphism berlebihan atau bevel 3D bergradasi.
- **Pola Desain True OLED Stark (Wajib):**
  - **Latar Belakang Canvas:** `#000000` (True OLED Black). Piksel layar OLED non-aktif (0 mA power draw).
  - **Permukaan Kartu / Kontainer:** `#000000` atau `#09090B` (zinc-950 pekat).
  - **Garis Batas (Crisp Borders):** 1px solid dengan kontras terukur (`#27272A` untuk border pembatas, `#3F3F46` untuk border interaktif, `#FFFFFF` untuk status fokus/aktif).
  - **Tipografi:** Sans-serif tajam (`Plus Jakarta Sans` / font sistem bersih). Teks judul `#FFFFFF`, teks sekunder `#A1A1AA` (zinc-400), teks non-aktif `#52525B` (zinc-600).
  - **Teks Arab Hijaiyah:** Font `Amiri` / `Scheherazade New` kontras tinggi `#FFFFFF` dengan harakat tajam berlatar hitam pekat tanpa bayangan blur.
  - **Aksen Fungsional Solid:**
    - Hijau Emerald Fungsional: `#10B981` (emerald-500 solid).
    - Emas Koin Santri: `#F59E0B` (amber-500 solid).
    - Merah Penolakan/Batal: `#EF4444` (red-500 solid).
    - Netral/Highlight: `#FFFFFF` (white murni).

### 4.2 Desain Token CSS (Tailwind v4 / CSS Variables)
```css
:root[data-theme="oled"] {
  --color-canvas-bg: #000000;
  --color-surface-bg: #09090b;
  --color-border-subtle: #27272a;
  --color-border-strong: #3f3f46;
  --color-border-active: #ffffff;

  --color-text-primary: #ffffff;
  --color-text-secondary: #a1a1aa;
  --color-text-muted: #71717a;

  --color-accent-emerald: #10b981;
  --color-accent-amber: #f59e0b;
  --color-accent-rose: #ef4444;

  --border-width-stark: 1px;
}
```

---

## 5. Rencana Eksekusi Strict TDD (Test-Driven Development Pipeline)

Pembangunan dan penyempurnaan fitur dieksekusi dengan siklus **RED -> GREEN -> REFACTOR** berurutan:

### Batch 1: Schema Preferensi & Audio Event (Type Soundness)
1. **RED (`tests/schema_preferences.test.ts`):**
   - Tulis unit test untuk validasi default `UserPreferencesSchema`.
   - Uji penolakan schema terhadap enum theme tidak sah (misal `"neon"`).
   - Uji batas volume (harus 0.0 sampai 1.0).
   - Uji validasi struktur `AudioEventSchema` dan enum `AudioEventTypeSchema`.
   - Uji backward compatibility pada `UserProfileSchema` ketika field `preferences` tidak ada dalam dokumen Firestore lama.
2. **GREEN:**
   - Ekstensi `types/schema.ts` dengan skema preferensi dan audio.
3. **REFACTOR:**
   - Optimalkan ekspor tipe dan dokumentasi JSDoc. Verifikasi `tsc --noEmit`.

### Batch 2: Service Pemutar Audio & Guard Preferensi
1. **RED (`tests/services/audioService.test.ts`):**
   - Uji inisialisasi audio service.
   - Uji pemutaran audio dengan preferensi `soundEffects: false` (harus bypass pemutaran SFX gamifikasi kuis/koin).
   - Uji pemutaran audio dengan `makhrajAudio: true` (tetap memutar suara huruf Arab meskipun `soundEffects` dinonaktifkan).
   - Uji penanganan error ketika browser memblokir HTML5 audio playback (`Audio.play()` rejection).
2. **GREEN:**
   - Implementasikan `lib/services/audioService.ts`.
3. **REFACTOR:**
   - Ekstrak singleton audio context pool agar efisien di memori.

### Batch 3: Pengaturan Akun & Toggle OLED
1. **RED (`tests/pages/settings_oled.test.tsx`):**
   - Uji rendering toggle preferensi (True OLED theme, Efek Suara Gamifikasi, Audio Makhraj).
   - Uji pemanggilan mutasi Firestore untuk menyimpan preferensi pengguna.
2. **GREEN:**
   - Hubungkan state settings dengan `userService.updateUserProfile`.
3. **REFACTOR:**
   - Terapkan styling Stark Minimalist (1px solid border, tanpa gradasi).

### Batch 4: Verifikasi Regresi & Kepatuhan Zero Defect
1. Jalankan `npm test` seluruh suite (145+ tes eksisting + test baru wajib PASS).
2. Jalankan `npx tsc --noEmit` untuk menjamin tidak ada cacat tipe di seluruh repositori.
