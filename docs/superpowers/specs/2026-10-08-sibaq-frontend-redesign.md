# SibaQ Frontend Architectural Redesign Specification (Taman Belajar Santri)

- **Date:** 2026-10-08
- **Project:** SibaQ (`DickyCandraPermana/tpa-app`)
- **Author:** The Key & Dicky Candra Permana
- **Target Path:** `docs/superpowers/specs/2026-10-08-sibaq-frontend-redesign.md`
- **Status:** Approved Draft for Implementation Planning

---

## 1. Executive Summary & Vision

SibaQ adalah platform web edukasi interaktif untuk santri Taman Pendidikan Al-Qur'an (TPA) berusia 6–13 tahun dan asatidz pendamping. Dokumen ini mendefinisikan perombakan total arsitektur frontend dari dasar (*ground-up*), meninggalkan UI lama seutuhnya untuk mewujudkan konsep **"Taman Belajar Santri"**: sebuah lingkungan belajar yang hangat, ramah anak, berestetika Islami modern, dan sarat gamifikasi positif (pahala, bintang, dan lentera istiqomah).

Redesign ini dibangun di atas fondasi *Clean Architecture* yang telah dimodernisasi sebelumnya (Next.js 15 App Router, React 19, Tailwind CSS v4, Zod schema validation, dan service layer Firebase terenkapsulasi).

---

## 2. Design System & Visual Tokens (*Emerald Oasis & Warm Gold*)

### 2.1 Color Palette Tokens
* **Canvas Background:** `#FDFBF7` (*Warm Ivory / Qalam Paper*) — Menggantikan warna putih kontras tinggi untuk kenyamanan mata anak saat membaca teks panjang atau mushaf.
* **Surface Background:** `#FFFFFF` murni pada kartu konten dengan border bernuansa pasir lembut `#F3E8D6` dan bayangan lembut (*soft tactile drop shadow*).
* **Primary (Emerald Islamic Identity):**
  * `emerald-deep` (`#064E3B`): Teks judul, heading arabesque, header halaqah.
  * `emerald-main` (`#047857`): Aksi utama (CTA), bar progres level, navigasi aktif.
  * `emerald-light` (`#10B981`): Status jawaban benar, indikator kuis selesai.
  * `emerald-tint` (`#ECFDF5`): Latar belakang modul yang sedang dipelajari.
* **Gamification & Accents (Warm Gold):**
  * `gold-star` (`#F59E0B`): Bintang capaian kuis (1–3 bintang), koin berkah santri, ikon lentera.
  * `gold-shade` (`#D97706`): Bevel bayangan 3D pada tombol dan lencana tactile.
  * `gold-glow` (`#FEF3C7`): Latar sorotan penambahan poin dan selebrasi naik level.
* **Feedback States:**
  * Sukses / Benar: Emerald lembut (`#10B981`) + notifikasi apresiatif.
  * Belum Tepat / Coba Lagi: Coral ramah (`#F87171`) tanpa penalti skor minus.

### 2.2 Dual-Script Typography
* **Latin Script (UI, Label, Instruksi):** `Plus Jakarta Sans` / `Nunito` — Huruf membulat, bersahabat, legibilitas tinggi untuk anak-anak.
* **Arabic Script (Hijaiyah, Mushaf, Doa):** `Amiri` / `Scheherazade New` — Harakat jelas, tebal, proporsional, dirender dalam ukuran besar (36px–64px) dengan atribut `dir="rtl"`.

### 2.3 Tactile 3D Component Philosophy
* **Corner Radius:** `rounded-3xl` (24px) untuk kartu modul dan modal, serta `rounded-full` untuk chip lencana.
* **Tactile Bevel Effect:** Tombol aksi memiliki bayangan tebal bawah (`border-b-4 border-emerald-900 active:border-b-0 active:translate-y-1`) untuk memberikan sensasi taktil fisik yang memuaskan saat disentuh di smartphone.

---

## 3. Shell Architecture & Adaptive Navigation

### 3.1 Mobile-First Viewport Container
* **Desktop Environment:** Kanvas latar `#FDFBF7` dihiasi pola watermark geometris Islami minimalis. Konten utama dirender terpusat dalam container smartphone/tablet (`max-w-md` ~448px, `min-h-screen`, `bg-[#FDFBF7]`, `border-x border-[#F3E8D6]`, `shadow-2xl`).
* **Mobile Environment:** Memenuhi 100% viewport perangkat secara native dengan penyesuaian safe-area atas dan bawah.

### 3.2 Adaptive Top Bar
Bilah atas mengambang (`sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md px-4 py-3 border-b border-[#F3E8D6]/60`):
* **Mode Santri:**
  * Kiri: Avatar santri melingkar dan nama panggilan santri.
  * Kanan: Dua chip tactile: Koin Berkah (🪙 `totalPoint`) dan Lentera Istiqomah (🏮 `streak`).
* **Mode Ustadz:**
  * Kiri: Lencana Halaqah / Kelas (misal: *Halaqah Abu Bakar*).
  * Kanan: Indikator klaim hadiah santri yang membutuhkan persetujuan fisik.

### 3.3 Adaptive Bottom Navigation Bar
Bilah navigasi bawah mengambang (`fixed bottom-0 max-w-md w-full pb-safe z-40 bg-white/95 backdrop-blur-md border-t border-[#F3E8D6] rounded-t-3xl shadow-lg`):
* **Menu Santri (5 Tab):**
  1. 🗺️ **Peta Belajar (`/dashboard`):** Petualangan jalur level santri.
  2. 📖 **Materi (`/dashboard/courses`):** Katalog modul hijaiyah, tajwid, dan hafalan.
  3. 🎯 **Kuis (`/dashboard/soal`):** Latihan interaktif harian.
  4. 🎁 **Toko Berkah (`/dashboard/exchange`):** Penukaran koin berkah dengan hadiah nyata.
  5. 👤 **Profil (`/dashboard/profile`):** Koleksi lencana capaian dan ringkasan belajar.
* **Menu Ustadz (4 Tab):**
  1. 👥 **Progres Santri (`/dashboard`):** Daftar santri halaqah, jilid aktif, dan riwayat setoran.
  2. 📚 **Kelola Modul (`/dashboard/courses`):** Peninjauan materi, preview audio, dan kurasi soal.
  3. 🎁 **Verifikasi Hadiah (`/dashboard/exchange`):** Antrean persetujuan penukaran hadiah santri.
  4. ⚙️ **Kelas & Akun (`/dashboard/profile`):** Konfigurasi halaqah dan pengaturan akun asatidz.

---

## 4. Detailed Screen Specifications

### 4.1 Screen 1: Landing Page (`/`)
* **Hero Banner:** Ilustrasi gerbang taman santri hangat dengan headline: *"Belajar Mengaji Asyik & Berkah Bersama SibaQ"*.
* **Call To Action:** Tombol tactile raksasa *"Mulai Petualangan Mengaji"* mengarahkan ke `/login` atau langsung ke `/dashboard` jika session aktif.
* **Feature Highlights:** Tiga kartu fitur (Peta Jalur Iqro, Arena Kuis Pahala, Toko Hadiah Santri).

### 4.2 Screen 2: Gerbang Masuk & Pendaftaran (`/login` & `/register`)
* **Role Switcher:** Tab kapsul di bagian atas form: **[ 👦 Santri ]** / **[ 👳 Ustadz ]**.
* **Input Fields:** Input email/username dan kata sandi dengan ikon intip password ramah anak.
* **Error Handling:** Pesan validasi disajikan via kartu peringatan bernada apresiatif dan bersahabat.

### 4.3 Screen 3: Peta Belajar Santri & Monitoring Ustadz (`/dashboard`)
* **Santri View (Jalur Petualangan Vertikal):**
  * Jalur kurva berkelok-kelok dengan simpul node melingkar:
    * *Completed Node:* Warna emas berkilau dengan 3 bintang (`⭐ ⭐ ⭐`) dan ikon centang.
    * *Current Active Node:* Warna emerald berdenyut halus (*pulse animation*) dengan ikon buku terbuka.
    * *Locked Node:* Warna pasir lembut dengan ikon gembok kubah masjid.
  * Kartu misi harian di header peta (misal: *"Selesaikan 1 Materi Hari Ini"*).
* **Ustadz View (Dashboard Halaqah):**
  * Kartu ringkasan halaqah (Total santri, santri tuntas pekan ini, klaim hadiah pending).
  * Daftar kartu santri dengan progress bar jilid, halaman terakhir, dan tombol cepat *"Update Progres"*.

### 4.4 Screen 4: Ruang Belajar Materi (`/dashboard/courses/[course]`)
* **Display Kartu Hijaiyah / Tajwid:**
  * Kartu utama berukuran besar menampilkan huruf atau kaidah dalam teks Arab 56px–64px kontras tinggi.
  * Tombol audio makhraj melingkar emas yang memutar pelafalan fasih saat disentuh.
* **Step Navigator:** Titik progres di bagian atas dan tombol tactile navigasi *"Sebelumnya"* & *"Selanjutnya"*.
* **Ustadz Actions:** Tombol pratinjau soal kuis terkait modul tersebut.

### 4.5 Screen 5: Quiz Arena & Selebrasi Skor (`/dashboard/courses/[course]/take`)
* **Progress Bar Lentera:** Menampilkan jumlah soal tersisa secara santai tanpa timer intimidatif.
* **Pilihan Jawaban Tactile:** 4 kartu pilihan jawaban berukuran besar. Saat dipilih:
  * *Jawaban Benar:* Kartu berubah hijau emerald lembut dengan suara chime dan percikan confetti.
  * *Jawaban Salah:* Kartu bergoyang pelan (*gentle wobble*) menampilkan petunjuk belajar.
* **Modal Selebrasi Hasil:**
  * Ditampilkan saat kuis selesai: perolehan bintang (1–3 bintang), teks apresiasi (*"Mumtaz! Kamu Hebat!"*), dan animasi penambahan koin bertahap (+15 🪙).

### 4.6 Screen 6: Toko Berkah & Verifikasi Hadiah (`/dashboard/exchange`)
* **Santri View:**
  * Header saldo koin besar dengan ilustrasi peti berkah.
  * Grid katalog hadiah anak (Buku Kisah Nabi, Tasbih Digital, Peci Santri, Pensil Warna).
  * Kartu hadiah menghitung selisih koin secara dinamis: jika koin belum cukup, menampilkan teks *"Kurang X Koin"*.
  * Dialog konfirmasi penukaran via `ConfirmModal` kustom anak.
* **Ustadz View:**
  * Tab khusus *"Daftar Klaim Santri"*.
  * Ustadz dapat menekan tombol *"Tandai Diterima Santri"* untuk memvalidasi serah-terima fisik hadiah di masjid.

---

## 5. Component Hierarchy & File Structure

```
components/
├── ui/
│   ├── TactileButton.tsx       # Tombol 3D ber-bevel tactile (Primary, Accent, Neutral)
│   ├── TactileCard.tsx         # Kartu bersudut rounded-3xl berlatar putih/ivory
│   ├── GoldBadge.tsx           # Chip lencana koin (🪙), bintang (⭐), lentera (🏮)
│   ├── ArabicText.tsx          # Komponen perender font Amiri dengan harakat tebal
│   ├── ConfirmModal.tsx        # Dialog konfirmasi kustom bertema santri
│   └── ToastNotification.tsx   # Banner feedback mengambang ramah anak
├── layout/
│   ├── MobileAppShell.tsx      # Container terpusat di desktop & responsif di mobile
│   ├── AdaptiveTopBar.tsx      # Bilah status koin/streak santri atau status ustadz
│   └── AdaptiveBottomNav.tsx   # Dock navigasi adaptif sesuai role aktif
└── features/
    ├── LearningPathMap.tsx     # Komponen peta jalur petualangan belajar berkelok
    ├── HijaiyahCard.tsx        # Kartu materi hijaiyah raksasa dengan audio trigger
    ├── QuestionCard.tsx        # Komponen kartu soal kuis dan 4 pilihan jawaban
    ├── ScoreCelebration.tsx    # Modal selebrasi perolehan bintang dan koin
    ├── RewardCard.tsx          # Kartu katalog penukaran hadiah dengan cek saldo
    └── SantriProgressCard.tsx  # Kartu monitoring profil & progress santri untuk ustadz
```

---

## 6. Integration & State Management

1. **Autentikasi & Profil (`context/AuthContext.tsx`):**
   * Menggunakan listener native `onAuthStateChanged` Firebase Auth.
   * Sinkronisasi data realtime via Firestore `onSnapshot(doc(db, "users", uid))` sehingga saldo koin, daftar course selesai, dan peran (`santri` / `ustaz`) langsung terefleksi tanpa reload.
2. **Kuis & Belajar (`hooks/useQuizSession.ts`):**
   * Mesin status kuis terenkapsulasi: perpindahan nomor soal, penilaian benar/salah, perolehan bintang, dan mutasi Firestore via `userService.updateUserPoints` dan `userService.markCourseCompleted`.
3. **Katalog & Klaim Hadiah (`hooks/useRewards.ts`):**
   * Mengelola pemanggilan `rewardService.getRewards()` dan `rewardService.claimReward()` dengan validasi saldo atomik.

---

## 7. Error Handling & Accessibility

* **Kid-Friendly Error Messaging:** Mengganti seluruh pesan teknis dengan bahasa yang memotivasi dan tidak membingungkan anak.
* **Contrast & Legibility:** Memastikan rasio kontras warna minimal 4.5:1 untuk teks Latin maupun huruf Arab terhadap background ivory.
* **Audio Accessibility:** Jika audio gagal berputar, sistem tetap menyediakan petunjuk transliterasi visual tanpa memblokir progres belajar.

---

## 8. Testing Strategy (Vitest)

* **Unit Tests (`tests/components/`):**
  * `TactileButton.test.tsx`: Pengujian klik, status disabled, dan kelas bevel tactile.
  * `ArabicText.test.tsx`: Pengujian rendering font mushaf dan atribut `dir="rtl"`.
  * `RewardCard.test.tsx`: Pengujian logika tombol aktif vs koin kurang.
* **Hook Tests (`tests/hooks/`):**
  * `useQuizSession.test.ts`: Pengujian state machine kuis, perolehan skor, dan transisi selebrasi.
* **Role Adaptation Tests (`tests/layout/`):**
  * `AdaptiveBottomNav.test.tsx`: Memastikan menu Santri muncul saat role `santri`, dan menu Ustadz muncul saat role `ustaz`.
