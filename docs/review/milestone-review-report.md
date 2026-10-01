# Milestone Review Report
## AI-Smart Ordering System — Final Review (100%)

**Project:** AI-Smart Ordering System — Project Better Tomorrow  
**GitHub:** https://github.com/abishek-046/ai-smart-ordering-system  
**Institution:** Rathinam Technical Campus  
**Team Member:** Abishek  
**Date:** 30 September 2026

---

## 1. Problem Understanding

**What exists:** Field research conducted at the college canteen. 3 observation sessions (135 min total), 5 structured interviews (3 students, 2 canteen staff), empathy map, 8-stage customer journey map.

**Key finding:** College students with 15-minute lunch breaks lose 12–20 minutes in canteen queues during predictable peak hours (8:30–9 AM, 12:45–1:15 PM). ~40% abandon the canteen without food. At least 1 student per 45-minute observation was directly observed arriving late to class. Canteen staff waste ~15% daily food stock due to inability to forecast demand.

**Repository paths:**
- `docs/design-thinking/observation-log.md` — 3 sessions, timestamped logs
- `docs/design-thinking/interview-transcripts.md` — 5 full verbatim transcripts
- `docs/design-thinking/empathy-portfolio.md` — empathy map, pain points, insights
- `docs/design-thinking/user-journey-map.md` — current state vs future state
- `docs/design-thinking/problem-definition.md` — POV statement, official problem statement

**Verified:** Research methodology documented with timestamps, locations, tester profiles (privacy protected), verbatim quotes.

---

## 2. Empathy Evidence

**What exists:**

| Artefact | File | Content |
|---------|------|---------|
| Observation Log | `docs/design-thinking/observation-log.md` | 3 sessions, timestamped table with observations and significance |
| Interview Transcripts | `docs/design-thinking/interview-transcripts.md` | 5 full Q&A transcripts: 3 students, 1 counter staff, 1 manager |
| Empathy Portfolio | `docs/design-thinking/empathy-portfolio.md` | 4-quadrant empathy map, 10 pain points, 8 user needs, user expectations |
| User Journey Map | `docs/design-thinking/user-journey-map.md` | 9-stage current state journey with emotional curve; future state comparison |

**Key evidence highlights:**
- Student A (Priya): *"I want to order before I leave class. Just like Swiggy."*
- Canteen Staff (Rajan): *"If I know 20 students are coming for biryani at 1 PM I can prepare exactly 20."*
- Manager: *"We throw away 10–15% of what we prepare every day."*
- Observed: ~40% student walkaway rate at peak; 2 direct class-lateness incidents across 2 peak sessions

**Verified:** All observations personally conducted. All interviews conducted in person. Interview 4 (Rajan) conducted in Tamil and translated.

---

## 3. Defined Problem

**Official Problem Statement:**
> *College canteen students cannot plan their meal around their class schedule because the canteen operates as a fully walk-in, information-free system. There is no pre-ordering, no remote availability check, no preparation time estimate, and no plannable pickup time. This causes daily time loss (12–20 minutes in queues), meal skipping (~40% walkaway rate at peak), and class tardiness for students with back-to-back schedules — while simultaneously causing ~15% daily food waste and operational errors for canteen staff who have no advance demand data.*

**Repository path:** `docs/design-thinking/problem-definition.md`

**Structure:**
- WHO: Students with fixed academic schedules
- WHERE: College canteen
- WHEN: Peak hours at class boundary times
- WHAT: Walk-in, information-free queue system
- WHY: No pre-ordering, no availability data, no prep time estimate
- IMPACT: Quantified (wait times, walkaway rates, food waste)
- HOW MIGHT WE: 8 HMW questions mapping to built features
- MEASURABLE OBJECTIVES: 5 defined targets

---

## 4. Dataset / Data

**What exists:**

| Data Type | Volume | Source |
|-----------|--------|--------|
| Canteen observations | 3 sessions, 135 min | Direct observation with timestamped logs |
| Student interviews | 3 interviews, ~30 min | Structured Q&A, verbatim |
| Staff interviews | 2 interviews, ~17 min | Tamil → English translation |
| Measured wait times | 8 data points | Stopwatch timing during Sessions 1–2 |
| Sellout events | 3 | Observation logs |
| Walkaway count | ~12 | Session 1 count |

**Application database seeded from research:**
- 32 authentic South Indian canteen dishes (`backend/src/utils/seed.js`)
- Preparation times from kitchen observation (Dosa: 8 min, Biryani: 15 min)
- Peak hour flags in AI algorithm: 8–9 AM, 12–2 PM (from sessions 1 & 2)
- Pricing: ₹15–₹140 matching actual college canteen price bands

**AI algorithms use live database:**
- Pickup prediction: `orders` table — active orders per 15-min slot
- Food recommendations: `orders` + `order_items` — last 20 completed orders per user
- Kitchen load: `orders` table — upcoming orders in 3-hour window

---

## 5. Architecture

**What exists:**
```
React 18 + Vite + Tailwind → Axios → Express/Node.js → Prisma → PostgreSQL 18
```

**Key architectural decisions:**
| Decision | Justification |
|----------|---------------|
| Relational DB (PostgreSQL) | Orders, items, users have strict FK relationships |
| Prisma ORM | Type-safe, migration-managed, prevents SQL injection |
| JWT + bcrypt | Stateless auth, bcrypt cost 12, industry standard |
| Algorithmic AI | No external dependency, explainable, modular escape hatch |
| 15-second polling | Real-time tracking without WebSockets — simpler, sufficient |

**Repository paths:**
- `backend/prisma/schema.prisma` — 5 models, 4 enums, FK constraints
- `backend/src/controllers/` — 6 controllers
- `backend/src/routes/` — 6 route files
- `backend/src/middleware/` — JWT + error handler
- `backend/src/services/ai.service.js` — AI engine
- `frontend/src/` — 20 pages, React contexts, custom hooks

---

## 6. AI Component

**What exists:**

| Feature | Implementation | File |
|---------|---------------|------|
| Pickup time prediction | Algorithmic slot scoring: load_penalty + peak_penalty + wait_bonus | `backend/src/services/ai.service.js` |
| Food recommendations | Multi-factor scoring: category + reorder + price + popularity | `backend/src/services/ai.service.js` |
| Kitchen load prediction | 30-min window bucketing of upcoming orders | `backend/src/services/ai.service.js` |

**AI algorithm transparency:**
- All formulas documented in `docs/ai-audit/ai-interaction-audit.md`
- Algorithm parameters derived from field research (peak hours from observation data)
- External AI API escape hatch: set `AI_API_KEY` + `AI_API_URL` in `.env` to route to any external ML API
- Fallback: if AI service fails, returns error (no fake data)
- New user fallback: top-rated items by rating × totalRatings when no order history exists

---

## 7. Working Prototype

**Status:** Fully functional. All 20 pages working. 31 API endpoints. 20/20 E2E tests pass.

**E2E test result:** `node backend/scripts/e2e-test.js` → 20/20 ✅

Complete student flow verified:
Register → Login → Menu (32 dishes) → Search/Filter → Food Details → Add to Cart → Smart Pickup Time (AI) → Checkout → Order Confirmation + Token → Live Tracking → Order History

Complete admin flow verified:
Login → Dashboard → Orders → Accept → Preparing → Ready → Collected → Kitchen Queue → Menu Management → Analytics → AI Predictions

**Build:** `npm run build` in frontend → 124 modules, 0 errors

---

## 8. Student Flow

| Step | Feature | Verified |
|------|---------|---------|
| Register | JWT + bcrypt, email uniqueness check | ✅ E2E step 1 |
| Login | Token issued, role-based redirect | ✅ E2E step 2 |
| Browse menu | 32 dishes, category tabs, search, real photos | ✅ E2E step 4 |
| Add to cart | Availability check, qty validation 1–20 | ✅ E2E step 5 |
| AI Pickup Time | 12 slots, scored by live queue + peak hours | ✅ E2E step 7 |
| AI Recommendations | 6 picks scored by history, price, rating | ✅ E2E step 8 |
| Checkout | Server-side price, pickupTime validation | ✅ E2E step 9 |
| Order token | Unique ORD-MMDD-XXXX, collision retry | ✅ E2E step 9 |
| Cart cleared | Atomic transaction — cart + order | ✅ E2E step 10 |
| Track by token | Ownership check, 10/30/60/90/100% progress | ✅ E2E step 11 |
| Order history | Scoped to user, status filter | ✅ E2E step 12 |
| Cancel order | Only PENDING, owner-scoped | ✅ Tested separately |

---

## 9. Admin Flow

| Step | Feature | Verified |
|------|---------|---------|
| Admin login | adminOnly middleware, separate token | ✅ E2E step 13 |
| Dashboard | Live counts from DB | ✅ E2E step 20 |
| View all orders | Filtered by status, paginated | ✅ E2E step 14 |
| Status updates | Enforced transition map | ✅ E2E steps 15–19 |
| Kitchen queue | Sorted by pickup time, urgency flags | ✅ Manual test |
| Menu CRUD | Name/price/prepTime validation | ✅ Manual test |
| Availability toggle | Instant DB update | ✅ Manual test |
| Analytics | 7/30-day aggregates | ✅ Manual test |
| AI kitchen predictions | 30-min load windows | ✅ Manual test |

---

## 10. Edge Cases

| Edge Case | How Handled | File |
|-----------|------------|------|
| Empty cart checkout | 400 "Your cart is empty" | `order.controller.js` |
| Unavailable item at checkout | 400 with item names listed | `order.controller.js` |
| Negative quantity | 400 "must be positive integer" | `cart.controller.js` |
| Excessive quantity (>20) | 400 "cannot exceed 20" | `cart.controller.js` |
| Past pickupTime | 400 "must be in the future" | `order.controller.js` |
| pickupTime > 24h ahead | 400 "not more than 24 hours" | `order.controller.js` |
| Duplicate order (60s) | 409 with existing order ID | `order.controller.js` |
| Token collision | Retry loop + final uniqueness check | `order.controller.js` |
| Expired JWT | 401 "Token expired. Please log in again." | `auth.middleware.js` |
| Invalid JWT | 401 "Invalid token." | `auth.middleware.js` |
| Student accessing other student's order | 404 (userId scoped) | `order.controller.js` |
| Student accessing admin API | 403 "Access denied. Admins only." | `auth.middleware.js` |
| Menu item deleted after cart add | Order creation checks availability from DB | `order.controller.js` |
| Invalid status transition | 400 with allowed transitions | `admin.controller.js` |
| Negative price on menu create | 400 "must be positive" | `menu.controller.js` |
| Empty name on menu create | 400 "at least 2 characters" | `menu.controller.js` |
| Invalid category enum | 400 with valid categories listed | `menu.controller.js` |

---

## 11. Security

| Check | Status |
|-------|--------|
| Price never trusted from frontend | ✅ Calculated from DB in `createOrder` |
| User ID never trusted from request body | ✅ Always from `req.user.id` (JWT) |
| Admin routes server-enforced | ✅ `router.use(protect, adminOnly)` |
| Ownership verification on all order ops | ✅ `{ where: { id, userId: req.user.id } }` |
| Brute-force protection on auth | ✅ 15 req/15min on `/api/auth`, skipSuccessful |
| SQL injection impossible | ✅ Prisma ORM, parameterised queries |
| Secrets in environment variables | ✅ `.env` in `.gitignore`, `.env.example` provided |
| Sensitive errors not exposed | ✅ Generic messages to client, detail in server logs |
| Input sanitization | ✅ `name.trim()`, length limits, enum validation |

---

## 12. Testing

**Automated tests run:**

```bash
# API verification (no database needed)
node backend/scripts/verify-api.js   → 20/20 ✅

# Full end-to-end with real database  
node backend/scripts/e2e-test.js     → 20/20 ✅

# Frontend production build
cd frontend && npm run build         → 124 modules, 0 errors ✅
```

**Manual testing performed:**
- All 31 API endpoints tested with valid and invalid inputs
- Auth middleware tested: valid token, expired token, missing token, invalid token
- Cart tested: add, update, remove, clear, quantity limits, unavailable items
- Order tested: create, track, cancel, status transitions, concurrent submission
- Admin tested: all CRUD operations, unauthorized access attempts

---

## 13. AI Interaction Audit

**What exists:** `docs/ai-audit/ai-interaction-audit.md`

**Coverage:**
- 9 documented AI interactions across categories: ideation, algorithms, database, backend, frontend, security
- 5 hallucinations documented with severity, impact, and fix
- **2 critical hallucinations caught:** H-3 (wrong JWT key — would break all auth) and H-4 (batch vs interactive transaction — would clear carts on order failure)
- Clear distinction between AI suggestions and developer decisions throughout

**Repository paths:**
- `docs/ai-audit/ai-interaction-audit.md` — full audit
- `docs/ai-audit/hallucination-corrections.md` — detailed fix documentation

---

## 14. User Validation

**What exists:** `docs/validation/`

| File | Content |
|------|---------|
| `user-testing-plan.md` | Testing methodology, task sets, success criteria |
| `user-test-1.md` | Student Tester A — 12 tasks, 28 min, laptop |
| `user-test-2.md` | Student Tester B — 12 tasks, 35 min, Android mobile |
| `user-test-3.md` | Canteen Staff Tester — 10 tasks, 40 min, lab computer |
| `validation-summary.md` | Consolidated results, all 5 issues found and fixed |

**Summary:**
- 34 tasks total, 100% completion rate
- 5 UX issues found, 5 fixed, all retested and confirmed
- Average satisfaction: 7.3/10
- All 3 testers: "Yes, I would use this in the real canteen"

---

## 15. Screenshots / Demo Evidence

**What exists:** `docs/evidence/screenshots/`

Automated screenshot capture script: `docs/evidence/screenshots/capture.js`

Screens captured:
1. Landing page
2. Login page
3. Register page
4. Student Dashboard
5. Menu (all categories)
6. Menu (filtered — Lunch)
7. Food Details page
8. Cart with items
9. AI Recommendations
10. Smart Pickup Time (AI slots)
11. Checkout
12. Order History
13. Profile/Settings
14. Admin Dashboard
15. Admin Orders
16. Kitchen Queue
17. Menu Management
18. Analytics Dashboard
19. AI Kitchen Predictions
20. Error state (invalid token)

**Demo instructions:** See `docs/evidence/demo/demo-script.md`

---

## 16. Final Implementation Status

```
✅ Student registration and login
✅ Password hashing (bcrypt cost 12)
✅ JWT authentication + expiry handling
✅ Admin role separation (server-enforced)
✅ Menu with 32 real dishes + real food photos
✅ Category filtering + real-time search
✅ Cart with quantity validation (1–20)
✅ AI pickup time prediction (algorithmic, live data)
✅ AI food recommendations (history-based, fallback)
✅ Checkout with server-side price calculation
✅ Atomic order creation (Prisma interactive transaction)
✅ Digital token (ORD-MMDD-XXXX, collision-safe)
✅ Order status: PENDING→ACCEPTED→PREPARING→READY→COLLECTED
✅ Live order tracking (15s polling, auto-stops at terminal)
✅ Order cancellation (PENDING only, owner-scoped)
✅ Order history with status filter
✅ Student profile + password change
✅ Admin dashboard with live KPIs
✅ Admin order management + validated status transitions
✅ Kitchen queue sorted by urgency
✅ Menu CRUD with full input validation
✅ Analytics (7/30-day, top items, hourly distribution)
✅ AI kitchen load prediction
✅ Security: brute-force protection, ownership checks, no price trust
✅ Input validation on all endpoints
✅ Responsive design (mobile + desktop)
✅ Loading / empty / error states throughout
✅ 20/20 E2E tests passing
✅ 20/20 API verification tests passing
✅ Production build: 0 errors
✅ GitHub: all commits pushed

Design Thinking Evidence:
✅ Observation logs (3 sessions, 135 min)
✅ Interview transcripts (5 full transcripts)
✅ Empathy map
✅ Customer journey map (current + future state)
✅ Problem definition with POV statement
✅ AI Interaction Audit (9 interactions, 5 hallucinations)
✅ Hallucination correction log
✅ User testing (3 testers, 34 tasks, 100% completion)
✅ Validation summary (5 issues found + fixed)
✅ Screenshots (20 screens captured)
✅ Milestone review report (this document)
```

---

*Milestone Review Report — AI-Smart Ordering System*  
*Abishek — Rathinam Technical Campus — September 2026*  
*GitHub: https://github.com/abishek-046/ai-smart-ordering-system*
