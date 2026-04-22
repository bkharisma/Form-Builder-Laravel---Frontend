# Form Builder — Frontend

> **Single Page Application (SPA)** built with React, TypeScript, and Vite.  
> This is the **frontend only** — it requires a running backend API to function.

---

## What Is This?

A modern form builder frontend that provides:

- **Public form submission** — Users fill out forms at `/form/{slug}`
- **Admin dashboard** — Manage forms, view submissions, generate reports
- **Form Builder** — Drag-and-drop field editor with 13+ field types
- **Auto-fill** — Automatically populate fields from previous submissions
- **Attendance/Event Manager** — Event check-ins, invitations, QR codes
- **Dynamic Reports** — Chart-based analytics with Chart.js
- **Export** — CSV, Excel (XLSX), and PDF downloads
- **Responsive** — Works on mobile and desktop

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| **Node.js** | 18+ |
| **npm** | 9+ |
| **PHP** | 8.3+ (for backend) |
| **Composer** | 2.x (for backend) |
| **MySQL** | 5.7+ / MariaDB 10.3+ |

### 1. Backend Setup (Required First)

The frontend is a SPA — all data comes from the Laravel backend API. You **must** set it up first.

```bash
cd ../backend

# Install PHP dependencies
composer install

# Copy the environment file
cp .env.example .env

# Generate the application key
php artisan key:generate
```

Now edit `backend/.env` and configure your database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=form_builder
DB_USERNAME=your_user
DB_PASSWORD=your_password
```

Then run migrations and seeders (this creates the default admin user and a sample form):

```bash
php artisan migrate:fresh --seed
```

**Turnstile (bot protection)** is required for login and form submission. For development, use Cloudflare's test keys:

```env
# In backend/.env
TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

Start the backend server:

```bash
php artisan serve
# API available at http://localhost:8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy the environment file
cp .env.example .env
```

Edit `frontend/.env`:

```env
# API URL — for local dev, the Vite proxy handles this
# (requests to /api and /storage are proxied to http://localhost:8000)
VITE_API_URL=/api

# Cloudflare Turnstile site key (use test key for development)
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA

# App name shown in browser tab
VITE_APP_NAME="Form Builder"
```

Start the development server:

```bash
npm run dev
# Frontend available at http://localhost:5173
```

### 3. Open the App

Go to [http://localhost:5173](http://localhost:5173) and log in:

| Field | Value |
|-------|-------|
| **Email** | `admin@admin.com` |
| **Password** | `admin123` |

---

## How the Frontend Connects to the Backend

The Vite dev server proxies API requests so both frontend and backend run seamlessly in development:

```
Browser → http://localhost:5173/api/... → Vite proxy → http://localhost:8000/api/...
Browser → http://localhost:5173/storage/... → Vite proxy → http://localhost:8000/storage/...
```

This is configured in `vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': { target: 'http://localhost:8000', changeOrigin: true },
    '/storage': { target: 'http://localhost:8000', changeOrigin: true },
  },
}
```

For **production**, you must set `VITE_API_URL` to the full backend URL, rebuild, and serve the `dist/` folder:

```env
VITE_API_URL=https://your-api-domain.com/api
```

```bash
npm run build    # Output goes to dist/
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR at [localhost:5173](http://localhost:5173) |
| `npm run build` | Type-check and build for production (`dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (CI-friendly) |

---

## Project Structure

```
frontend/
├── public/                  # Static assets (favicon, etc.)
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page-level components
│   │   ├── LandingPage.tsx  # Public landing page
│   │   ├── LoginPage.tsx    # Admin login
│   │   ├── DashboardPage.tsx
│   │   ├── SubmissionPage.tsx  # Public form submission
│   │   ├── SettingsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── AdminUsersPage.tsx
│   │   ├── FormDashboardPage.tsx
│   │   └── form/            # Form-related pages
│   │       ├── FormBuilderPage.tsx
│   │       ├── FormSubmissionsPage.tsx
│   │       ├── FormReportsPage.tsx
│   │       ├── FormTitlePage.tsx
│   │       └── FormDashboardListPage.tsx
│   ├── services/            # API service layer (axios)
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── config/              # App configuration
│   ├── layouts/             # Layout components
│   ├── assets/              # Images, fonts, etc.
│   ├── test/                # Test setup and utilities
│   ├── App.tsx              # Root component with routing
│   ├── App.css              # Global styles
│   ├── index.css            # TailwindCSS imports
│   └── main.tsx             # Entry point
├── .env                     # Environment variables
├── .env.example             # Environment template
├── index.html               # HTML entry point
├── vite.config.ts           # Vite + Vitest configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.js         # ESLint configuration
└── package.json             # Dependencies and scripts
```

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool and dev server |
| **TailwindCSS 4** | Utility-first CSS |
| **react-router-dom** | Client-side routing (SPA) |
| **axios** | HTTP client for API calls |
| **@dnd-kit** | Drag-and-drop for Form Builder |
| **@tiptap** | Rich text editor |
| **Chart.js + react-chartjs-2** | Dynamic report charts |
| **jsPDF + jspdf-autotable + html2canvas** | PDF export |
| **react-signature-canvas** | Signature capture field |
| **Vitest + Testing Library** | Unit and integration tests |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `/api` (uses Vite proxy in dev) |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key | Test key for dev |
| `VITE_APP_NAME` | App display name in browser | `"Kopega Poltekpar Palembang APP"` |

---

## Troubleshooting

### Login fails with "cf_turnstile_response is required"

Turnstile is required on the login page. Ensure both `.env` files have matching keys:

- `backend/.env` → `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`
- `frontend/.env` → `VITE_TURNSTILE_SITE_KEY`

For development, use [Cloudflare's test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/).

### CORS errors

Make sure `FRONTEND_URL` in `backend/.env` matches your frontend URL:

```env
FRONTEND_URL=http://localhost:5173
```

### npm install fails

Ensure Node.js 18+ is installed:

```bash
node -v   # Should be v18 or higher
npm -v    # Should be v9 or higher
```

### API returns 404

The backend server must be running at `http://localhost:8000`. Start it with:

```bash
cd ../backend && php artisan serve
```

---

## More Documentation

- **[../README.md](../README.md)** — Full project overview, architecture, and API reference
- **[../QUICK-START.md](../QUICK-START.md)** — Detailed setup guide for both frontend and backend
- **[../MIGRATION-GUIDE.md](../MIGRATION-GUIDE.md)** — Migration from legacy static fields

---

**Built with React 19 · TypeScript · Vite · TailwindCSS**
