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

## Panduan Deployment

Sistem ini telah dikonfigurasi agar **Frontend dan Backend dapat berjalan bersama-sama secara gratis di Vercel**.

### Arsitektur Hosting

1. **Database**: Supabase PostgreSQL (Sudah di-setup, gratis tanpa kartu kredit).
2. **Frontend & Backend (Monolith Serverless)**: Vercel.com

---

### Langkah-langkah Deploy ke Vercel

1. **Buat Akun Vercel**: Buka [Vercel.com](https://vercel.com) dan daftar menggunakan akun GitHub Anda.
2. **Import Project**:
   - Klik **Add New...** lalu pilih **Project**.
   - Import repository GitHub aplikasi MasjidKita ini.
3. **Konfigurasi Environment Variables**:
   - Sebelum klik tombol deploy, buka tab **Environment Variables**.
   - Tambahkan 3 variabel berikut:
     1. `DATABASE_URL` = `postgresql://postgres.probjxogsmzzdyuwzufb:MRBS_2046!!@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres`
     2. `JWT_SECRET` = _(Isi dengan password rahasia acak yang panjang, contoh: `kunci_rahasia_masjidkita_123`)_
     3. `VERCEL` = `1`
4. **Deploy**:
   - Klik tombol **Deploy**.
   - Tunggu proses _build_ selesai. Vercel akan membaca file `vercel.json` secara otomatis, mengubah API backend (Express) menjadi Serverless Functions, dan me-render frontend Vite.
5. **Update VITE_API_URL**:
   - Setelah deploy selesai, Vercel akan memberikan domain publik (contoh: `https://masjidkita-app.vercel.app`).
   - Pergi ke menu **Settings > Environment Variables** di dashboard project Vercel Anda.
   - Tambahkan variabel baru: `VITE_API_URL` dan isi dengan domain publik aplikasi Vercel Anda tersebut (contoh: `https://masjidkita-app.vercel.app`).
   - Pergi ke menu **Deployments**, klik titik tiga pada deployment terbaru, lalu pilih **Redeploy** agar frontend mendapatkan URL API yang benar.

**Selesai!**

---

## Cara Menjalankan Secara Lokal (Development)

Jika Anda ingin mengembangkan aplikasi ini di komputer Anda sendiri:

1. **Clone repository & Install Dependencies:**

   ```bash
   npm install
   ```

2. **Jalankan Backend (Express API):**

   ```bash
   npm run server
   ```

   _Server akan berjalan di http://localhost:3001_

3. **Buka Terminal Baru, Jalankan Frontend (Vite):**
   ```bash
   npm run dev
   ```
   _Aplikasi akan terbuka di http://localhost:5173_

---

## Akses Admin Default

Saat server pertama kali berjalan, sistem akan secara otomatis membuat akun Admin _default_ jika belum ada:

- **Email**: `admin@masjidkita.id`
- **Password**: `admin123`

_(Sangat disarankan untuk segera mengubah password ini setelah berhasil login di server production demi keamanan)_
