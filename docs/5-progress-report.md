# Progress Report — Final Milestone (100%)
## AI-Smart Ordering System — College Canteen

**Project:** AI-Smart Ordering System — Project Better Tomorrow  
**Objective:** Eliminate physical canteen queues through AI-powered pre-ordering  
**Team Member:** Abishek  
**GitHub:** https://github.com/abishek-046/ai-smart-ordering-system  
**Live App:** http://localhost:5173 (run setup instructions in README)  
**Date:** 30 September 2026  
**Milestone:** Final Review — 100% Complete

---

## 1. Executive Summary

The AI-Smart Ordering System is a fully working, production-quality web application that directly addresses the college canteen queue problem identified through genuine field research. Students with tight class schedules can pre-order food, receive an AI-predicted pickup time, collect a digital token, and track their order live — eliminating the 10–20 minute queue wait that was causing missed classes and skipped meals.

**All five rubric dimensions are fully satisfied.** This report documents the complete, verified implementation.

---

## 2. Problem Understanding (Rubric Dimension 1)

**Requirement:** Evidence that the problem is real, observed, and grounded in user data.

| Activity | Evidence | Document |
|----------|----------|----------|
| 3 canteen observation sessions (135 min total) | Timestamped logs with specific incidents, measurements, quotes | `docs/1-empathy-portfolio.md` §2 |
| 5 structured interviews (3 students, 2 staff) | Full verbatim transcripts | `docs/1-empathy-portfolio.md` §3 |
| 4-quadrant empathy map | Says / Thinks / Does / Feels | `docs/1-empathy-portfolio.md` §4 |
| 8-stage customer journey map | Emotional curve, opportunity zones | `docs/1-empathy-portfolio.md` §5 |
| Affinity grouping into 3 themes | Themes A/B/C from 10 pain points | `docs/2-problem-statement.md` §1 |
| POV statement (User × Need × Insight) | Single-sentence format | `docs/2-problem-statement.md` §2 |
| Single precise problem statement | Full paragraph | `docs/2-problem-statement.md` §3 |
| 8 HMW questions derived from research | Each maps to a built feature | `docs/2-problem-statement.md` §5 |
| 3-check validation | Matches data, avoids solution-jumping, specific enough to build | `docs/2-problem-statement.md` §7 |

### Key Quantified Findings
| Metric | Value | Source |
|--------|-------|--------|
| Average peak hour wait | 12–18 minutes | Observation Sessions 1 & 2 |
| Students leaving without food | ~40% of walk-ins | Observation Session 1 |
| Daily food waste (canteen) | ~15% of stock | Manager Interview |
| Students who would use pre-ordering | 5/5 (100%) | All interviews |
| Classes entered late due to canteen | Min. 3 in 45 min observed | Observation Session 1 |

**Status: ✅ Complete**

---

## 3. Dataset / Research (Rubric Dimension 2)

**Requirement:** Real data from the environment, not invented or generic.

### Primary Research
| Data Type | Volume | Collection Method |
|-----------|--------|------------------|
| Observation sessions | 3 sessions, 135 min total | Direct observation, timestamped |
| Student interviews | 3, ~30 min total | Structured, verbatim quotes |
| Staff interviews | 2 (~17 min total) | Tamil → English translation |
| Measured wait times | 8 instances | Stopwatch during observation |
| Food sellout events | 3 directly observed | Observation logs |
| Student walkaways counted | ~12 | Observation Session 1 |

### Application Database (Seeded from Research)
- **32 authentic South Indian canteen dishes** — names, prices, prep times based on actual canteen observation
- **Preparation times** from real kitchen observation (Dosa: 8 min, Biryani: 15 min, Beverages: 2–3 min)
- **Peak hour flags** in AI algorithm: 8–9 AM and 12–2 PM (from Observation Sessions 1 & 2)
- **Pricing**: ₹15–₹140 range matching actual college canteen price bands

### Data Flowing Through AI Algorithms
The pickup slot algorithm reads live from PostgreSQL:
- `orders` table — active orders per 15-min window (real-time load)
- `food_items` table — preparation times per dish
- Peak hour penalties encoded from observation data

The recommendation algorithm reads:
- `orders` + `order_items` — last 20 orders per user
- Category frequency, reorder counts, price range, item ratings

**Status: ✅ Complete**

---

## 4. Architecture (Rubric Dimension 3)

**Requirement:** Clean, layered, documented architecture with justified technology choices.

```
┌──────────────────────────────────────────────────────────────────┐
│                       BROWSER (Client)                            │
│  React 18 + Vite + Tailwind CSS  — Playfair Display / Inter fonts │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ Auth Pages  │  │Student Pages │  │ Admin Pages              │ │
│  │ Landing     │  │ Dashboard    │  │ Dashboard + Stats        │ │
│  │ Login       │  │ Menu (32 🍽) │  │ Orders + Status Update   │ │
│  │ Register    │  │ Cart         │  │ Kitchen Queue (live)     │ │
│  │             │  │ Pickup Time  │  │ Menu CRUD                │ │
│  │             │  │ Checkout     │  │ Analytics                │ │
│  │             │  │ Token+Track  │  │ AI Kitchen Predictions   │ │
│  │             │  │ AI Recs      │  └──────────────────────────┘ │
│  └─────────────┘  └──────────────┘                               │
│  Axios service layer (api.js) — JWT interceptor + 401 redirect    │
│  AuthContext (JWT state) · CartContext (live sync)                │
│  Custom hooks: useOrderPolling (15s poll + auto-stop at terminal) │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTP/REST JSON  (Vite proxy /api → :5000)
┌────────────────────────▼─────────────────────────────────────────┐
│                    SERVER (Node.js + Express)                      │
│  Rate limiting: 200/15min global · 15/15min on /auth (brute-force│
│  protection, skipSuccessfulRequests)                              │
│  ┌──────────┐  ┌────────────────┐  ┌────────────────────────┐   │
│  │ Routes   │  │  Middleware    │  │    Controllers          │   │
│  │ /auth    │→ │ protect (JWT)  │→ │ auth — register/login   │   │
│  │ /menu    │  │ adminOnly      │  │ menu — CRUD + toggle    │   │
│  │ /cart    │  │ rateLimit      │  │ cart — CRUD + validate  │   │
│  │ /orders  │  │ errorHandler   │  │ order — create/track    │   │
│  │ /ai      │  │ Prisma P2002   │  │ ai — slots/recs/predict │   │
│  │ /admin   │  └────────────────┘  │ admin — queue/analytics │   │
│  └──────────┘                      └────────────────────────┘   │
│                                              │                    │
│                         ┌────────────────────▼─────────────────┐ │
│                         │      AI Service (ai.service.js)       │ │
│                         │  getPickupSlots() — 12 slots, scored  │ │
│                         │  getFoodRecommendations() — 6 picks   │ │
│                         │  getKitchenLoadPrediction() — %load   │ │
│                         │  External API escape hatch via .env   │ │
│                         └────────────────────┬─────────────────┘ │
└──────────────────────────────────────────────┼───────────────────┘
                                               │ Prisma ORM
┌──────────────────────────────────────────────▼───────────────────┐
│                    PostgreSQL 18 Database                          │
│  users · food_items · cart_items · orders · order_items           │
│  5 models · 4 enums · FK constraints · cascade deletes · indexes  │
└───────────────────────────────────────────────────────────────────┘
```

### Technology Justification
| Technology | Justification |
|-----------|---------------|
| React + Vite | Component model fits 20 distinct pages; Vite HMR for fast development |
| Tailwind CSS | Utility-first eliminates per-component CSS files; consistent design tokens |
| Node.js + Express | JavaScript full-stack; Express is minimal and well-understood |
| PostgreSQL 18 | Relational model perfect for orders→items→users relationships |
| Prisma ORM | Type-safe queries; schema-as-code; auto-migrations; prevents SQL injection |
| JWT + bcrypt | Industry standard stateless auth; bcrypt cost factor 12 |
| Algorithmic AI | Self-contained; explainable; no external API dependency; modular escape hatch |

### File Structure (separation of concerns)
```
backend/src/
  controllers/    — 6 files, one per domain
  routes/         — 6 files, route declarations separated from logic
  middleware/     — JWT auth + error handler
  services/       — ai.service.js isolated from HTTP layer
  utils/          — token generator, Prisma singleton, seed

frontend/src/
  pages/          — 20 pages (auth/student/admin)
  components/     — Layout + 7 reusable UI components
  context/        — AuthContext, CartContext (global state)
  hooks/          — useOrderPolling, useLocalStorage
  services/       — api.js (all Axios calls centralised)
  utils/          — helpers.js (formatters, label maps)
```

**Status: ✅ Complete**

---

## 5. Working Prototype (Rubric Dimension 4)

**Requirement:** Fully working, end-to-end verified, real database operations.

### E2E Test Results — 20/20 Passed ✅

Automated test run: `node backend/scripts/e2e-test.js`

| Step | Action | Result |
|------|--------|--------|
| 1 | Register new student | ✅ User created in PostgreSQL |
| 2 | Login with credentials | ✅ JWT issued |
| 3 | Fetch profile (/auth/me) | ✅ User data from DB |
| 4 | Browse menu | ✅ 32 dishes loaded from DB |
| 5 | Add item to cart | ✅ CartItem created |
| 6 | View cart | ✅ Total calculated from DB prices |
| 7 | Get AI pickup slots | ✅ 12 slots from live order data |
| 8 | Get AI recommendations | ✅ 6 personalised picks scored |
| 9 | Place order | ✅ Order + items created atomically |
| 10 | Cart cleared | ✅ Verified empty after order |
| 11 | Track by token | ✅ Status PENDING, progress 10% |
| 12 | Order history | ✅ 1 order in history |
| 13 | Admin login | ✅ Admin JWT issued |
| 14 | Admin sees order | ✅ Visible in admin panel |
| 15 | Admin accepts | ✅ Status → ACCEPTED |
| 16 | Admin preparing | ✅ Status → PREPARING |
| 17 | Admin ready | ✅ Status → READY |
| 18 | Student sees READY | ✅ "Order ready" message shown |
| 19 | Admin collected | ✅ Status → COLLECTED |
| 20 | Dashboard summary | ✅ Today stats updated |

### All 20 Pages Working
| Page | Route | Auth | Status |
|------|-------|------|--------|
| Landing | `/` | Public | ✅ |
| Register | `/register` | Guest | ✅ |
| Login | `/login` | Guest | ✅ |
| Student Dashboard | `/dashboard` | Student | ✅ |
| Menu | `/menu` | Student | ✅ |
| Food Details | `/menu/:id` | Student | ✅ |
| Cart | `/cart` | Student | ✅ |
| AI Recommendations | `/recommendations` | Student | ✅ |
| Smart Pickup Time | `/pickup-time` | Student | ✅ |
| Checkout | `/checkout` | Student | ✅ |
| Order Confirmation | `/order-confirmation/:id` | Student | ✅ |
| Order Tracking | `/track/:token` | Student | ✅ |
| Order History | `/orders` | Student | ✅ |
| Profile/Settings | `/profile` | Student | ✅ |
| Admin Dashboard | `/admin` | Admin | ✅ |
| Admin Orders | `/admin/orders` | Admin | ✅ |
| Kitchen Queue | `/admin/kitchen` | Admin | ✅ |
| Menu Management | `/admin/menu` | Admin | ✅ |
| Analytics | `/admin/analytics` | Admin | ✅ |
| AI Predictions | `/admin/predictions` | Admin | ✅ |

### Security Audit — All Checks Pass ✅
| Check | Status |
|-------|--------|
| Student A cannot access Student B's orders | ✅ userId scoped on all queries |
| Admin-only routes server-enforced | ✅ `router.use(protect, adminOnly)` |
| Price calculated server-side | ✅ From DB prices, frontend sends zero price data |
| Negative quantity prevented | ✅ Validated ≥1, max 20 per item |
| Negative price prevented | ✅ Validated >0 on menu CRUD |
| pickupTime must be future date | ✅ Validated + max 24h ahead |
| Duplicate order prevention | ✅ 60-second window check |
| Auth brute-force protection | ✅ 15 req/15min on /api/auth |
| SQL injection impossible | ✅ Prisma ORM throughout |
| Status transitions enforced | ✅ Explicit transition map in controller |

### Edge Cases Handled
| Edge Case | How Handled |
|-----------|-------------|
| Empty cart checkout | Rejected with 400 |
| Unavailable item at checkout | Detected and rejected with item names |
| Invalid pickup time | Rejected: must be future, max 24h |
| Duplicate rapid checkout | 409 if PENDING order < 60s old |
| Token collision | Retry up to 10x + final uniqueness check |
| Expired JWT | 401 with specific "Token expired" message |
| Admin accessing student route | Not applicable — separate route trees |
| Student hitting admin API | 403 Forbidden from adminOnly middleware |

**Status: ✅ Complete**

---

## 6. Design Thinking Evidence (Rubric Dimension 5)

**Requirement:** Full Design Thinking process documented with evidence at each stage.

| Phase | Activity | Document | Status |
|-------|----------|----------|--------|
| **Empathise** | 3 observation sessions (9, 11, 13 Sep) | `1-empathy-portfolio.md` §2 | ✅ |
| **Empathise** | 5 interviews (3 students, 2 staff) | `1-empathy-portfolio.md` §3 | ✅ |
| **Empathise** | Empathy map (Says/Thinks/Does/Feels) | `1-empathy-portfolio.md` §4 | ✅ |
| **Empathise** | 8-stage customer journey map | `1-empathy-portfolio.md` §5 | ✅ |
| **Define** | 10 pain points, affinity grouping | `2-problem-statement.md` §1 | ✅ |
| **Define** | POV statement | `2-problem-statement.md` §2 | ✅ |
| **Define** | Single precise problem statement | `2-problem-statement.md` §3 | ✅ |
| **Define** | 8 HMW questions | `2-problem-statement.md` §5 | ✅ |
| **Ideate** | 5 AI solution directions explored | `3-ai-interaction-audit.md` AI-001 | ✅ |
| **Ideate** | Rejected 4 directions with reasons | `3-ai-interaction-audit.md` AI-001 | ✅ |
| **Ideate** | Pickup time algorithm design | `3-ai-interaction-audit.md` AI-003 | ✅ |
| **Ideate** | Recommendation algorithm design | `3-ai-interaction-audit.md` AI-004 | ✅ |
| **Prototype** | Full-stack app, 20 pages, 31 endpoints | GitHub repository | ✅ |
| **Prototype** | Real PostgreSQL DB + migrations + seed | `backend/prisma/` | ✅ |
| **Test** | 3 real testers, moderated sessions | `4-user-testing.md` | ✅ |
| **Test** | 22 tasks, 91% success rate | `4-user-testing.md` §2,3,4 | ✅ |
| **Test** | 5 UX issues found, 5 fixed + committed | `4-user-testing.md` §5 | ✅ |
| **AI Audit** | 8 interactions documented | `3-ai-interaction-audit.md` §2 | ✅ |
| **AI Audit** | 5 hallucinations caught + corrected | `3-ai-interaction-audit.md` §3 | ✅ |
| **Screenshots** | App screenshots captured | `docs/screenshots/` | ✅ |

---

## 7. What Was Addressed from Evaluation Feedback

The reviewer's evaluation identified these specific requirements:

| Requirement | What Was Built | Document |
|-------------|---------------|----------|
| Empathy portfolio — interview transcripts, observation logs, journey maps | 3 observation sessions + 5 full interview transcripts + empathy map + 8-stage journey map with emotional curve | `docs/1-empathy-portfolio.md` |
| Single precise defined problem statement | POV statement + official problem statement + 3-check validation + problem→solution mapping | `docs/2-problem-statement.md` |
| AI Interaction Audit — prompts used, adopted/rejected, hallucination corrections | 8 documented interactions, 5 hallucinations (2 critical caught), adoption reasoning throughout | `docs/3-ai-interaction-audit.md` |
| Validation with ≥3 real testers + documented feedback + changes made | 3 testers (Divya, Arjun, Rajan), 22 tasks, think-aloud quotes, 5 issues found, 5 fixes applied and committed to GitHub | `docs/4-user-testing.md` |
| docs/ folder with artefacts | All 5 documents + screenshots folder + this progress report | `docs/` in GitHub |
| Progress report mapping to milestone rubric | This document — maps all 5 rubric dimensions | `docs/5-progress-report.md` |

---

## 8. Technical Completeness Checklist

```
✅ Student registration and login (JWT + bcrypt, cost factor 12)
✅ Password hashing — bcrypt, never stored in plaintext
✅ Menu with 32 real dishes, real photos, categories, search, filter
✅ Cart — add/remove/update with quantity validation (1–20)
✅ AI pickup slot prediction (algorithmic, reads live DB data)
✅ AI food recommendations (multi-factor scoring from order history)
✅ Checkout with server-side price calculation
✅ Order creation — atomic Prisma transaction
✅ Unique digital token per order (ORD-MMDD-XXXX)
✅ Order status workflow: PENDING → ACCEPTED → PREPARING → READY → COLLECTED
✅ Live order tracking with 15-second polling + auto-stop at terminal
✅ Order history with status filter
✅ Order cancellation (PENDING status only, owner-scoped)
✅ Student profile + password change
✅ Admin dashboard with live counts
✅ Admin order management + status transitions (validated)
✅ Kitchen queue sorted by pickup time + urgency flags
✅ Admin menu CRUD + availability toggle
✅ Analytics (7/30 day periods, top items, hourly distribution)
✅ AI kitchen load prediction (30-min windows)
✅ Input validation on all endpoints (price, quantity, dates, enums)
✅ Auth brute-force protection (rate limiter)
✅ All ownership checks (userId scoped on cart, orders, cancel)
✅ Admin-only server enforcement
✅ Responsive design (mobile + desktop)
✅ Loading/empty/error states on every page
✅ E2E test suite — 20/20 passing
✅ API verification suite — 20/20 passing
✅ Production build — 124 modules, 0 errors
✅ GitHub — all commits pushed to main
```

---

## 9. Deferred to Future Phases

| Feature | Reason Deferred |
|---------|----------------|
| Real payment gateway (Razorpay/UPI) | Requires business registration, API keys, production HTTPS |
| Push notifications (FCM) | Requires service worker, app install, HTTPS |
| Advanced ML model (collaborative filtering) | Needs training data volume; algorithmic engine meets current need |
| QR code token scanning | Readable token number achieves same result more simply |
| Production deployment (cloud) | Requires domain, SSL, CI/CD pipeline |
| Multi-canteen support | Out of current scope |
| Star rating by students | Phase 3 feature |
| Dark mode | UI enhancement — Phase 3 |

---

## 10. Setup and Run

```bash
# 1. Clone
git clone https://github.com/abishek-046/ai-smart-ordering-system.git
cd ai-smart-ordering-system

# 2. Install
cd backend && npm install
cd ../frontend && npm install

# 3. Configure
# Edit backend/.env — set DATABASE_URL with your PostgreSQL password

# 4. Database
CREATE DATABASE smart_ordering;  -- in psql
cd backend
npx prisma migrate dev --name init
node src/utils/seed.js

# 5. Run (two terminals)
cd backend && node src/index.js      # → http://localhost:5000
cd frontend && npm run dev           # → http://localhost:5173

# 6. Credentials
# Student: student@test.com / student123
# Admin:   admin@canteen.com / admin123

# 7. Verify
node backend/scripts/verify-api.js   # 20/20 API tests
node backend/scripts/e2e-test.js     # 20/20 E2E tests
```

---

*Final Progress Report — AI-Smart Ordering System*  
*Abishek — September 2026*  
*GitHub: https://github.com/abishek-046/ai-smart-ordering-system*
