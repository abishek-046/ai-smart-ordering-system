# AI-Smart Ordering System

> **Project Better Tomorrow** — Reducing physical queues at college canteens through AI-powered pre-ordering, smart pickup time prediction, and real-time order tracking.

**GitHub:** https://github.com/abishek-046/ai-smart-ordering-system  
**Team Member:** Abishek  
**Milestone:** 75% Review Complete

---

## The Problem

College canteen students with tight class schedules lose **10–20 minutes daily** in unpredictable queues. Items sell out with no warning. There is no way to know wait times before arriving. Students regularly skip meals or arrive late to class. Canteen staff waste ~15% of daily food stock because they cannot forecast demand.

→ Full research evidence: [`docs/1-empathy-portfolio.md`](docs/1-empathy-portfolio.md)  
→ Precise problem statement: [`docs/2-problem-statement.md`](docs/2-problem-statement.md)

---

## The Solution

A full-stack web application that lets students **pre-order food**, get an **AI-recommended pickup time**, receive a **digital token**, and **track their order live**. Admins manage the kitchen through a real-time queue dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL 18 + Prisma ORM |
| Authentication | JWT + bcrypt |
| AI Engine | Algorithmic (modular — swap in external ML API via env vars) |

---

## Documentation (Design Thinking Evidence)

All design thinking artefacts are in the [`docs/`](docs/) folder:

| # | Document | Contents |
|---|----------|----------|
| 1 | [`docs/1-empathy-portfolio.md`](docs/1-empathy-portfolio.md) | 3 observation sessions · 5 interview transcripts · Empathy map · 8-stage Customer Journey Map |
| 2 | [`docs/2-problem-statement.md`](docs/2-problem-statement.md) | POV statement · Precise problem statement · 8 HMW questions · Problem → Solution mapping |
| 3 | [`docs/3-ai-interaction-audit.md`](docs/3-ai-interaction-audit.md) | 8 AI interactions · What was adopted/rejected with reasons · 5 hallucinations caught and corrected |
| 4 | [`docs/4-user-testing.md`](docs/4-user-testing.md) | 3 real testers · 22 tasks · 91% success rate · 5 UX issues found and fixed |
| 5 | [`docs/5-progress-report.md`](docs/5-progress-report.md) | Full rubric mapping · Architecture diagram · 20/20 e2e test results · Deferred features |

---

## Project Structure

```
ai-smart-ordering-system/
├── docs/                          ← Design Thinking documentation
│   ├── 1-empathy-portfolio.md
│   ├── 2-problem-statement.md
│   ├── 3-ai-interaction-audit.md
│   ├── 4-user-testing.md
│   ├── 5-progress-report.md
│   └── screenshots/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          ← Database schema (5 models)
│   │   └── migrations/            ← Version-controlled DB migrations
│   ├── src/
│   │   ├── controllers/           ← auth, menu, cart, order, ai, admin
│   │   ├── routes/                ← Express routers (6 files)
│   │   ├── middleware/            ← JWT auth + error handler
│   │   ├── services/ai.service.js ← AI pickup prediction + recommendations
│   │   └── utils/                 ← Token generator, Prisma client, seed
│   └── scripts/                   ← e2e-test.js, verify-api.js
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── auth/              ← Landing, Login, Register
│       │   ├── student/           ← 11 student pages
│       │   └── admin/             ← 6 admin pages
│       ├── components/            ← Layout + reusable UI components
│       ├── context/               ← AuthContext, CartContext
│       ├── hooks/                 ← useOrderPolling, useLocalStorage
│       └── services/api.js        ← Centralised Axios API layer
├── .env.example                   ← Environment variable template
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14

### 1. Clone the repository
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
# Copy the template
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

### 4. Create the database
```sql
-- In psql or pgAdmin
CREATE DATABASE smart_ordering;
```

### 5. Run migrations
```bash
cd backend
npx prisma migrate dev --name init
```

### 6. Seed sample data
```bash
node src/utils/seed.js
```
This creates:
- **Admin account:** `admin@canteen.com` / `admin123`
- **Student account:** `student@test.com` / `student123`
- **27 menu items** across 6 categories

### 7. Start the servers

**Terminal 1 — Backend:**
```bash
cd backend
node src/index.js
# → Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → App running on http://localhost:5173
```

### 8. Open in browser
**http://localhost:5173**

---

## API Documentation

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register student | Public |
| POST | `/auth/login` | Login | Public |
| GET | `/auth/me` | Current user | JWT |
| PUT | `/auth/profile` | Update profile | JWT |
| PUT | `/auth/change-password` | Change password | JWT |

### Menu
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/menu` | List all items (filter by category/search) | Public |
| GET | `/menu/:id` | Item details | Public |
| POST | `/menu` | Create item | Admin |
| PUT | `/menu/:id` | Update item | Admin |
| DELETE | `/menu/:id` | Delete item | Admin |
| PATCH | `/menu/:id/availability` | Toggle availability | Admin |

### Cart
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/cart` | Get cart | JWT |
| POST | `/cart/add` | Add item | JWT |
| PUT | `/cart/update` | Update quantity | JWT |
| DELETE | `/cart/remove/:itemId` | Remove item | JWT |
| DELETE | `/cart/clear` | Clear cart | JWT |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/orders` | Create order | JWT |
| GET | `/orders` | Order history | JWT |
| GET | `/orders/:id` | Order details | JWT |
| GET | `/orders/track/:token` | Track by token | JWT |
| PATCH | `/orders/:id/cancel` | Cancel order | JWT |

### AI
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/ai/pickup-slots` | AI pickup time recommendations | JWT |
| GET | `/ai/recommendations` | Food recommendations | JWT |
| GET | `/ai/kitchen-predictions` | Kitchen load forecast | Admin |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/dashboard` | Summary stats | Admin |
| GET | `/admin/orders` | All orders | Admin |
| PATCH | `/admin/orders/:id/status` | Update order status | Admin |
| GET | `/admin/kitchen-queue` | Active kitchen queue | Admin |
| GET | `/admin/analytics` | Order analytics | Admin |
| GET | `/admin/ai-predictions` | Kitchen load prediction | Admin |

---

## Order Status Workflow

```
PENDING → ACCEPTED → PREPARING → READY → COLLECTED
                                        ↘ CANCELLED (from PENDING only)
```

---

## AI Engine

### Pickup Time Prediction
Scores 12 time slots (15-min intervals) using:
- **Load penalty** — active orders in that slot × 8 points
- **Peak penalty** — 15 points during observed peak hours (8–9 AM, 12–2 PM)
- **Wait bonus** — rewards earlier available slots
- **Base prep time** — max item prep time + quantity overhead

Returns top 3 as "Recommended", all 12 displayed with load indicators.

### Food Recommendations
Scores available items using user's order history:
- Category preference (frequency-weighted)
- Reorder bonus (capped to encourage variety)
- Price range fit (within 30% of user's average spend)
- Item rating × review count (social proof)
- New user fallback: top-rated items sorted by rating

### External API Integration
Set `AI_API_KEY` and `AI_API_URL` in `.env` to route through an external ML API. The service layer checks these values first and falls back to the algorithmic engine if not set — no other code changes required.

---

## 75% Milestone Coverage

### Technical Features
- [x] Student registration & login (JWT + bcrypt)
- [x] PostgreSQL database with Prisma ORM
- [x] 27-item menu with categories and availability
- [x] Cart add/remove/update with real-time sync
- [x] Real order creation with atomic transaction
- [x] Unique digital token per order (ORD-MMDD-XXXX)
- [x] AI pickup time slot recommendation
- [x] AI food recommendations from order history
- [x] Live order tracking (15-second polling, auto-stops at terminal state)
- [x] Order status workflow with timestamps
- [x] Admin order management with status transitions
- [x] Kitchen queue sorted by urgency
- [x] Menu management (CRUD + availability toggle)
- [x] Analytics dashboard (7/30-day periods)
- [x] AI kitchen load prediction

### Design Thinking Evidence
- [x] Empathy portfolio (observations + interviews + journey map)
- [x] Precise problem statement derived from research data
- [x] AI Interaction Audit (8 interactions, 5 hallucinations documented)
- [x] User testing with 3 real users (91% task success rate)
- [x] All 5 UX issues found in testing fixed and committed
- [x] Progress report mapping to milestone rubric

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for JWT signing |
| `JWT_EXPIRES_IN` | No | Token expiry — default `7d` |
| `PORT` | No | Backend port — default `5000` |
| `FRONTEND_URL` | No | CORS origin — default `http://localhost:5173` |
| `AI_API_KEY` | No | External AI API key (uses built-in engine if blank) |
| `AI_API_URL` | No | External AI API base URL |

---

## Verification Scripts

```bash
# Check all API routes and middleware (no DB required)
cd backend
node scripts/verify-api.js   # 20/20 tests

# Full end-to-end flow test (requires running server + DB)
node scripts/e2e-test.js     # 20/20 steps
```

---

*Built with React + Node.js + PostgreSQL + Prisma + Tailwind CSS*  
*AI engine: algorithmic with external API escape hatch*
