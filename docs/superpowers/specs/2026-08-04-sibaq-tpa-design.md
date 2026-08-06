# Spesifikasi Desain SibaQ (Aplikasi Web Pembelajaran TPA)

## 1. Konsep Visual & Arsitektur Utama

- **Visual & Tema:** Premium & Fun. Menggunakan elemen dengan *rounded corners* (sudut membulat), palet warna cerah (Indigo, Amber, Teal), dan tipografi ramah anak (seperti Nunito atau Quicksand).
- **Signature Element:** Indikator poin dinamis di *header* yang memberikan umpan balik (feedback) visual instan (seperti animasi pop/konfeti) ketika bertambah.
- **Arsitektur:** Next.js 14 (App Router) dan Tailwind CSS untuk *frontend*.
- **Backend & Database:** Firebase Auth (Autentikasi) dan Firestore (Database NoSQL).
- **Skema Database Utama:** `users`, `courses`, `questions`, `rewards`, `redeem_requests`.

## 2. Alur Navigasi (Routing)

- `/` *(Landing Page)*: Area perkenalan yang memukau secara visual dengan *call-to-action* (CTA) untuk login/mulai.
- `/auth` *(Autentikasi)*: Halaman Login & Registrasi dengan tema *playful*, menghindari bentuk form yang kaku.
- `/dashboard` *(Dashboard User)*: Pusat aktivitas yang menampilkan sisa poin, profil anak, dan daftar *Courses* yang tersedia.
- `/course/[id]` *(Detail Course)*: Menampilkan rangkuman course (jumlah pertanyaan, total potensi poin) sebelum anak memulai.
- `/soal/[id]` *(Kuis Interaktif)*: Arena menjawab kuis yang bebas dari distraksi. Menyajikan visual dan audio (seperti suara huruf hijaiyah).
- `/rewards` *(Katalog Hadiah)*: Toko penukaran poin dengan barang-barang fisik.

## 3. Komponen Utama & Data Flow

- **Komponen Utama:**
  - `PointBadge`: Indikator nilai yang selalu tampil dan memiliki animasi.
  - `QuizCard`: Menampilkan soal dengan pilihan jawaban yang merespons sentuhan/klik secara jelas (ukuran cukup besar untuk layar sentuh).
  - `RewardItem`: Kartu barang yang merespons *state* jumlah poin pengguna (aktif atau *disabled*).
- **Data Flow (Poin):**
  - Kuis menggunakan metode *Optimistic UI Update*. Saat jawaban benar dikirim, UI poin seketika bertambah (memulai animasi), selagi state di Firestore di-update di belakang layar, sehingga menghilangkan hambatan *loading* untuk anak-anak.
  - Menukar hadiah memvalidasi poin di *frontend* dan *backend*, lalu membuat transaksi (mengurangi poin dan mencatat pada `redeem_requests`).

## 4. Error Handling & Penanganan Khusus

- **Empty States:** Halaman yang datanya kosong tidak akan berwarna putih polos. Akan ada ilustrasi atau teks yang ramah anak.
- **Offline Persistence:** Firestore diatur untuk bisa menyimpan data secara temporer ketika perangkat kehilangan koneksi internet tiba-tiba, mencegah progres terhapus.
- **Pesan Kesalahan:** Semua *error* divisualisasikan dengan pesan yang membangun dan bukan sekadar angka *error code*.
