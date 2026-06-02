# MasjidKita

MasjidKita adalah aplikasi web modern berbasis PWA (Progressive Web App) yang dirancang untuk membantu pengelolaan masjid dan melayani jamaah. Dilengkapi dengan fitur waktu sholat, pembaca Al-Qur'an, arah kiblat, manajemen berita, serta sistem infaq digital terintegrasi yang aman.

## Fitur Utama

- **Al-Qur'an Digital**: Baca Al-Qur'an lengkap dengan audio, terjemahan, dan tajwid.
- **Waktu Sholat**: Jadwal sholat akurat berdasarkan lokasi.
- **Arah Kiblat**: Kompas penunjuk arah kiblat terintegrasi.
- **Digital Infaq**: Sistem donasi online yang aman (mendukung Anonim) dengan riwayat transaksi.
- **Berita & Pengumuman**: Informasi kegiatan masjid terbaru.
- **Admin Dashboard**: Panel manajemen untuk melihat riwayat donasi keseluruhan dan mengelola berita.
- **Sistem Akun**: Registrasi, Login, dan rekam jejak infaq per individu (JWT Auth).

---

## Panduan Deployment (Hosting Gratis)

Aplikasi ini menggunakan arsitektur _Decoupled_ (Frontend dan Backend terpisah) serta _Database-as-a-Service_. Berikut adalah panduan untuk meng-host aplikasi ini di internet menggunakan layanan gratis (Vercel, Render, dan Supabase).

### Arsitektur Hosting

1. **Database**: Supabase PostgreSQL (Sudah di-setup)
2. **Backend API (Node.js/Express)**: Render.com (Web Service Gratis)
3. **Frontend (React/Vite)**: Vercel (Gratis)

---

### Tahap 1: Setup Backend di Render.com

Backend bertanggung jawab untuk mengelola koneksi database, autentikasi (JWT), dan keamanan API.

1. Buat akun di [Render.com](https://render.com) (bisa menggunakan akun GitHub).
2. Klik **New +** dan pilih **Web Service**.
3. Hubungkan dengan repository GitHub Anda yang berisi kode aplikasi ini.
4. Pada menu konfigurasi, isi sebagai berikut:
   - **Name**: `masjidkita-api` (atau sesuka Anda)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
   - **Instance Type**: Pilih `Free`
5. Scroll ke bawah dan buka **Advanced** -> **Environment Variables**. Masukkan variabel berikut:
   - `PORT` = `3001`
   - `DATABASE_URL` = `postgresql://postgres.probjxogsmzzdyuwzufb:MRBS_2046!!@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres`
   - `JWT_SECRET` = _(Isi dengan teks acak yang sangat panjang, misalnya dari password generator)_
6. Klik **Create Web Service**.
7. Tunggu beberapa menit hingga status menjadi `Live`. Salin URL yang diberikan Render (contoh: `https://masjidkita-api.onrender.com`).

---

### Tahap 2: Setup Frontend di Vercel

Frontend adalah antarmuka React yang akan diakses oleh pengguna.

1. Buka file `server/index.mjs` di dalam kode sumber Anda.
2. Pastikan domain Vercel Anda nanti (atau allow semua untuk sementara `*`) dimasukkan ke dalam `ALLOWED_ORIGINS` di konfigurasi CORS backend.
3. Buat akun di [Vercel](https://vercel.com) menggunakan GitHub.
4. Klik **Add New...** -> **Project**.
5. Import repository GitHub aplikasi ini.
6. Pada menu konfigurasi Vercel:
   - **Framework Preset**: Vercel biasanya otomatis mendeteksi `Vite`.
   - Buka bagian **Environment Variables** dan tambahkan:
     - `VITE_API_URL` = _(URL Backend dari Render di Tahap 1, contoh: `https://masjidkita-api.onrender.com`)_
7. Klik **Deploy**.
8. Setelah selesai, Vercel akan memberikan URL publik untuk aplikasi Anda (contoh: `https://masjidkita.vercel.app`).

---

### Tahap 3: Update CORS Backend (Penting)

Agar frontend (Vercel) bisa berkomunikasi dengan backend (Render), Anda harus mendaftarkan URL Vercel ke backend.

1. Buka kembali dashboard Render.com.
2. Buka project backend Anda.
3. Namun, karena daftar `ALLOWED_ORIGINS` saat ini tertulis ("hardcoded") di `server/index.mjs` (yaitu `http://localhost:5173`), Anda harus mengubahnya di dalam kode Anda sebelum _push_ ke GitHub:

   _Ubah baris ini di `server/index.mjs`:_

   ```javascript
   const ALLOWED_ORIGINS = [
     "http://localhost:5173",
     "https://masjidkita.vercel.app", // Tambahkan URL Vercel Anda
   ];
   ```

4. Lakukan `git commit` dan `git push`. Render akan secara otomatis me-rebuild backend Anda dengan aturan CORS yang baru.

---

## 🛠️ Cara Menjalankan Secara Lokal (Development)

Jika Anda ingin mengembangkan aplikasi ini di komputer Anda sendiri:

1. **Clone repository & Install Dependencies:**

   ```bash
   npm install
   ```

2. **Jalankan Database Migration (Hanya saat pertama kali):**

   ```bash
   npm run migrate
   ```

3. **Jalankan Backend (Express API):**

   ```bash
   npm run server
   ```

   _Server akan berjalan di http://localhost:3001_

4. **Buka Terminal Baru, Jalankan Frontend (Vite):**
   ```bash
   npm run dev
   ```
   _Aplikasi akan terbuka di http://localhost:5173_

---

## Akses Admin Default

Saat server pertama kali dijalankan (baik lokal maupun di production), sistem akan secara otomatis membuat akun Admin _default_:

- **Email**: `admin@masjidkita.id`
- **Password**: `admin123`

_(Sangat disarankan untuk mengubah password ini setelah deploy ke production melalui koneksi database secara manual)_
