# MasjidKita

MasjidKita is a modern web application based on PWA (Progressive Web App) designed to assist in mosque management and serve the congregation. It is equipped with prayer times, a Quran reader, qibla direction, news management, a secure digital infaq system, and an event-based e-coupon system.

## Key Features

- **Digital Quran**: Read the full Quran with translations, and tajweed rules.
- **Prayer Times**: Accurate prayer schedules based on Sleman time.
- **Qibla Direction**: Integrated compass pointing to the Qibla.
- **Digital Infaq**: Simulated online donation system (supports anonymous donations) with transaction history and unique device tracking.
- **News & Announcements**: Latest information on mosque activities.
- **E-Kupon (Food Coupons)**: A smart, single-QR coupon distribution system. Admins print a single Event QR code. Congregants scan this master QR code to automatically claim an available digital coupon to their device. Double-claiming is prevented via device ID tracking.
- **Admin Dashboard**: Management panel to view overall donation history, manage news, and create e-coupon events.
- **Account System**: JWT Authentication for the admin dashboard.

---

## Deployment Guide

This system is configured so that both the Frontend and Backend can run together for free on Vercel as a serverless monolith.

### Hosting Architecture

1. **Database**: Supabase PostgreSQL (Pre-configured, free tier).
2. **Frontend & Backend**: Vercel

---

### Steps to Deploy to Vercel

1. **Create a Vercel Account**: Go to Vercel.com and sign up using your GitHub account.
2. **Import Project**:
   - Click "Add New..." and select "Project".
   - Import this MasjidKita GitHub repository.
3. **Configure Environment Variables**:
   - Before clicking deploy, open the "Environment Variables" tab.
   - Add the following variables:
     1. `DATABASE_URL` = Your Database URL
     2. `JWT_SECRET` = (Enter a long, random secret key for admin sessions, e.g., `kunci_rahasia_masjidkita_123`)
     3. `VERCEL` = `1`
4. **Deploy**:
   - Click the "Deploy" button.
   - Wait for the build process to finish. Vercel will automatically read the `vercel.json` file, convert the Express backend into Serverless Functions, and build the Vite frontend.
   - The application will automatically route `/api/*` requests to the backend serverless functions.

---

## How to Run Locally (Development)

If you wish to develop this application locally on your machine:

1. **Clone repository and Install Dependencies:**

   ```bash
   npm install
   ```

2. **Run the Backend (Express API):**

   ```bash
   npm run server
   ```

   The server will run on http://localhost:3001

3. **Open a New Terminal, Run the Frontend (Vite):**

   ```bash
   npm run dev
   ```

   The application will open at http://localhost:5173. The Vite development server is configured to proxy all `/api` requests to the local backend automatically.

---

## Default Admin Access

When the server runs for the first time, the system will automatically create a default Admin account if one does not exist:

- **Email**: `admin@masjidkita.id`
- **Password**: `admin123`

(It is highly recommended to change this password immediately after successfully logging into the production server for security purposes)
