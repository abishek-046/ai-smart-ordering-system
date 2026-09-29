# Progress Report — Milestone Rubric Mapping
## AI-Smart Ordering System — College Canteen
### Review 1 (40%) → Review 2 (75%) Progress

**Project:** AI-Smart Ordering System  
**Objective:** Project Better Tomorrow — Reduce physical queues at college canteen  
**Team Member:** Abishek  
**GitHub:** https://github.com/abishek-046/ai-smart-ordering-system  
**Live App:** http://localhost:5173 (run setup instructions in README)  
**Date:** September 2026

---

## 1. Executive Summary

The AI-Smart Ordering System addresses a concrete daily problem observed in the college canteen: students with tight class schedules lose 10–20 minutes daily in unpredictable queues, frequently miss meals, and arrive late to class. Canteen staff waste ~15% of daily food stock due to inability to forecast demand.

The solution is a full-stack web application that allows students to pre-order food, receive an AI-recommended pickup time, get a digital token, and track their order live. Admins manage orders through a real-time kitchen queue and dashboard.

This report maps all completed work to the five rubric dimensions required for the 75% milestone.

---

## 2. Rubric Dimension 1 — Problem Understanding

**Rubric Requirement:** Evidence that the problem is real, observed, and grounded in user data. Not assumed.

### What Was Done

| Activity | Evidence | Document |
|----------|----------|----------|
| 3 canteen observation sessions | Timestamped observation logs with specific incidents | `docs/1-empathy-portfolio.md` §2 |
| 5 structured interviews | Full transcripts — 3 students, 1 counter staff, 1 manager | `docs/1-empathy-portfolio.md` §3 |
| Empathy map | 4-quadrant map: Says, Thinks, Does, Feels | `docs/1-empathy-portfolio.md` §4 |
| Customer journey map | 8-stage journey with emotional curve for primary persona | `docs/1-empathy-portfolio.md` §5 |
| POV statement | User × Need × Insight format | `docs/2-problem-statement.md` §2 |
| Precise problem statement | Single paragraph identifying all friction points | `docs/2-problem-statement.md` §3 |
| HMW questions | 8 How Might We questions derived from data | `docs/2-problem-statement.md` §5 |
| Problem validation | Checked against 3 criteria: matches user data, avoids jumping to solution, specific enough to build from | `docs/2-problem-statement.md` §7 |

### Key Numbers from Research
- Average queue wait: **12–18 minutes** during peak hours
- Students who left without food: **~40% of observed walk-ins** (Observation Session 1)
- Daily food waste at canteen: **~15%** (Manager Interview)
- Students who would use a pre-ordering system: **5/5 interviewees** (100%)
- Classes missed/entered late due to canteen: **minimum 3 incidents in 45 minutes** observed

**Status: ✅ Fully addressed**

---

## 3. Rubric Dimension 2 — Dataset / Research

**Rubric Requirement:** Real data collected from the environment — not invented, not generic.

### Primary Research Data Collected

| Data Type | Volume | How Collected |
|-----------|--------|---------------|
| Observation sessions | 3 sessions, 135 minutes total | Direct observation at canteen, timestamped logs |
| Student interviews | 3 interviews, ~30 minutes total | Structured 8–12 question sessions, verbatim quotes recorded |
| Staff interviews | 2 interviews (counter staff + manager), ~17 minutes | Translated from Tamil where necessary |
| Queue wait times | 8 measured instances | Stopwatch timing during observation |
| Food sellout events | 3 events observed directly | Observation log entries |
| Student walkaways | ~12 walkaways counted | Observation Session 1 count |

### Database Seeded with Real-World Canteen Data

The application database (`smart_ordering`) is seeded with:
- **27 food items** representing actual categories found in college canteens (Breakfast, Lunch, Snacks, Beverages, Desserts, Special)
- **Preparation times** set based on observed kitchen performance (Dosa: 8 min, Biryani: 15 min, Beverages: 2–3 min)
- **Peak hour data** embedded in the AI pickup slot scoring algorithm (8–9 AM, 12–2 PM flagged as peak based on observations)
- **Pricing** set to match typical South Indian college canteen price range (₹15–₹120)

### Data Used in AI Algorithm

The AI pickup time prediction reads live from the database:
- `ORDER` table — active orders per 15-minute window
- `FOOD_ITEM` table — preparation times per category
- Peak hours encoded from Observation Sessions 1 & 2

The food recommendation algorithm reads:
- `ORDER` + `ORDER_ITEM` tables — user's order history
- Category frequency, reorder counts, average spend per user

**Status: ✅ Fully addressed**

---

## 4. Rubric Dimension 3 — Architecture

**Rubric Requirement:** Clean, documented, layered system architecture. Separation of concerns. Appropriate technology choices with justification.

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│  React + Vite + Tailwind CSS                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │Auth Pages│ │Student   │ │Admin     │ │Shared        │  │
│  │Landing   │ │Dashboard │ │Dashboard │ │Components    │  │
│  │Login     │ │Menu      │ │Orders    │ │Layout        │  │
│  │Register  │ │Cart      │ │Kitchen Q │ │UI Components │  │
│  │          │ │Checkout  │ │Analytics │ │Hooks         │  │
│  │          │ │Tracking  │ │AI Predict│ │Context       │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  Axios API Service Layer (services/api.js)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST (JSON)
                           │ Proxy: localhost:5173 → :5000
┌──────────────────────────▼──────────────────────────────────┐
│                   SERVER (Node.js + Express)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Routes     │  │ Middleware  │  │    Controllers      │ │
│  │/auth        │→ │JWT Verify   │→ │auth.controller.js   │ │
│  │/menu        │  │Role Check   │  │menu.controller.js   │ │
│  │/cart        │  │Rate Limit   │  │cart.controller.js   │ │
│  │/orders      │  │Error Handler│  │order.controller.js  │ │
│  │/ai          │  │Validation   │  │ai.controller.js     │ │
│  │/admin       │  └─────────────┘  │admin.controller.js  │ │
│  └─────────────┘                   └─────────────────────┘ │
│                                           │                  │
│                              ┌────────────▼──────────────┐  │
│                              │     AI Service Layer       │  │
│                              │  ai.service.js             │  │
│                              │  • getPickupSlots()        │  │
│                              │  • getFoodRecommendations()│  │
│                              │  • getKitchenLoadPrediction│  │
│                              │  External API escape hatch │  │
│                              └────────────┬──────────────┘  │
└───────────────────────────────────────────┼─────────────────┘
                                            │ Prisma ORM
┌───────────────────────────────────────────▼─────────────────┐
│                PostgreSQL 18 Database                         │
│  users  │  food_items  │  cart_items  │  orders  │  order_items │
└──────────────────────────────────────────────────────────────┘
```

### Technology Choices — Justified

| Technology | Choice | Justification |
|-----------|--------|---------------|
| **Frontend** | React + Vite | Component-based UI matches the complexity of 20 distinct pages. Vite provides fast HMR for development. |
| **Styling** | Tailwind CSS | Utility-first approach enables rapid responsive UI without a separate CSS file per component. |
| **Backend** | Node.js + Express | JavaScript full-stack keeps the codebase uniform. Express is lightweight and well-understood. |
| **Database** | PostgreSQL | Relational data model fits perfectly — orders have items, users have carts, all with referential integrity. |
| **ORM** | Prisma | Type-safe queries, auto-generated migrations, clean schema-as-code. Prevents SQL injection. |
| **Auth** | JWT + bcrypt | Industry standard for stateless authentication. bcrypt with cost factor 12 for secure password hashing. |
| **AI** | Algorithmic (no external API) | Keeps the system self-contained and free. Modular — external ML API can be plugged in via env vars without changing any other code. |

### File Structure (clean separation of concerns)

```
backend/
├── prisma/
│   ├── schema.prisma          # Single source of truth for DB schema
│   └── migrations/            # Version-controlled DB migrations
└── src/
    ├── controllers/           # One controller per domain
    ├── routes/                # Route declarations separated from logic
    ├── middleware/            # Auth + error handling
    ├── services/              # AI business logic (isolated)
    └── utils/                 # Shared utilities (token, prisma client, seed)

frontend/
└── src/
    ├── components/
    │   ├── layout/            # StudentLayout, AdminLayout
    │   └── ui/                # Reusable: Spinner, StatusBadge, SkeletonCard, etc.
    ├── context/               # AuthContext, CartContext (global state)
    ├── hooks/                 # useOrderPolling, useLocalStorage
    ├── pages/
    │   ├── auth/              # Landing, Login, Register
    │   ├── student/           # 11 student pages
    │   └── admin/             # 6 admin pages
    ├── services/              # api.js — all Axios calls in one place
    └── utils/                 # helpers.js — formatters, label maps
```

**Status: ✅ Fully addressed**

---

## 5. Rubric Dimension 4 — Working Prototype

**Rubric Requirement:** A real working application — not static, not hardcoded. Real database operations, real authentication, real API calls.

### Core Flow — Verified End-to-End

The complete student → admin flow was verified by an automated end-to-end test (`backend/scripts/e2e-test.js`) that ran 20 steps against the live database:

| Step | Feature | Result |
|------|---------|--------|
| 1 | Student registration | ✅ New user created in PostgreSQL |
| 2 | Student login | ✅ JWT issued and returned |
| 3 | Fetch profile | ✅ User data retrieved from DB |
| 4 | Browse menu | ✅ 27 items loaded from DB |
| 5 | Add item to cart | ✅ CartItem record created |
| 6 | View cart | ✅ Cart total calculated from live prices |
| 7 | AI pickup slots | ✅ 12 slots generated from active order data |
| 8 | AI recommendations | ✅ 6 personalised picks scored and returned |
| 9 | Place order | ✅ Order + OrderItems created, cart cleared atomically |
| 10 | Cart cleared | ✅ Verified empty after order |
| 11 | Track by token | ✅ Order found by unique token, status PENDING |
| 12 | Order history | ✅ 1 order in history |
| 13 | Admin login | ✅ Admin JWT issued |
| 14 | Admin sees order | ✅ Order visible in admin panel |
| 15 | Admin accepts | ✅ Status → ACCEPTED, timestamp recorded |
| 16 | Admin preparing | ✅ Status → PREPARING |
| 17 | Admin marks ready | ✅ Status → READY |
| 18 | Student sees READY | ✅ "Your order is ready for pickup!" message |
| 19 | Admin collected | ✅ Status → COLLECTED |
| 20 | Dashboard summary | ✅ Today's stats updated |

**Result: 20/20 tests passed**

### Pages Built and Working

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

**Total: 20/20 pages working**

### API Endpoints — All Verified

**Authentication:** 5 endpoints  
**Menu:** 6 endpoints  
**Cart:** 5 endpoints  
**Orders:** 5 endpoints  
**AI:** 3 endpoints  
**Admin:** 7 endpoints  
**Total: 31 endpoints — all tested and working**

### Edge Cases Handled

| Edge Case | How Handled |
|-----------|-------------|
| Empty cart checkout | Blocked with error message |
| Item becomes unavailable between add and checkout | Validated at order creation, rejected with named items |
| Duplicate student ID registration | Unique constraint + friendly error message |
| Expired JWT | Specific "Token expired. Please log in again." message |
| Invalid JWT | Specific "Invalid token." message |
| Token collision on order creation | Retry loop up to 10 attempts |
| Admin trying invalid status transition | Transition map enforced (e.g., PREPARING → PENDING rejected) |
| Student accessing admin routes | 403 Forbidden with clear message |
| Non-existent order token | 404 with message |
| Rate limiting | 200 requests per 15 minutes per IP |

**Status: ✅ Fully addressed**

---

## 6. Rubric Dimension 5 — Design Thinking Evidence

**Rubric Requirement:** Documentation showing the full Design Thinking process was followed: Empathise → Define → Ideate → Prototype → Test.

### Design Thinking Phase Coverage

| Phase | Activity | Document | Status |
|-------|----------|----------|--------|
| **Empathise** | 3 observation sessions at canteen | `docs/1-empathy-portfolio.md` | ✅ |
| **Empathise** | 5 structured interviews (3 students, 2 staff) | `docs/1-empathy-portfolio.md` | ✅ |
| **Empathise** | Empathy map (Says/Thinks/Does/Feels) | `docs/1-empathy-portfolio.md` | ✅ |
| **Empathise** | 8-stage customer journey map with emotional curve | `docs/1-empathy-portfolio.md` | ✅ |
| **Define** | Affinity grouping of pain points into 3 themes | `docs/2-problem-statement.md` | ✅ |
| **Define** | POV statement (User × Need × Insight) | `docs/2-problem-statement.md` | ✅ |
| **Define** | Single precise problem statement | `docs/2-problem-statement.md` | ✅ |
| **Define** | 8 HMW questions derived from data | `docs/2-problem-statement.md` | ✅ |
| **Ideate** | 5 solution directions explored with AI | `docs/3-ai-interaction-audit.md` | ✅ |
| **Ideate** | Justified adoption/rejection of each direction | `docs/3-ai-interaction-audit.md` | ✅ |
| **Ideate** | AI algorithm design for pickup prediction | `docs/3-ai-interaction-audit.md` | ✅ |
| **Ideate** | AI algorithm design for food recommendations | `docs/3-ai-interaction-audit.md` | ✅ |
| **Prototype** | Full-stack working application (76 files, ~10,000 lines) | GitHub repo | ✅ |
| **Prototype** | 20 working pages, 31 API endpoints | This report §5 | ✅ |
| **Prototype** | Real PostgreSQL database with migrations + seed data | `backend/prisma/` | ✅ |
| **Test** | Moderated usability testing with 3 real users | `docs/4-user-testing.md` | ✅ |
| **Test** | 22 tasks across 3 testers, 91% success rate | `docs/4-user-testing.md` | ✅ |
| **Test** | 5 UX issues identified, all 5 fixed and documented | `docs/4-user-testing.md` | ✅ |
| **AI Audit** | 8 AI interactions documented | `docs/3-ai-interaction-audit.md` | ✅ |
| **AI Audit** | 5 hallucinations caught, corrected, explained | `docs/3-ai-interaction-audit.md` | ✅ |
| **AI Audit** | What was adopted vs rejected — with reasons | `docs/3-ai-interaction-audit.md` | ✅ |

**Status: ✅ Fully addressed**

---

## 7. What Was Addressed from Review 1 Feedback

The reviewer's Review 1 feedback specified four missing items:

| Reviewer Requirement | What Was Built | Document |
|---------------------|---------------|----------|
| ① Empathy portfolio — interview transcripts, observation logs, journey maps | 3 observation sessions, 5 interview transcripts, empathy map, 8-stage journey map | `docs/1-empathy-portfolio.md` |
| ② Single precise defined problem statement derived from data | POV statement + precise problem statement + 3-check validation | `docs/2-problem-statement.md` |
| ③ AI Interaction Audit — prompts used, adopted, rejected, hallucination corrections | 8 interactions, 5 hallucinations with impact + fix, adoption reasoning | `docs/3-ai-interaction-audit.md` |
| ④ Validation with at least 3 real testers with documented feedback and changes made | 3 testers, 22 tasks, 5 issues found, 5 fixes applied and committed | `docs/4-user-testing.md` |
| ⑤ docs/ folder in repo with artefacts | All 5 documents in `docs/`, screenshots folder created | `docs/` folder in GitHub |
| ⑥ Progress report mapping to milestone rubric | This document | `docs/5-progress-report.md` |

---

## 8. What Remains for 100% Milestone

The following features are explicitly deferred to later phases and are **not part of the current milestone claim:**

| Feature | Reason Deferred |
|---------|----------------|
| Real payment gateway (Razorpay/UPI) | Requires business registration, API keys, security audit |
| Push notifications (FCM) | Requires HTTPS deployment, service worker, app install |
| Advanced ML model (collaborative filtering) | Requires training data volume; current algorithmic engine serves the milestone |
| Production deployment (AWS/Vercel/Railway) | Requires domain, SSL, environment configuration |
| QR code token scanning | Nice-to-have; digital token number achieves same result |
| Multi-canteen support | Out of current scope |
| Star rating system for food | Post-order feedback loop — Phase 3 |
| Dark mode | UI enhancement — Phase 3 |

---

## 9. How to Run the Project

```bash
# Prerequisites: Node.js 18+, PostgreSQL 18

# 1. Clone the repo
git clone https://github.com/abishek-046/ai-smart-ordering-system.git
cd ai-smart-ordering-system

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Configure environment
# Edit backend/.env — set your PostgreSQL password in DATABASE_URL

# 4. Create database (in psql)
CREATE DATABASE smart_ordering;

# 5. Run migrations
cd backend
npx prisma migrate dev --name init

# 6. Seed sample data
node src/utils/seed.js

# 7. Start backend (Terminal 1)
node src/index.js

# 8. Start frontend (Terminal 2)
cd ../frontend && npm run dev

# 9. Open browser
# http://localhost:5173
# Student: student@test.com / student123
# Admin:   admin@canteen.com / admin123
```

---

## 10. Repository Structure

```
ai-smart-ordering-system/
├── docs/
│   ├── 1-empathy-portfolio.md        ← Observation logs + interviews + journey map
│   ├── 2-problem-statement.md        ← POV + precise problem statement + HMW
│   ├── 3-ai-interaction-audit.md     ← All AI prompts, adoptions, hallucinations
│   ├── 4-user-testing.md             ← 3 testers, tasks, feedback, fixes
│   ├── 5-progress-report.md          ← This document — rubric mapping
│   └── screenshots/                  ← App screenshots (see below)
├── backend/
│   ├── prisma/schema.prisma          ← Database schema
│   ├── src/
│   │   ├── controllers/              ← 6 controllers
│   │   ├── routes/                   ← 6 route files
│   │   ├── middleware/               ← Auth + error middleware
│   │   ├── services/ai.service.js    ← AI engine
│   │   └── utils/                    ← Token, Prisma, seed
│   └── scripts/                      ← e2e-test.js, verify-api.js
├── frontend/
│   └── src/
│       ├── pages/                    ← 20 pages (auth, student, admin)
│       ├── components/               ← Reusable UI + layouts
│       ├── context/                  ← Auth + Cart global state
│       ├── hooks/                    ← useOrderPolling, useLocalStorage
│       └── services/api.js           ← Centralised API layer
├── .env.example                      ← Environment variable template
└── README.md                         ← Full setup instructions
```

---

*Progress report prepared for Design Thinking Review — 75% Milestone*  
*Abishek — [Your College Name] — September 2026*
