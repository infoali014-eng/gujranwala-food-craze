# Gujranwala Food Craze: "Join the Craze"

## Deployment topology
- **Active Topology**: **Topology A (Single Vercel Project with Vercel Services)**
  The repository is configured as a single Vercel project with Vercel Services enabled in the root `vercel.json`. Vercel builds both the backend (`framework: express`, root `backend`) and the frontend (`framework: nextjs`, root `frontend`) in a single deployment. Public routing automatically directs `/api/(.*)` to the backend service and `/(.*)` to the frontend service on the same domain.
- **Alternative (Topology B - Two Independent Vercel Projects)**:
  If you choose to run separate projects instead of Services:
  1. Project 1 (Frontend): Set Vercel Root Directory to `frontend`. Framework: Next.js. Set `NEXT_PUBLIC_API_URL` to your backend project URL (e.g. `https://your-backend.vercel.app/api`).
  2. Project 2 (Backend): Set Vercel Root Directory to `backend`. Framework: Other/Node.js. Set `FRONTEND_ORIGIN` to your frontend URL.

## Vercel Environment Variables

| Variable Name | Required By | Environments | Description |
| :--- | :--- | :--- | :--- |
| `SUPABASE_URL` | Backend | Production, Preview, Development | Full https URL of your Supabase project (e.g. `https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Production, Preview, Development | Secret service role key (bypasses RLS for backend operations) |
| `FRONTEND_ORIGIN` | Backend | Production, Preview, Development | Allowed origin(s), e.g. `https://gujranwala-food-craze.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | Production, Preview, Development | Public Supabase URL for client auth (Config type in Vercel) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Production, Preview, Development | Public anon key for client auth (Config type in Vercel) |
| `NEXT_PUBLIC_API_URL` | Frontend | Production, Preview, Development | Backend API URL (Optional in Topology A since same-origin `/api` is used; Required in Topology B) |
| `NEXT_PUBLIC_WHATSAPP_LINK` | Frontend | Production, Preview, Development | WhatsApp invite link |
| `NEXT_PUBLIC_FOODPANDA_LINK` | Frontend | Production, Preview, Development | Foodpanda restaurant link |
| `REVIEW_RATE_LIMIT_PER_HOUR` | Backend | Production, Preview, Development | Optional rate limit for reviews per hour (Default: 3) |

> **Important**: Every variable prefixed with `NEXT_PUBLIC_` is inlined during `next build`. If you add or modify any `NEXT_PUBLIC_` variable in Vercel, you must trigger a **Redeploy without build cache** for the changes to take effect in the browser.

## Registering Admin User
To grant moderator access to an existing Supabase Auth user:
```sql
-- 1. Find user id
SELECT id, email FROM auth.users;

-- 2. Insert into admins table
INSERT INTO public.admins (user_id) 
VALUES ('<USER_ID_FROM_ABOVE>') 
ON CONFLICT (user_id) DO NOTHING;
```

> **Tagline:** The taste of Punjab  
> **Brand Colors:** Craze Red (`#C30D1A`), Craze Amber (`#FDBC5A`), Craze Cream (`#FDEFDA`), Crimson Dark (`#8F0A13`), Text Dark (`#2B0A0C`)  
> **Mission:** Fast, mobile-first scan-me landing site driving customers from delivery flyers and boxes to our VIP WhatsApp community, showcasing weekly deals, and collecting customer sticky-note reviews on the Craze Wall.

---

## Architecture and Monorepo Structure

```text
food-craze/
├─ frontend/                  # Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion
│  ├─ src/
│  │  ├─ app/
│  │  │  ├─ (site)/page.tsx            # Main Landing page  "/"
│  │  │  ├─ (site)/craze-wall/page.tsx # Customer Sticky Note Wall  "/craze-wall"
│  │  │  ├─ admin/login/page.tsx       # Admin Authentication
│  │  │  ├─ admin/reviews/page.tsx     # Review Moderation & Site Controls
│  │  │  └─ layout.tsx                 # Root layout with brand Google fonts & theme
│  │  ├─ components/
│  │  │  ├─ landing/                   # Hero, WhyJoin, DealBanner, MemberCounter, etc.
│  │  │  ├─ wall/                      # StickyNote, NoteBoard, ReviewForm, NoteColorPicker
│  │  │  ├─ admin/                     # AdminReviewList, DeleteButton
│  │  │  └─ ui/                        # Button, Card, FloatingWhatsApp, Confetti, Steam
│  │  ├─ lib/
│  │  │  ├─ api.ts                     # Central typed API client
│  │  │  ├─ tracking.ts                # ?src= source attribution & CTA click tracker
│  │  │  └─ copy.ts                    # English & Roman Urdu copy dictionary
│  │  └─ styles/
│  └─ .env.example
├─ backend/                   # Node.js + Express + TypeScript REST API (Vercel Serverless ready)
│  ├─ src/
│  │  ├─ server.ts / app.ts            # Local server & Express application
│  │  ├─ config/                       # Environment variables & Supabase service client
│  │  ├─ routes/                       # Express router definitions
│  │  ├─ controllers/                  # Route handlers & response formatting
│  │  ├─ queries/                      # Data access layer (ONLY files interacting with DB)
│  │  ├─ middleware/                   # Rate limiting, validation, auth, error handling
│  │  ├─ validators/                   # Zod schemas for request validation
│  │  └─ utils/                        # Profanity filter, HTML sanitization
│  ├─ supabase/
│  │  ├─ migrations/                   # SQL schemas and RLS policies
│  │  └─ README.md                     # Supabase setup guide
│  └─ .env.example
└─ README.md
```

### Extensibility & Future Roadmap
The repository is organized into distinct route groups (`(site)`, `admin`) and is structurally ready for future expansions:
- `(shop)` for `/menu` (catalog) and `/cart`
- `(account)` for customer profiles
- Extended `admin` panels

---

## Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 2. Install Dependencies
Run the install command across both applications:
```bash
# In the root repository directory:
npm run install:all
```
*(Alternatively, run `npm install` inside `frontend/` and `backend/` separately).*

### 3. Environment Variables

#### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

#### Frontend (`frontend/.env.local`)
Copy `frontend/.env.example` to `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WHATSAPP_LINK=https://chat.whatsapp.com/your-group-invite
NEXT_PUBLIC_FOODPANDA_LINK=https://www.foodpanda.pk
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Running the Development Servers

Open two terminals or run:
```bash
# Terminal 1: Start the Express API (runs on http://localhost:5000)
npm run dev:backend

# Terminal 2: Start the Next.js Frontend (runs on http://localhost:3000)
npm run dev:frontend
```

---

## Verification and Testing

### Health Check (Backend)
Test the Express API status:
```bash
curl http://localhost:5000/api/health
```
Response:
```json
{
  "data": {
    "status": "ok",
    "service": "gujranwala-food-craze-api",
    "timestamp": "..."
  },
  "error": null
}
```

### Frontend
Visit [http://localhost:3000](http://localhost:3000) in your browser. You will see the brand logo, Punjabi dhaba color theme, custom typography (Bebas Neue + Lora + Inter), and confirmation of Phase 0 setup.

---

## Admin Authentication and Role Configuration

To access `/admin/reviews` with Supabase Auth:
1. Create your user account in the **Supabase Dashboard** > **Authentication** > **Users** (e.g. `admin@foodcraze.pk`).
2. Copy the newly created `User UID`.
3. In the Supabase **SQL Editor**, run this query to grant admin privileges:

```sql
-- Add user to admins table:
INSERT INTO public.admins (user_id)
VALUES ('paste-your-user-uid-here')
ON CONFLICT (user_id) DO NOTHING;
```

Once added, log in at [http://localhost:3000/admin/login](http://localhost:3000/admin/login) with your Supabase credentials.

*(Note for local offline evaluation: A **One-Click Demo Admin Login** is available on `/admin/login` using the dev token `demo-admin-token`).*

---

## Vercel setup checklist

Deploy the frontend and backend as two decoupled projects from this monorepo:

### 1. Backend Project Deployment
- **Import repository**: In the Vercel dashboard, click **Add New** > **Project** and select this repository.
- **Root Directory**: Click Edit and set to `backend`.
- **Framework Preset**: Other (handled automatically by `backend/vercel.json` and `@vercel/node`).
- **Required Environment Variables**:
  - `SUPABASE_URL`: Your Supabase project URL (e.g. `https://xxxxxx.supabase.co`).
  - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role secret key.
  - `FRONTEND_ORIGIN`: Comma-separated list of allowed frontend production domains (e.g. `https://your-frontend.vercel.app,https://gujranwalafoodcraze.com`).
  - `ALLOW_VERCEL_PREVIEWS`: Set to `true` to allow Vercel preview deployment URLs.
  - `NODE_ENV`: Set to `production`.
- **Verify Backend Deployment**:
  Open `https://<your-backend-project>.vercel.app/api/health` in your browser.
  Expected response:
  ```json
  {
    "data": {
      "ok": true,
      "envConfigured": true,
      "status": "ok",
      "service": "gujranwala-food-craze-api",
      "timestamp": "..."
    },
    "error": null
  }
  ```

### 2. Frontend Project Deployment
- **Import repository**: Click **Add New** > **Project** and select the same repository.
- **Root Directory**: Click Edit and set to `frontend`.
- **Framework Preset**: Next.js (detected automatically).
- **Required Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: Your backend HTTPS URL without trailing slash (e.g. `https://<your-backend-project>.vercel.app/api`).
  - `NEXT_PUBLIC_WHATSAPP_LINK`: Your WhatsApp group invite link.
  - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (for admin authentication).
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon public key (for admin authentication).
- **Important Reminder**: Changing any `NEXT_PUBLIC_` environment variable requires a manual redeployment on Vercel because these values are baked into the static build at compile time.

### 3. Custom Domain Configuration (Optional)
- Add your custom domain in Vercel Project Settings > Domains for the frontend project (e.g. `gujranwalafoodcraze.com`).
- Add the API subdomain for the backend project (e.g. `api.gujranwalafoodcraze.com`).
- Update `FRONTEND_ORIGIN` on the backend to include `https://gujranwalafoodcraze.com`.

---

## Generating Campaign QR Codes

To track customer acquisition channels on flyer and packaging scans:
- **Flyer Print**: Generate a QR code pointing to `https://gujranwalafoodcraze.com/craze-wall?src=flyer`
- **Delivery Box Sticker**: Generate a QR code pointing to `https://gujranwalafoodcraze.com/craze-wall?src=qr`
- **Delivery Bag or Receipt**: Generate a QR code pointing to `https://gujranwalafoodcraze.com/craze-wall?src=packaging`

You can generate QR codes using any standard QR generator (like Canva, QRCode Monkey, or bitly) using high error correction (Level Q or H) so they remain easily scannable on curved boxes and paper bags.

---

## Final Verification Checklist (Run on a Real Phone)

- [ ] **Scan attribution**: Scan a QR code or visit `/craze-wall?src=qr`. Open browser DevTools or inspect clicks: `?src=qr` is captured in session storage.
- [ ] **Hero and Steam**: Verify the emblem logo displays cleanly without text underneath, with steam wisps rising out of the karahi.
- [ ] **Flame flicker and Night Mode**: Hover or tap the logo to see flame warmth flicker. Toggle "Night Dhaba Mode" to see evening lighting and star embers.
- [ ] **WhatsApp CTA and Confetti**: Tap "Join the WhatsApp Group for Exclusive Deals": verify festive confetti explodes and the WhatsApp invite URL opens.
- [ ] **Weekly Deal Countdown**: Verify timer is ticking down and the "Claim on WhatsApp" CTA works.
- [ ] **Foodpanda Button**: Verify the "Order on Foodpanda" button opens Foodpanda in a new tab.
- [ ] **Floating WhatsApp Button**: Verify the floating green button stays fixed at bottom-right on mobile with safe-area spacing, and hides while typing.
- [ ] **Craze Wall (`/craze-wall`)**:
  - [ ] Tap any sticky note to test straighten and lift animation (tap again to return).
  - [ ] Tap the **"Status"** button on a note: verify Web Share API opens or the note image downloads as a PNG for WhatsApp Status.
  - [ ] Submit a review: verify live character count, star selection, note color picker.
  - [ ] On submit: verify celebratory confetti and smooth scroll to the WhatsApp group invitation card.
- [ ] **Admin Portal (`/admin/login` & `/admin/reviews`)**:
  - [ ] Log in with Supabase Auth or One-Click Demo Mode.
  - [ ] Soft-delete a review and verify it disappears from public `/craze-wall`.
  - [ ] Restore the review and verify it returns to live status.
  - [ ] Edit weekly deal and member counter numbers and verify updates reflect on the landing page.
