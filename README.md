# AI-Smart Ordering System
## College Canteen Pre-Ordering Platform

> **Project Better Tomorrow** — Eliminating physical canteen queues through AI-powered pre-ordering, smart pickup time prediction, digital tokens, and live order tracking.

**GitHub:** https://github.com/abishek-046/ai-smart-ordering-system  
**Institution:** Rathinam Technical Campus  
**Team:** Abishek

---

## Problem Statement

College students with 15-minute lunch breaks lose 12–20 minutes in canteen queues during peak hours. ~40% abandon the canteen without food. Students miss classes. Canteen staff waste ~15% of daily food stock because they cannot forecast demand.

The root cause: **the canteen operates as a walk-in, information-free system** with no pre-ordering, no availability checks, no preparation time estimates, and no plannable pickup time.

> *"I want to order before I leave class. Just like Swiggy."* — Student interview, 10 Sep 2026

---

## Solution

A full-stack web application that allows students to:
- Pre-order food before leaving the classroom
- Get an **AI-predicted pickup time** based on live kitchen load
- Receive a **digital token** for contactless pickup
- Track their order live (15-second polling)

And allows canteen staff to:
- See all orders in advance with pickup times
- Manage a **real-time kitchen queue** sorted by urgency
- Predict kitchen load for the next 3 hours

---

## Key Features

### Student Features
- Register / Login (JWT + bcrypt)
- Browse 32 authentic dishes with real food photos
- Search and filter by category
- Food availability checked in real-time
- Cart with quantity validation (1–20 per item)
- **AI Smart Pickup Time** — 12 scored slots from live database
- **AI Food Recommendations** — personalised from order history
- Checkout with server-side price calculation
- Digital order token (ORD-MMDD-XXXX)
- Live order tracking with progress steps
- Order history with status filter
- Order cancellation (pending only)
- Profile and password management

### Admin Features
- Dashboard with live KPIs
- View and manage all orders
- **Status workflow:** PENDING → ACCEPTED → PREPARING → READY → COLLECTED
- **Kitchen Queue** sorted by pickup time + urgency flags
- Full menu management (add / edit / delete / availability toggle)
- Analytics (orders by status, top items, hourly distribution)
- **AI Kitchen Load Predictions** — next 3-hour forecast

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Fonts | Playfair Display + Inter + DM Sans (Google Fonts) |
| Backend | Node.js + Express |
| Database | PostgreSQL 18 + Prisma ORM |
| Authentication | JWT + bcrypt (cost factor 12) |
| AI Engine | Algorithmic (modular — swap external ML via `.env`) |
| Testing | Custom E2E + API verification scripts |

---

## Architecture

```
Browser (React + Vite + Tailwind)
  └── Axios API service layer
      └── Express REST API (Node.js)
          ├── JWT + adminOnly middleware
          ├── Rate limiting (200/15min global; 15/15min auth)
          ├── 6 controllers (auth, menu, cart, order, ai, admin)
          └── Prisma ORM
              └── PostgreSQL 18
                  └── 5 models: users, food_items, cart_items, orders, order_items
```

---

## Installation

### Prerequisites
- Node.js ≥ 18
- PostgreSQL 18

### 1. Clone
```bash
git clone https://github.com/abishek-046/ai-smart-ordering-system.git
cd ai-smart-ordering-system
```

### 2. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment
```bash
cp .env.example backend/.env
```
Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/smart_ordering"
JWT_SECRET="change-this-to-a-long-random-string"
JWT_EXPIRES_IN="7d"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

### 4. Create database
```sql
-- In psql or pgAdmin:
CREATE DATABASE smart_ordering;
```

### 5. Run migrations
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Seed demo data
```bash
node src/utils/seed.js
```
Creates:
- Admin: `admin@canteen.com` / `admin123`
- Student: `student@test.com` / `student123`
- 32 authentic South Indian dishes with real food photos

### 7. Start servers

**Terminal 1 — Backend:**
```bash
cd backend
node src/index.js
# → http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

### 8. Open in browser
**http://localhost:5173**

---

## API Reference

Base URL: `http://localhost:5000/api`

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register student |
| POST | `/auth/login` | Public | Login (student or admin) |
| GET | `/auth/me` | JWT | Current user |
| PUT | `/auth/profile` | JWT | Update profile |
| PUT | `/auth/change-password` | JWT | Change password |

### Menu
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/menu` | Public | List all items (filter: category, search, available) |
| GET | `/menu/:id` | Public | Item details |
| POST | `/menu` | Admin | Create item |
| PUT | `/menu/:id` | Admin | Update item |
| DELETE | `/menu/:id` | Admin | Delete item |
| PATCH | `/menu/:id/availability` | Admin | Toggle availability |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | JWT | Get cart |
| POST | `/cart/add` | JWT | Add item (qty validated 1–20) |
| PUT | `/cart/update` | JWT | Update quantity |
| DELETE | `/cart/remove/:itemId` | JWT | Remove item |
| DELETE | `/cart/clear` | JWT | Clear cart |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | JWT | Create order (atomic transaction) |
| GET | `/orders` | JWT | Order history |
| GET | `/orders/:id` | JWT | Order details (owner only) |
| GET | `/orders/track/:token` | JWT | Track by token (owner only) |
| PATCH | `/orders/:id/cancel` | JWT | Cancel pending order |

### AI
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/ai/pickup-slots` | JWT | 12 scored pickup time slots |
| GET | `/ai/recommendations` | JWT | Personalised food picks |
| GET | `/ai/kitchen-predictions` | Admin | 3-hour load forecast |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | Admin | Live KPIs |
| GET | `/admin/orders` | Admin | All orders |
| PATCH | `/admin/orders/:id/status` | Admin | Update status |
| GET | `/admin/kitchen-queue` | Admin | Active orders by pickup time |
| GET | `/admin/analytics` | Admin | Order analytics |
| GET | `/admin/ai-predictions` | Admin | Kitchen load prediction |

---

## Order Status Workflow

```
PENDING → ACCEPTED → PREPARING → READY → COLLECTED
                  ↘ CANCELLED (from PENDING or ACCEPTED only)
```

---

## AI Engine

### Pickup Time Prediction
Reads live from database. Scores 12 candidate slots (15-min intervals):
```
score = 100 - (active_orders × 8) - (peak_penalty) + (wait_bonus)

peak_penalty = 15 if hour in [8, 9, 12, 13, 14]
wait_bonus   = max(0, 30 - minutes_until_slot)
base_prep    = max(item.prepTime) + ceil(totalQty × 1.5)
```
Top 3 by score marked as "Recommended". All 12 displayed with load indicators.

### Food Recommendations
Scores all available items using user's last 20 completed orders:
```
score = (rating × 10) + category_match + reorder_bonus(capped 30) + price_proximity + popularity
```
Falls back to top-rated items for new users with no order history.

### External AI Integration
Set `AI_API_KEY` + `AI_API_URL` in `.env` to route through any external ML API. The service checks these env vars first and falls back to the algorithmic engine on failure or if unset.

---

## Testing

```bash
# Run with backend server running on :5000

# API smoke tests (no DB required)
cd backend && node scripts/verify-api.js
# Expected: 20/20 PASS

# Full end-to-end with real database
cd backend && node scripts/e2e-test.js
# Expected: 20/20 PASS — full student + admin flow

# Frontend production build
cd frontend && npm run build
# Expected: 124 modules, 0 errors
```

---

## Security

| Control | Implementation |
|---------|---------------|
| Password storage | bcrypt, cost factor 12 |
| API authentication | JWT Bearer tokens, verified server-side every request |
| Admin routes | `protect + adminOnly` middleware — server-enforced |
| Ownership | All order/cart operations scoped to `req.user.id` |
| Price integrity | Total always calculated from DB — frontend sends no price |
| Input validation | All endpoints: length, range, enum, date validation |
| Rate limiting | 200/15min global; 15/15min on auth (skipSuccessful) |
| Duplicate order | 60-second PENDING window check |
| SQL injection | Prisma ORM throughout — no raw string interpolation |
| Secrets | `.env` gitignored; `.env.example` provided |

---

## Edge Cases Handled

- Empty cart checkout → 400
- Unavailable item at checkout → 400 with item names
- Negative/zero/excessive quantity → 400
- Past pickup time → 400
- Pickup time > 24h ahead → 400
- Duplicate rapid order → 409
- Token collision → retry + final uniqueness check
- Expired JWT → 401 "Token expired"
- Student accessing another student's order → 404
- Student hitting admin endpoint → 403
- Invalid status transition → 400 with allowed transitions
- Negative price on menu create → 400
- Invalid category enum → 400

---

## Design Thinking Documentation

All research and design thinking artefacts are in `/docs`:

```
docs/
├── design-thinking/
│   ├── empathy-portfolio.md     ← empathy map, pain points, insights
│   ├── interview-transcripts.md ← 5 full interview transcripts
│   ├── observation-log.md       ← 3 sessions, timestamped logs
│   ├── problem-definition.md    ← POV statement, official problem statement
│   └── user-journey-map.md      ← current + future state journey map
├── ai-audit/
│   ├── ai-interaction-audit.md  ← 9 interactions, 5 hallucinations documented
│   └── hallucination-corrections.md ← detailed fix log
├── validation/
│   ├── user-testing-plan.md     ← methodology, task sets
│   ├── user-test-1.md           ← Student Tester A (laptop)
│   ├── user-test-2.md           ← Student Tester B (Android mobile)
│   ├── user-test-3.md           ← Canteen Staff Tester (admin flow)
│   └── validation-summary.md    ← 5 issues found, 5 fixed
├── evidence/
│   ├── screenshots/             ← 20 application screenshots
│   └── demo/demo-script.md      ← 8-minute walkthrough script
└── review/
    └── milestone-review-report.md ← rubric mapping, final status
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (keep long and random) |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `PORT` | No | Backend port (default: `5000`) |
| `FRONTEND_URL` | No | CORS origin (default: `http://localhost:5173`) |
| `AI_API_KEY` | No | External AI API key (uses built-in engine if empty) |
| `AI_API_URL` | No | External AI API base URL |
| `NODE_ENV` | No | `development` or `production` |

---

## Project Limitations

The following features are intentionally deferred to future phases:
- Real payment gateway (requires production HTTPS + business registration)
- Push notifications (requires service worker + FCN)
- Advanced ML model training (needs historical data volume)
- QR code scanning (readable token achieves the same goal simply)
- Production deployment (requires domain + SSL + CI/CD)
- Multi-canteen support
- Student food ratings

---

*Built with React + Node.js + PostgreSQL + Prisma + Tailwind CSS*  
*AI engine: algorithmic with external API escape hatch*  
*Rathinam Technical Campus — September 2026*
