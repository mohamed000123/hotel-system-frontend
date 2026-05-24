# Hotel Booking — Frontend

Next.js web UI for the hotel booking management system: authentication, hotel catalog, room inventory, bookings, and role-based dashboards.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Data fetching | [TanStack React Query](https://tanstack.com/query) |
| Forms | React Hook Form + Zod |

## Prerequisites

- Node.js 20+
- npm (or pnpm)
- Backend API running locally (see [../backend/README.md](../backend/README.md))

## Quick start

```powershell
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Ensure `NEXT_PUBLIC_API_URL` in `.env` matches your backend base URL (including `/api` prefix). Example when the API listens on port 5000:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

Use **only** `frontend/.env` for configuration (no `.env.local` or `.env.example` variants in this project).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |


## Architecture conventions

- **Server Components by default** — pages and layouts are server components unless they need hooks, events, or browser APIs.
- **`'use client'` on the smallest leaf** — interactive pieces (forms, sidebars, React Query) live in dedicated client components.
- **HTTP only in `lib/api/`** — `apiRequest` in `lib/api/client.ts` handles credentials, JSON, and token refresh.
- **React Query in `lib/queries/`** — components call hooks such as `useHotels`, `useBookings`; pages do not call `fetch` directly.

## Routes (by role)

| Path | Roles | Purpose |
|------|-------|---------|
| `/login` | Public | Login and guest registration |
| `/admin/users` | Super Admin | Manage Admin accounts |
| `/staff/managers` | Super Admin, Admin | Manage Hotel Manager accounts |
| `/hotels` | Super Admin, Admin, Guest | Hotel catalog and search |
| `/hotels/[id]` | Super Admin, Admin, Guest | Hotel detail |
| `/rooms` | Hotel Manager | Room inventory for assigned hotel |
| `/bookings/new` | Guest | Create a booking |
| `/bookings/my` | Guest | Guest reservations and payment |
| `/bookings/reservations` | Hotel Manager | Hotel reservations |
| `/dashboard` | Super Admin, Admin, Hotel Manager | Operations metrics |
| `/account/change-password` | All (when required) | Forced password change flow |

After login, users are redirected by role via `lib/auth-routes.ts`.

## Demo accounts

After the backend seed runs, you can sign in with demo users (password from backend `SEED_DEMO_PASSWORD`, default `DemoPass123!`):

| Email | Role |
|-------|------|
| `admin@demo.local` | Admin |
| `manager@demo.local` | Hotel Manager (Grand Plaza) |
| `guest@demo.local` | Guest |

Super Admin credentials come from `SEED_SUPER_ADMIN_*` in `backend/.env`.

## Related documentation

- [Repository README](../README.md) — monorepo overview
- [Quickstart](../specs/001-hotel-booking-system/quickstart.md) — full local setup and smoke tests
- [OpenAPI contract](../specs/001-hotel-booking-system/contracts/openapi.yaml) — API reference
