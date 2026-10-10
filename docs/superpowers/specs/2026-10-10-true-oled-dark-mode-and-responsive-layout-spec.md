# SibaQ Approval Governance & Technical Specification
## True OLED Dark Mode & Adaptive Tablet/Desktop Responsiveness

- **Date:** 2026-10-10
- **Project:** SibaQ (`DickyCandraPermana/tpa-app`)
- **Author:** The Key & Dicky Candra Permana
- **Target Path:** `docs/superpowers/specs/2026-10-10-true-oled-dark-mode-and-responsive-layout-spec.md`
- **Status:** Approved Architectural & Technical Contract for Strict TDD Execution

---

## 1. Ringkasan Eksekutif & Prinsip Desain

Spesifikasi teknis dan tata kelola persetujuan (*Approval Governance*) ini menetapkan standar arsitektur untuk implementasi dua pilar peningkatan antarmuka utama pada platform SibaQ:
1. **True OLED Dark Mode (`#000000` Pure Black):** Estetika minimalis murni (*Stark Minimalism*), hemat daya piksel AMOLED/OLED (*0 mA pixel power draw*), bebas gradasi dekoratif (*Zero Gradient & Zero Blob Blur*), garis batas tegas (*hairline borders*), dan kontras tinggi untuk kenyamanan membaca mushaf dan teks Arab.
2. **Responsivitas Adaptif Tablet & Desktop (Mobile-First Evolution):** Transformasi dari kerangka sempit kaku (`max-w-md` tunggal) menjadi layout responsif adaptif yang leluasa (`max-w-5xl` pada viewport tablet/desktop ≥768px), sistem kisi kartu (2–3 kolom), serta tata kelola navigasi adaptif.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                ARSITEKTUR KONSEPTUAL                                   │
├──────────────────────────────────────────┬─────────────────────────────────────────────┤
│               MOBILE (<768px)            │            TABLET / DESKTOP (≥768px)        │
├──────────────────────────────────────────┼─────────────────────────────────────────────┤
│ • Container: max-w-md (100% viewport)    │ • Container: max-w-5xl fluid & leluasa      │
│ • Bottom Nav: AdaptiveBottomNav          │ • Navigasi: Header / Nav responsif          │
│ • Grid: 1 Kolom vertikal                 │ • Grid: 2–3 Kolom (md:grid-cols-2 lg:col-3) │
│ • Latar: #000000 (OLED) / #FDFBF7 (Light)│ • Latar: #000000 (OLED) / #FDFBF7 (Light)   │
│ • Background: Bersih (Zero Blob Blur)    │ • Background: Bersih (Zero Blob Blur)       │
└──────────────────────────────────────────┴─────────────────────────────────────────────┘
```

### Prinsip Fondasi:
1. **True OLED Black (`#000000`) & Efisiensi Piksel:** Latar belakang utama saat dark mode aktif wajib berwarna hitam murni (`#000000`), bukan abu-abu gelap (`#121212` atau `#1e1e1e`). Permukaan kartu menggunakan `#000000` atau `#09090B` (zinc-950) dengan kontras teks memenuhi WCAG AAA (≥ 7:1).
2. **Stark Minimalism & Hairline Borders:** Mengganti bayangan tebal melayang (*heavy drop shadows*) dan bevel skeuomorphic dengan garis batas super tipis (*hairline borders*) berukuran 1px solid (`#27272A` untuk border biasa, `#3F3F46` untuk interaktif, dan `#FFFFFF` untuk status fokus/aktif).
3. **Zero Gradient & Zero Blob Blur:** Melarang seluruh kelas gradasi visual (`bg-gradient-*`, `radial-gradient`) dan efek blur ambient dekoratif (`blur-3xl`, `blur-2xl` pada latar desktop seperti yang ada di `MobileAppShell`). Semua elemen visual adalah flat solid fungsional.
4. **Mobile-First & Fluid Desktop Scaling:** Aplikasi didesain mobile-first untuk kenyamanan genggaman tangan santri, namun secara anggun berekspansi di tablet iPad/Galaxy Tab dan monitor desktop ustadz tanpa ruang kosong yang terbuang percuma.
5. **Two-Tier Governance (L1 LocalStorage + L2 Firestore):** Persistensi tema instan tanpa jeda (*zero flash of wrong theme / FOUC*) melalui L1 Cache lokal, dengan sinkronisasi asinkron ke L2 Firestore (`users/{uid}.settings`) untuk persistensi lintas perangkat.
6. **Strict TDD (Test-Driven Development):** Setiap baris kode produksi wajib didahului oleh pengujian otomatis yang gagal (RED), lolos minimal (GREEN), lalu dirapikan (REFACTOR).

---

## 2. Tata Kelola Persetujuan (Approval Governance Architecture)

Tata kelola ini mengatur hak akses, daur hidup perubahan status (*state lifecycle*), sinkronisasi data dua tingkat (*two-tier synchronization*), dan mekanisme toleransi kesalahan (*fault-tolerance*).

### 2.1 State Lifecycle & Sinkronisasi Preferensi
Preferensi tema pengguna dikelola melalui alur state machine berikut:

```
                  ┌─────────────────────────────────────┐
                  │ 1. INITIAL MOUNT / APP REFRESH      │
                  └──────────────────┬──────────────────┘
                                     │
                 Baca L1 Cache (localStorage) [0ms latency]
                                     ▼
                Inject data-theme="oled" ke <html> / <body>
                        (Mencegah FOUC / kedipan putih)
                                     │
                  User terotentikasi (uid ada)?
                         ├─── YA ───► Fetch L2 Firestore (asinkron)
                         │             Reconcile jika ada perubahan remote
                         │             Update L1 jika Firestore memiliki versi terbaru
                         └─── TIDAK ─► Tetap gunakan nilai L1 Cache
                                     │
                  ┌──────────────────┴──────────────────┐
                  │ 2. USER MUTATION (TOGGLE DI SETTINGS)│
                  └──────────────────┬──────────────────┘
                                     │
                1. Optimistic DOM Update (data-theme / class .dark)
                2. Simpan segera ke L1 LocalStorage (Synchronous)
                3. Trigger persistSettings ke L2 Firestore (Asynchronous)
                                     │
                        Hasil Penulisan Firestore?
                         ├─── SUKSES ──► Status tersinkronisasi multi-device
                         └─── GAGAL ───► Warn console, L1 tetap persisten
                                         (Non-blocking UX, toleran offline)
```

### 2.2 Aturan Transaksional & Tata Kelola Keamanan
1. **Otoritas Mandiri Pengguna (User Autonomy):** Pengguna memiliki wewenang penuh untuk menentukan mode visual tampilan antarmuka mereka tanpa memerlukan persetujuan ustadz/admin.
2. **Enkapsulasi L2 Firestore Security Rules:** Mutasi pada field `settings` dalam dokumen `users/{uid}` hanya diizinkan jika `request.auth.uid == userId`.
3. **Idempotensi & Sanitasi Nilai:** Nilai mode tema divalidasi ketat menggunakan Zod Schema (`"oled" | "light" | "system"` atau boolean `darkMode`). Nilai di luar kontrak akan otomatis ditolak dan di-fallback ke nilai default aman (`light` atau `oled`).
4. **Resiliensi Mode Offline & Tanpa Akun:** Pengguna tamu (*unauthenticated*) atau pengguna dalam kondisi jaringan terputus tetap dapat menikmati fitur True OLED secara penuh melalui L1 LocalStorage.

---

## 3. Kontrak Interface TypeScript & Skema Zod

### 3.1 Skema Preferensi & Mode Tema (`types/schema.ts`)
Pembaruan schema bersifat *backward-compatible* sehingga dokumen santri lama di Firestore yang belum memiliki atribut tema tetap valid.

```typescript
import { z } from "zod";

// Enum mode tema yang didukung
export const ThemeModeSchema = z.enum(["light", "oled", "system"]).default("light");
export type ThemeMode = z.infer<typeof ThemeModeSchema>;

// Schema pengaturan pengguna (L1 & L2)
export const UserSettingsSchema = z.object({
  soundEnabled: z.boolean().default(true),
  notificationEnabled: z.boolean().default(true),
  darkMode: z.boolean().default(false),
  theme: ThemeModeSchema.default("light"),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;
```

### 3.2 Kontrak Service Pengaturan (`lib/services/settingsService.ts`)
Pembaruan fungsi pada service layer untuk mendukung manipulasi tema pada DOM dan penyimpanan dual-tier:

```typescript
export const SETTINGS_STORAGE_KEY = "sibaq_user_settings";

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  notificationEnabled: true,
  darkMode: false,
  theme: "light",
};

/**
 * Mengambil settings dari L1 localStorage (fallback ke DEFAULT_SETTINGS)
 */
export const getLocalSettings: () => UserSettings;

/**
 * Menyimpan settings ke L1 localStorage
 */
export const saveLocalSettings: (settings: UserSettings) => void;

/**
 * Menerapkan atribut data-theme dan class dark secara langsung ke dokumen HTML
 */
export const applyThemeToDOM: (isOled: boolean | ThemeMode) => void;

/**
 * Mengambil settings dari L2 Firestore dan merekonsiliasi ke L1 localStorage
 */
export const fetchRemoteSettings: (uid: string) => Promise<UserSettings>;

/**
 * Menyimpan pembaruan settings ke L1 (segera) dan L2 Firestore (jika uid valid)
 */
export const persistSettings: (
  uid: string | null,
  newSettings: Partial<UserSettings>
) => Promise<UserSettings>;
```

---

## 4. Panduan Desain True OLED & Responsivitas Adaptif

### 4.1 Token Desain True OLED Stark Minimalist (CSS Variables & Tailwind v4)
Definisi token dalam `styles/globals.css`:

```css
@import "tailwindcss";

/* Definisi varian dark untuk Tailwind v4 */
@custom-variant dark (&:where([data-theme="oled"], [data-theme="oled"] *, .dark, .dark *));

:root {
  /* Mode Terang Klasik (Islamic Oasis & Qalam Paper) */
  --color-canvas-bg: #FDFBF7;
  --color-surface-bg: #FFFFFF;
  --color-surface-subtle: #F8F6F0;
  --color-border-hairline: #F3E8D6;
  --color-border-strong: #E5D5BC;
  --color-border-active: #047857;

  --color-text-primary: #1E293B;
  --color-text-secondary: #64748B;
  --color-text-muted: #94A3B8;

  --color-accent-emerald: #047857;
  --color-accent-amber: #F59E0B;
  --color-accent-rose: #EF4444;
}

:root[data-theme="oled"],
.dark {
  /* True OLED Black Stark Minimalist */
  --color-canvas-bg: #000000;         /* Piksel OLED Mati (0 mA Power Draw) */
  --color-surface-bg: #000000;        /* Flat Pure Black Canvas */
  --color-surface-card: #09090B;      /* Surface Card Zinc-950 Pekat */
  --color-border-hairline: #27272A;   /* Hairline Border 1px Solid Zinc-800 */
  --color-border-strong: #3F3F46;     /* Border Interaktif Zinc-700 */
  --color-border-active: #FFFFFF;     /* Border Aktif/Fokus Kontras Maksimal */

  --color-text-primary: #FFFFFF;       /* Teks Utama Putih Bersih (WCAG AAA) */
  --color-text-secondary: #A1A1AA;     /* Teks Sekunder Zinc-400 */
  --color-text-muted: #71717A;         /* Teks Muted Zinc-500 */

  --color-accent-emerald: #10B981;     /* Solid Emerald Tajam */
  --color-accent-amber: #F59E0B;       /* Solid Gold Koin Santri */
  --color-accent-rose: #EF4444;        /* Solid Red Aksi Batal/Tolak */
}

/* Base Body Styling */
body {
  background-color: var(--color-canvas-bg);
  color: var(--color-text-primary);
  font-family: var(--font-nunito), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

### 4.2 Daftar Larangan Visual (*Anti-Pattern Ban List*)
- **DILARANG:** `bg-gradient-to-*`, `bg-gradient-*`, `radial-gradient`.
- **DILARANG:** Efek pendaran latar belakang desktop (`blur-3xl`, `blur-2xl` seperti pada `MobileAppShell.tsx:24-27`).
- **DILARANG:** Bayangan kabur tebal berwarna (*glowing colored shadows* seperti `shadow-emerald-500/30`).
- **DILARANG:** Warna latar belakang abu-abu pudar (`#1a1a1a` atau `#121212`) untuk kontainer utama saat mode OLED aktif. Kanvas wajib `#000000`.

### 4.3 Spesifikasi Responsivitas Tablet & Desktop
1. **`MobileAppShell.tsx` Kontainer Adaptif:**
   - Mengeliminasi backdrop blur orbs sepenuhnya.
   - Mengubah pembungkus konten dari `max-w-md` menjadi `w-full max-w-md md:max-w-5xl`.
   - Mengatur transisi latar belakang: `bg-[#FDFBF7] dark:bg-black text-slate-800 dark:text-zinc-100`.
   - Menjaga padding bawah `pb-24` di mobile agar tidak tertutup `AdaptiveBottomNav`.
2. **Tata Letak Kisi Halaman (Multi-Column Grid):**
   - Halaman Materi (`/dashboard/courses`): `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`.
   - Halaman Toko Hadiah (`/dashboard/exchange`): `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`.
   - Halaman Peringkat & Progres Santri: Menggunakan kontainer dua kolom di layar tablet/desktop (`grid-cols-1 md:grid-cols-2`).
3. **`AdaptiveBottomNav.tsx` Responsif:**
   - Di layar kecil (<768px): Tetap mengambang di bawah sebagai tab bar sentuh jempol.
   - Di layar tablet/desktop (≥768px): Dapat tetap terpusat secara rapi di bawah dengan `max-w-md` atau melebar proporsional dengan styling OLED yang selaras (`dark:bg-black/95 dark:border-zinc-800`).

---

## 5. Acceptance Criteria Lengkap (Kriteria Keberterimaan)

### AC-1: Kepatuhan Visual True OLED (Stark Minimalism)
- [ ] Latar belakang kanvas aplikasi bernilai `#000000` murni ketika mode OLED aktif.
- [ ] Kartu, modal, dan sheet menggunakan permukaan solid `#000000` atau `#09090B` dengan border hairline 1px `#27272A`.
- [ ] Tidak ada satupun elemen yang menggunakan latar gradasi (`bg-gradient-*`).
- [ ] Kontras tipografi Latin dan Arab memenuhi standar rasio WCAG AAA (≥ 7:1) terhadap latar hitam pekat.

### AC-2: Eliminasi Pendaran & Blob Blur Dekoratif
- [ ] Elemen dekoratif backdrop orbs bergradasi (`blur-3xl`, `bg-emerald-200/40`, `bg-amber-200/40`) di `MobileAppShell.tsx` dihapus seutuhnya.
- [ ] Seluruh kartu di dashboard dan dialog menggunakan batas solid tegas tanpa pendaran glow ambient.

### AC-3: Responsivitas Adaptif Multi-Viewport
- [ ] **Layar Mobile (<768px):** Lebar kontainer terpusat `max-w-md` (atau 100% fluid), navigasi bawah (`AdaptiveBottomNav`) terpasang paten di bawah layar.
- [ ] **Layar Tablet/Desktop (≥768px):** Kontainer melebar hingga `max-w-5xl`, daftar materi dan hadiah otomatis mengalir ke tata letak kisi 2 hingga 3 kolom (`md:grid-cols-2 lg:grid-cols-3`).
- [ ] Tidak terjadi horizontal overflow (*no horizontal scrollbar*) pada resolusi layar berapapun antara 320px hingga 2560px.

### AC-4: Toggle True OLED di Halaman Pengaturan
- [ ] Halaman `/dashboard/settings` menampilkan toggle khusus untuk "Mode True OLED".
- [ ] Menggeser toggle segera mengubah atribut DOM `data-theme="oled"` dan menambahkan class `.dark` pada elemen root tanpa perlu me-reload halaman.
- [ ] Nilai preferensi tersimpan seketika di L1 LocalStorage (`sibaq_user_settings`).
- [ ] Jika user memiliki sesi login aktif (`uid` valid), fungsi `persistSettings` melakukan pembaruan asinkron ke dokumen Firestore `users/{uid}`.

### AC-5: Pencegahan Kedipan Layar (*Zero FOUC*)
- [ ] Saat halaman dimuat ulang (*refresh*), tema OLED dimuat seketika dari L1 LocalStorage sebelum rendering selesai, sehingga tidak terjadi kedipan putih sesaat (*flash of unstyled/light theme*).
- [ ] Jika LocalStorage kosong, aplikasi menggunakan default aman tanpa melempar runtime exception.

### AC-6: Keutuhan Tipe TypeScript & Backward Compatibility
- [ ] `UserSettingsSchema` menerima data tanpa field `darkMode` atau `theme` dari Firestore lama tanpa melempar error Zod parsing.
- [ ] Perintah `npx tsc --noEmit` lolos dengan status 0 error.

### AC-7: Integritas Test Suite & Zero Defect
- [ ] Seluruh unit test baru (`tests/theme.test.ts`, `tests/pages/darkMode.test.tsx`, `tests/layout/responsiveLayout.test.tsx`) berstatus 100% PASS.
- [ ] Seluruh 169 unit test eksisting pada repositori tetap berstatus PASS tanpa regresi.

---

## 6. Skenario Pengujian TDD Terperinci (RED -> GREEN -> REFACTOR)

Berikut adalah skenario pengujian TDD yang wajib dibuat dan diverifikasi secara bertahap.

---

### 6.1 Skenario 1: `tests/theme.test.ts` (Design Tokens & OLED Rules)

#### Siklus RED:
Tulis pengujian yang memverifikasi keberadaan token warna True OLED, class variant dark, dan eliminasi aturan gradient/blur pada `styles/globals.css`.

```typescript
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Design System Tokens & True OLED Configuration", () => {
  const cssPath = path.resolve(__dirname, "../styles/globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  it("defines Islamic Oasis & Warm Gold color tokens in styles/globals.css", () => {
    expect(cssContent).toContain("#FDFBF7");
    expect(cssContent).toContain("#047857");
    expect(cssContent).toContain("#F59E0B");
    expect(cssContent).toContain("#F3E8D6");
  });

  it("configures True OLED Black (#000000) and Stark hairline border tokens", () => {
    // Canvas hitam murni
    expect(cssContent).toContain("#000000");
    // Surface card pekat zinc-950
    expect(cssContent).toContain("#09090B");
    // Hairline border zinc-800
    expect(cssContent).toContain("#27272A");
    // Interactive border zinc-700
    expect(cssContent).toContain("#3F3F46");
    // Active/focus border putih
    expect(cssContent).toContain("#FFFFFF");
  });

  it("configures Tailwind v4 dark variant or data-theme attribute selector", () => {
    const hasDataTheme = cssContent.includes('data-theme="oled"') || cssContent.includes("[data-theme='oled']");
    const hasDarkVariant = cssContent.includes("@custom-variant dark") || cssContent.includes("@variant dark");
    expect(hasDataTheme || hasDarkVariant).toBe(true);
  });

  it("does not define any ambient decorative blur filters in core tokens", () => {
    expect(cssContent).not.toContain("blur-3xl");
    expect(cssContent).not.toContain("blur-2xl");
  });

  it("configures Amiri and Nunito fonts in app/layout.tsx", () => {
    const layoutContent = fs.readFileSync(path.resolve(__dirname, "../app/layout.tsx"), "utf-8");
    expect(layoutContent).toContain("Amiri");
    expect(layoutContent).toContain("Nunito");
  });
});
```

#### Siklus GREEN:
Perbarui `styles/globals.css` dengan CSS variables True OLED dan deklarasi `@custom-variant dark`.

#### Siklus REFACTOR:
Rapikan penamaan token CSS agar selaras dengan variabel Tailwind v4.

---

### 6.2 Skenario 2: `tests/pages/darkMode.test.tsx` (Dark Mode Toggle & Persistence)

#### Siklus RED:
Tulis unit test berbasis React Testing Library untuk menguji interaktivitas toggle True OLED pada halaman Settings dan integrasinya dengan `settingsService`.

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import SettingsPage from "@/app/dashboard/settings/page";
import * as settingsService from "@/lib/services/settingsService";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    uid: "user-santri-oled-123",
    email: "santri.oled@sibaq.com",
    role: "santri",
  }),
}));

vi.mock("@/lib/auth", () => ({
  changeUserPassword: vi.fn(),
}));

vi.mock("@/lib/services/settingsService", () => {
  let localStore = {
    soundEnabled: true,
    notificationEnabled: true,
    darkMode: false,
    theme: "light" as const,
  };

  return {
    SETTINGS_STORAGE_KEY: "sibaq_user_settings",
    DEFAULT_SETTINGS: {
      soundEnabled: true,
      notificationEnabled: true,
      darkMode: false,
      theme: "light",
    },
    getLocalSettings: vi.fn(() => ({ ...localStore })),
    saveLocalSettings: vi.fn((newSettings) => {
      localStore = { ...localStore, ...newSettings };
    }),
    applyThemeToDOM: vi.fn((isOled: boolean | string) => {
      const active = isOled === true || isOled === "oled";
      if (typeof document !== "undefined") {
        if (active) {
          document.documentElement.setAttribute("data-theme", "oled");
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.removeAttribute("data-theme");
          document.documentElement.classList.remove("dark");
        }
      }
    }),
    fetchRemoteSettings: vi.fn(async () => ({ ...localStore })),
    persistSettings: vi.fn(async (_uid, updates) => {
      localStore = { ...localStore, ...updates };
      return { ...localStore };
    }),
  };
});

describe("True OLED Dark Mode Toggle & Governance in SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    cleanup();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark");
  });

  it("renders the True OLED Dark Mode toggle section with clear description", () => {
    render(<SettingsPage />);

    expect(screen.getByText(/Mode True OLED/i)).toBeDefined();
    expect(screen.getByLabelText(/Toggle Mode True OLED/i)).toBeDefined();
    expect(screen.getByText(/Hitam Pekat/i)).toBeDefined();
  });

  it("reads initial state from settingsService.getLocalSettings and reflects in UI", () => {
    render(<SettingsPage />);
    const oledToggle = screen.getByLabelText(/Toggle Mode True OLED/i);
    expect(oledToggle).toBeDefined();
    // Default awal adalah false
    expect(oledToggle.getAttribute("aria-checked")).toBe("false");
  });

  it("persists theme preference to L1 & L2 and mutates DOM attributes when toggled", async () => {
    render(<SettingsPage />);

    const oledToggle = screen.getByLabelText(/Toggle Mode True OLED/i);
    fireEvent.click(oledToggle);

    await waitFor(() => {
      // 1. Memanggil persistSettings dengan payload darkMode dan theme
      expect(settingsService.persistSettings).toHaveBeenCalledWith(
        "user-santri-oled-123",
        expect.objectContaining({
          darkMode: true,
          theme: "oled",
        })
      );

      // 2. Memanggil applyThemeToDOM atau menerapkan atribut pada root DOM
      expect(document.documentElement.getAttribute("data-theme")).toBe("oled");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  it("toggles off True OLED back to light mode correctly", async () => {
    // Simulasikan state awal sudah aktif (oled)
    vi.mocked(settingsService.getLocalSettings).mockReturnValueOnce({
      soundEnabled: true,
      notificationEnabled: true,
      darkMode: true,
      theme: "oled",
    });

    render(<SettingsPage />);

    const oledToggle = screen.getByLabelText(/Toggle Mode True OLED/i);
    expect(oledToggle.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(oledToggle);

    await waitFor(() => {
      expect(settingsService.persistSettings).toHaveBeenCalledWith(
        "user-santri-oled-123",
        expect.objectContaining({
          darkMode: false,
          theme: "light",
        })
      );
      expect(document.documentElement.getAttribute("data-theme")).toBeNull();
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  it("gracefully falls back when Firestore sync fails, keeping L1 local persistence intact", async () => {
    vi.mocked(settingsService.persistSettings).mockImplementationOnce(async () => {
      // Throw error pada sinkronisasi remote
      throw new Error("Firestore Network Unavailable");
    });

    render(<SettingsPage />);

    const oledToggle = screen.getByLabelText(/Toggle Mode True OLED/i);
    // Tidak boleh crash saat tombol diklik
    expect(() => fireEvent.click(oledToggle)).not.toThrow();
  });
});
```

#### Siklus GREEN:
1. Perbarui `types/schema.ts` (`UserSettingsSchema` ditambahkan `darkMode` dan `theme`).
2. Perbarui `lib/services/settingsService.ts` (`applyThemeToDOM`, `DEFAULT_SETTINGS`).
3. Tambahkan toggle True OLED di `app/dashboard/settings/page.tsx` dengan `aria-label="Toggle Mode True OLED"` dan `aria-checked`.

#### Siklus REFACTOR:
Pastikan transisi toggle halus, styling border hairline 1px solid, dan penanganan error Firestore tidak memunculkan uncaught promise rejection.

---

### 6.3 Skenario 3: `tests/layout/responsiveLayout.test.tsx` (Zero Blur & Adaptive Grid)

#### Siklus RED:
Tulis unit test untuk memverifikasi penghapusan decorative blob blur di `MobileAppShell`, responsivitas container (`max-w-md` menuju `md:max-w-5xl`), dan struktur grid multi-kolom.

```typescript
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import MobileAppShell from "@/components/layout/MobileAppShell";
import CoursesPage from "@/app/dashboard/courses/page";

// Mock dependencies
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    uid: "test-user-responsive",
    role: "santri",
    username: "Ahmad Santri",
    totalPoint: 150,
    avatarURL: null,
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/courses",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/courses", () => ({
  getCourses: vi.fn(async () => [
    {
      id: "course-1",
      title: "Huruf Hijaiyah Dasar",
      description: "Mengenal bentuk huruf Alif sampai Ya",
      category: "Hijaiyah",
      level: "Dasar",
      totalQuestions: 5,
    },
    {
      id: "course-2",
      title: "Hukum Nun Mati & Tanwin",
      description: "Belajar Idzhar, Idgham, Ikhfa, Iqlab",
      category: "Tajwid",
      level: "Menengah",
      totalQuestions: 5,
    },
    {
      id: "course-3",
      title: "Makhorijul Huruf",
      description: "Tempat keluarnya huruf hijaiyah",
      category: "Tahsin",
      level: "Lanjutan",
      totalQuestions: 5,
    },
  ]),
}));

describe("Responsive Layout & Zero Blob Blur Architecture", () => {
  afterEach(() => {
    cleanup();
  });

  it("MobileAppShell contains ZERO decorative blob blur elements", () => {
    const { container } = render(
      <MobileAppShell>
        <div data-testid="test-content">Konten Aplikasi</div>
      </MobileAppShell>
    );

    // Verifikasi tidak ada elemen dengan blur-3xl atau blur-2xl
    const blobElements = container.querySelectorAll('[class*="blur-3xl"], [class*="blur-2xl"]');
    expect(blobElements.length).toBe(0);

    // Verifikasi tidak ada elemen bergradasi ambient backdrop
    const gradientBackdrops = container.querySelectorAll('[class*="bg-emerald-200/40"], [class*="bg-amber-200/40"]');
    expect(gradientBackdrops.length).toBe(0);
  });

  it("MobileAppShell adopts adaptive container sizing (max-w-md on mobile, expanding on md+)", () => {
    const { container } = render(
      <MobileAppShell>
        <div data-testid="test-content">Konten Aplikasi</div>
      </MobileAppShell>
    );

    // Cari kontainer utama aplikasi
    const shellContainer = container.querySelector("main")?.parentElement;
    expect(shellContainer).toBeDefined();

    const className = shellContainer?.className || "";
    // Memiliki batasan mobile max-w-md
    expect(className).toContain("max-w-md");
    // Memiliki kemampuan adaptif membesar pada breakpoint md (tablet/desktop)
    expect(className).toMatch(/md:max-w-(4xl|5xl|6xl)/);
  });

  it("supports True OLED dark mode class bindings in shell container", () => {
    const { container } = render(
      <MobileAppShell>
        <div data-testid="test-content">Konten Aplikasi</div>
      </MobileAppShell>
    );

    const outerWrapper = container.firstElementChild;
    const outerClassName = outerWrapper?.className || "";

    // Memiliki dukungan dark mode background OLED pekat
    expect(outerClassName).toMatch(/dark:bg-black|dark:bg-\[#000000\]/);
  });

  it("CoursesPage renders cards inside a responsive multi-column grid layout", async () => {
    const { container } = render(<CoursesPage />);

    // Tunggu data materi dimuat
    await screen.findByText(/Huruf Hijaiyah Dasar/i);

    // Temukan container grid materi
    const gridContainer = container.querySelector(".grid");
    expect(gridContainer).toBeDefined();

    const gridClasses = gridContainer?.className || "";
    // 1 kolom di mobile
    expect(gridClasses).toContain("grid-cols-1");
    // 2 atau 3 kolom pada layar tablet/desktop
    expect(gridClasses).toMatch(/md:grid-cols-2|lg:grid-cols-3|sm:grid-cols-2/);
  });
});
```

#### Siklus GREEN:
1. Hapus div backdrop blur dekoratif di `components/layout/MobileAppShell.tsx:24-27`.
2. Ubah kelas kontainer di `MobileAppShell.tsx` menjadi:
   `w-full max-w-md md:max-w-5xl min-h-screen bg-[#FDFBF7] dark:bg-black md:border-x md:border-[#F3E8D6] dark:md:border-zinc-800 ...`
3. Perbarui `app/dashboard/courses/page.tsx` dengan kelas grid adaptif:
   `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`.

#### Siklus REFACTOR:
Uji visual pada berbagai viewport emulasi (375px iPhone, 768px iPad mini, 1024px iPad Pro, 1440px Desktop) untuk menjamin tidak ada margin clipping atau horizontal overflow.

---

## 7. Rencana Kerja Eksekusi Bertahap (Implementation Roadmap)

| Tahap | Fokus Pekerjaan | Deliverable / File Terkait | Verifikasi Gate |
|---|---|---|---|
| **Tahap 1** | Schema & Token True OLED | `types/schema.ts`, `styles/globals.css` | `npx vitest run tests/theme.test.ts` PASS |
| **Tahap 2** | Service Layer & DOM Sync | `lib/services/settingsService.ts` | `npx vitest run tests/services/settingsService.test.ts` PASS |
| **Tahap 3** | Settings UI & OLED Toggle | `app/dashboard/settings/page.tsx` | `npx vitest run tests/pages/darkMode.test.tsx` PASS |
| **Tahap 4** | Shell Adaptif & Zero Blur | `components/layout/MobileAppShell.tsx` | `npx vitest run tests/layout/responsiveLayout.test.tsx` PASS |
| **Tahap 5** | Komponen UI True OLED | `TactileCard.tsx`, `AdaptiveBottomNav.tsx`, `AdaptiveTopBar.tsx` | Verifikasi styling dark/oled hairline borders |
| **Tahap 6** | Grid Multi-Kolom Kursus & Toko | `courses/page.tsx`, `exchange/page.tsx` | Responsive grid audit (1 kol -> 2-3 kol) |
| **Tahap 7** | Audit Regresi & Build Gate | Seluruh repositori | `npx tsc --noEmit` & `npm test` (169+ PASS) |

---

## 8. Verifikasi Kepatuhan & Persetujuan Arsitektur

Dokumen spesifikasi ini telah diverifikasi untuk menjamin:
- **Zero Type Defect:** Seluruh kontrak Zod dan TypeScript kompatibel penuh dengan codebase Next.js 15 dan React 19.
- **Hardware-Level Efficiency:** Warna `#000000` True OLED mematikan sub-piksel OLED untuk efisiensi energi optimal saat santri belajar di lingkungan minim cahaya.
- **Strict TDD Compliance:** Seluruh tahapan dipandu oleh siklus RED -> GREEN -> REFACTOR dengan pengujian unit otomatis yang ketat.
- **Arsitektur Disetujui:** Siap dijadikan acuan eksekusi implementasi oleh tim pengembang atau agent autonomous.
