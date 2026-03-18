# OwlDiary

OwlDiary is a full-stack campus diary and community platform where students can create rich posts, manage profile galleries, comment on each other's writing, and interact through likes, notifications, and admin-moderated registration.

## Live Links

- Live App: `https://owldiary.onrender.com`
- Backend Base URL: `https://owldiary.onrender.com`
- Repository: `https://github.com/kkotey14/OwlDiary`

## Features

- Account signup with registration-code validation
- Admin approval flow for new users
- Rich-text post creation and editing
- Post likes and comment threads
- Profile customization with themes, fonts, accent colors, and background images
- Profile gallery uploads with reorder and edit support
- Notifications for community activity
- Daily/admin-managed quotes
- Registration code generation for controlled onboarding

## Tech Stack

- Frontend: React, Vite, React Router, styled-components
- Backend: Express 5, Node.js
- Database: PostgreSQL
- Auth: JWT, bcrypt
- Uploads: Multer
- Deployment: Vercel frontend routing, Render web service, Render Postgres

## Project Structure

```text
.
├── src/              # React frontend
├── server/           # Express API, uploads, seeding
├── Database/         # SQL schema
├── public/           # Static assets
├── vercel.json       # Vercel rewrite config
└── package.json      # Scripts and dependencies
```

## Local Development

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL database

### Installation

```bash
git clone https://github.com/kkotey14/OwlDiary.git
cd OwlDiary
npm install
```

### Environment Variables

Create a local `.env` file with:

```env
DATABASE_URL=postgresql://username:password@host:5432/database_name
JWT_SECRET=replace-with-a-long-random-secret
PORT=5050
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=change-me
ADMIN_NAME=Your Name
UPLOAD_DIR=server/uploads
```

### Run Locally

```bash
npm run dev
```

This starts:

- Vite frontend on `http://localhost:5173`
- Express backend on `http://localhost:5050`

### Production Build Locally

```bash
npm run build
npm start
```

## Seed Demo Data

The project includes a seed script that can populate the database with:

- an admin profile
- four demo users
- posts
- comments
- likes
- gallery items
- social links
- a registration code

Run:

```bash
npm run seed
```

If you want the seeded admin to match your real deployed admin identity, set:

- `ADMIN_EMAIL`
- `ADMIN_NAME`
- `ADMIN_PASSWORD`

before running the seed.

## Deployment

### Current Deployment

- Frontend requests are routed through Vercel rewrites
- Backend is hosted on Render at `https://owldiary.onrender.com`
- Database is hosted on Render Postgres

### Render Environment Variables

```env
DATABASE_URL=your-render-postgres-url
JWT_SECRET=your-production-secret
NODE_ENV=production
UPLOAD_DIR=/var/data/uploads
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-admin-password
ADMIN_NAME=your-admin-name
```

If persistent disk storage is not mounted on Render, the app falls back to `server/uploads` so the service can still boot.

### Vercel Routing

[`vercel.json`](/Users/kingsleykotey/OwlDiary/vercel.json) proxies:

- `/api/*` to Render
- `/uploads/*` to Render
- all other routes to the SPA frontend

## Available Scripts

- `npm run dev` - run frontend and backend in development
- `npm run dev:host` - run dev server on host network
- `npm run client` - run Vite only
- `npm run server` - run Express only
- `npm run build` - build the frontend
- `npm start` - run the production server
- `npm run prod` - build and run production locally
- `npm run lint` - run ESLint
- `npm run preview` - preview the Vite build
- `npm run seed` - seed the database

## Admin Notes

- The first admin can be created or promoted automatically on startup using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- New users require a registration code and remain pending until approved by an admin.
- The seed script creates the demo registration code `OWL26`.

## Known Notes

- Uploaded files are only persistent on Render if a disk is mounted and `UPLOAD_DIR` points to that mounted path.
- The frontend bundle is currently large and could be improved with code-splitting.

## License

Distributed under the MIT License. See `LICENSE` for more information.
