# Architecture Overview

MasjidKita is built as a Serverless Monolithic application. It utilizes modern web technologies to provide a fast, secure, and easily maintainable platform for mosque management and congregation services.

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **PWA**: Configured with Vite PWA Plugin for offline support and installability.
- **QR Scanner**: `html5-qrcode` library
- **QR Generator**: `qrcode` library

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL (hosted on Supabase)
- **Database Access**: `pg` (node-postgres)
- **Authentication**: JWT (JSON Web Tokens) with `bcrypt` for password hashing.
- **Architecture**: The Express server is designed to run locally via `node` for development, and wrapped as a Serverless Function on Vercel for production.

### Infrastructure & Deployment
- **Hosting**: Vercel
- **Database Hosting**: Supabase (PostgreSQL)

---

## Directory Structure

```text
MasjidKita/
├── docs/                   # System documentation
├── server/
│   └── index.mjs           # Express Backend application & Database Bootstrap
├── src/
│   ├── assets/             # Static assets (images, icons)
│   ├── components/         # Reusable React components (UI, Layouts)
│   ├── context/            # React Context (AuthContext)
│   ├── data/               # Static data (Al-Qur'an JSON, Doa lists)
│   ├── pages/              # React Page components
│   ├── services/           # External API & LocalStorage services (Infaq, Qibla)
│   ├── App.tsx             # Main React Router configuration
│   └── main.tsx            # React Entry point
├── vercel.json             # Vercel deployment and serverless route configuration
├── vite.config.ts          # Vite & PWA configuration
└── tailwind.config.js      # Tailwind CSS theme and design tokens
```

## Data Flow & Proxying

- **Development**: Vite's dev server (`http://localhost:5173`) proxies all requests starting with `/api` to the local Express backend (`http://localhost:3001`).
- **Production**: Vercel's edge network routes `/api/*` directly to the serverless function running `server/index.mjs`, while serving the compiled static assets from `/dist` for all other routes.
- This allows the frontend to always use relative paths (e.g., `fetch('/api/news')`) without needing environment variables for the API URL.
