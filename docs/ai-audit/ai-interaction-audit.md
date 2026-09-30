# AI Interaction Audit
## AI-Smart Ordering System

**AI Tool Used:** Kiro IDE (powered by Claude/Anthropic)  
**Audit Period:** 14–30 September 2026  
**Purpose:** Document all AI interactions during development — what was prompted, adopted, rejected, modified, and how hallucinations were caught and corrected.

---

## Audit Principles

This audit documents the AI as a **tool that accelerated development** — not as the author of the system. Every AI output was:
1. Read and understood before being used
2. Tested against real behaviour
3. Reviewed for security and correctness
4. Modified where necessary to fit the actual requirements

The audit distinguishes:
- ✅ **Adopted as-is** — AI output used directly
- 🔧 **Modified** — AI output used with developer changes
- ❌ **Rejected** — AI output discarded
- 🐛 **Hallucination** — AI produced incorrect code that would have caused a bug

---

## Category 1: Problem Ideation

### AI-001 — Solution Direction Exploration
**Prompt:** *"I have observed my college canteen: students lose 10–20 minutes in queues during peak lunch hour. Staff can't predict demand. Items sell out without warning. Students miss class. Give me 5 different digital solution directions — not just a food ordering app."*

**AI Output:** 5 directions — (1) pre-ordering web app with time slots, (2) live queue display screen, (3) WhatsApp ordering bot, (4) restaurant-style reservation system, (5) IoT sensor queue counter.

**Decision:**
- ✅ Adopted: Direction 1 (pre-ordering with time slots) — directly matches *"I want to order before I leave class"* (Priya interview)
- ❌ Rejected: Direction 2 (display screen) — read-only information, students still queue
- ❌ Rejected: Direction 3 (WhatsApp bot) — no database, no admin panel, not scalable
- ❌ Rejected: Direction 4 (reservation system) — over-engineered for a canteen
- ❌ Rejected: Direction 5 (IoT sensors) — hardware cost, out of project scope

**Human reasoning for adoption:** Priya said explicitly: *"I want to order, not just see the queue."* The solution must eliminate the queue, not merely inform about it.

---

### AI-002 — Feature Scope Definition
**Prompt:** *"What features must a real college canteen pre-ordering system have for a 40% project milestone? System must be real, not a mockup. Student registration, ordering, pickup time, token, order tracking. Admin manages orders and menu."*

**AI Output:** List of 20+ features across auth, menu, cart, ordering, AI prediction, admin.

**Decision:**
- ✅ Adopted: JWT + bcrypt authentication, cart sync, digital token (ORD-MMDD format), PENDING→ACCEPTED→PREPARING→READY→COLLECTED workflow, kitchen queue with urgency flags
- ❌ Rejected: Razorpay payment gateway — college canteens pay at counter; adds complexity without solving the core problem for this milestone
- ❌ Rejected: Firebase push notifications — requires service worker + HTTPS + app install; 15-second polling achieves same result for web
- ❌ Rejected: QR code token scanning — a readable token number (ORD-0929-7441) is simpler and equally functional
- ❌ Rejected: Post-order star ratings — deferred to future milestone

---

## Category 2: Algorithm Design

### AI-003 — Pickup Slot Prediction Algorithm
**Prompt:** *"Design an algorithmic pickup-time prediction for a college canteen. Must use live database data: active orders per 15-min slot, item preparation times, current kitchen load. No ML libraries. Pure algorithm. Give formula and scoring."*

**AI Output:**
```
score = 100 - (load_penalty) - (peak_penalty) + (wait_bonus)
where:
  load_penalty = active_orders_in_slot × 10
  peak_penalty = 15 if hour in [12, 13] else 0
  wait_bonus   = max(0, 30 - minutes_until_slot)
```

**Decision:**
- 🔧 Modified: Changed `load_penalty = × 10` → `× 8`. With ×10, any slot with 5+ orders scored below 50 — marking moderate loads as "Very Busy". Testing with ×8 gave a more useful distribution.
- 🔧 Modified: Expanded peak hours from `[12, 13]` to `[8, 9, 12, 13, 14]`. Observation Session 2 confirmed breakfast peak (8:30–9:00 AM) is equally problematic. AI had no access to this field data.
- 🔧 Added: `basePrepTime = max(item.prepTimeMinutes) + ceil(totalQuantity × 1.5)`. AI formula only considered load; ignored that early slots are infeasible if food hasn't been prepared yet.

**Verification:** Algorithm tested manually with mock active-order counts at different hours. Confirmed "Very Busy" only appears at ≥10 concurrent orders, matching the manager's stated capacity (~10 orders per slot).

---

### AI-004 — Food Recommendation Algorithm
**Prompt:** *"Design a food recommendation algorithm using student order history. No external ML. Score items by: category preference, reorder frequency, price range match, item rating, availability. Give formula."*

**AI Output:**
```
score = (rating × 10) + category_bonus + reorder_bonus + price_bonus + popularity_bonus
category_bonus: top category=25, 2nd=15, 3rd=5
reorder_bonus:  frequency × 15 (uncapped)
price_bonus:    20 if within 20% of avg spend
popularity_bonus: (not included)
```

**Decision:**
- 🔧 Modified: Capped `reorder_bonus` at 30 (AI had no cap). Unlimited reorder bonus meant one heavily-repeated item dominated all recommendations, removing variety.
- 🔧 Modified: Price threshold 20% → 30%. After checking actual menu prices: ₹60 item vs ₹45 average (33% difference) is still comfortably affordable for a student. 20% was too strict.
- 🔧 Added: `popularity_bonus = +10 if totalRatings > 150, +5 more if > 250`. AI omitted social proof entirely. Interviews showed students name popular items specifically — social validation matters.
- 🔧 Added: **New-user fallback** — AI's version returned empty recommendations for users with no order history. Added: show top-rated items by `rating × totalRatings` as default. Without this, the recommendations page would be blank for every new user.

---

## Category 3: Database Design

### AI-005 — Prisma Schema Design
**Prompt:** *"Design a PostgreSQL schema using Prisma ORM. Models: User (student/admin), FoodItem (category enum, prep time, availability), CartItem, Order (status enum, timestamps), OrderItem. Include proper relations, unique constraints, cascade deletes."*

**AI Output:** Full Prisma schema with all 5 models.

**🐛 Hallucination H-1 — Unnecessary index directives:**
AI generated:
```prisma
@@unique([userId, foodItemId])
@@index([userId])       // AI added this
@@index([foodItemId])   // AI added this
```
Prisma automatically creates indexes on relation fields. Explicit indexes on FK fields that already have auto-indexes waste storage and are misleading. **Removed.**

**🐛 Hallucination H-2 — @updatedAt on immutable model:**
AI generated `updatedAt DateTime @updatedAt` on `OrderItem`. Order items are snapshot records — immutable once created. `@updatedAt` would add overhead updating a field that should never change. **Removed.**

**🔧 Added (not in AI output):** Status-specific timestamps on Order: `acceptedAt`, `preparingAt`, `readyAt`, `collectedAt`, `cancelledAt`. AI only included generic timestamps. These are essential for analytics (real prep time per order) and admin audit trail.

---

## Category 4: Backend Development

### AI-006 — JWT Auth Middleware
**Prompt:** *"Write Express JWT middleware: extract Bearer token, verify with jsonwebtoken, fetch user from Prisma, attach to req.user. Handle TokenExpiredError and JsonWebTokenError separately."*

**🐛 Hallucination H-3 — Wrong JWT payload key (CRITICAL):**
AI wrote:
```javascript
const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
```
The token was signed with `jwt.sign({ id: userId }, ...)` — the payload key is `id`, not `userId`. This would cause every authenticated request to receive a null user and return 401 — the entire authentication system would fail silently for all valid tokens.

**Fix:** Changed `decoded.userId` → `decoded.id`. Verified by tracing `signToken()` function.

**🔧 Security addition:** AI fetched entire user object including hashed password. Added explicit `select: { id, name, email, role, studentId }` to prevent password hash exposure in `req.user`.

---

### AI-007 — Order Creation Controller
**Prompt:** *"Write createOrder controller. Must: validate non-empty cart, check items available, calculate total server-side, generate unique token with collision retry, create order + items atomically in Prisma transaction, clear cart in same transaction."*

**🐛 Hallucination H-4 — Wrong transaction type (CRITICAL):**
AI wrote:
```javascript
const order = await prisma.$transaction([
  prisma.order.create({...}),
  prisma.cartItem.deleteMany({...})
]);
```
This is Prisma's *batch transaction* — operations run independently. If `order.create` fails, `cartItem.deleteMany` is NOT rolled back. The cart gets cleared even when the order fails.

**Fix:** Rewrote to interactive transaction:
```javascript
const order = await prisma.$transaction(async (tx) => {
  const newOrder = await tx.order.create({...});
  await tx.cartItem.deleteMany({ where: { userId: req.user.id } });
  return newOrder;
});
```
**Verification:** Tested by simulating order creation failure (invalid userId) — confirmed cart is preserved on failure.

**🔧 Added:** Unavailable item check before order creation. AI skipped this. Without it, a student could order an item marked unavailable between cart-add and checkout. Added explicit filter + 400 rejection.

**🔧 Added (during security audit):** pickupTime future-date validation. AI accepted any date string. Added:
```javascript
if (pickupDate <= now) return 400 'Pickup time must be in the future'
if (pickupDate > now + 24h) return 400 'Pickup cannot be more than 24 hours ahead'
```

**🔧 Added (during security audit):** Duplicate order prevention. Added 60-second window check:
```javascript
const recent = await prisma.order.findFirst({
  where: { userId, status: 'PENDING', createdAt: { gte: 60s ago } }
});
if (recent) return 409 'You just placed an order'
```

---

### AI-008 — Order Tracking Component
**Prompt:** *"Build React order tracking component. Poll backend every 15 seconds, show 5-step progress bar, countdown to pickup, pulse green when READY, stop polling at COLLECTED or CANCELLED."*

**🐛 Hallucination H-5 — Stale closure in setInterval:**
AI wrote:
```javascript
useEffect(() => {
  const interval = setInterval(fetchOrder, 15000);
  return () => clearInterval(interval);
}, []);  // ← empty dependency array
```
Empty dependency array means `fetchOrder` captures the initial `token` URL param. If the user navigates from one tracking page to another, the interval still polls with the *old* token.

**Fix:** Extracted to `useOrderPolling` custom hook with `useCallback` and correct dependencies:
```javascript
const fetchOrder = useCallback(async () => { ... }, [token]);
useEffect(() => {
  fetchOrder();
  const t = setInterval(fetchOrder, intervalMs);
  return () => clearInterval(t);
}, [fetchOrder, intervalMs]);
```
Auto-stop added for terminal statuses (COLLECTED, CANCELLED).

---

## Category 5: Validation & Security

### AI-009 — Input Validation (During Security Audit)
**Audit finding:** Cart `addToCart` accepted negative quantities.

**AI had not included** quantity validation on the add-to-cart endpoint. A user could POST `quantity: -99` which would decrement cart quantity via `{ increment: -99 }`.

**Fix added:**
```javascript
const qty = parseInt(quantity);
if (!Number.isInteger(qty) || qty < 1) return 400 'Quantity must be positive'
if (qty > 20) return 400 'Maximum 20 per item'
if (currentQty + qty > 20) return 409 'Exceeds maximum'
```

**AI had not validated** menu item creation — negative prices, empty names, invalid categories were all silently accepted.

**Fix added:** Full validation in `createFoodItem` and `updateFoodItem`:
```javascript
if (!name || name.trim().length < 2) → 400
if (price <= 0 || price > 10000) → 400
if (prepTimeMinutes < 1) → 400
if (!VALID_CATEGORIES.includes(category)) → 400
```

---

## Hallucination Summary

| ID | Severity | Location | What went wrong | Impact if undetected | Fix |
|----|----------|----------|----------------|---------------------|-----|
| H-1 | Low | Prisma schema | Redundant @@index on FK fields | Minor storage overhead | Removed |
| H-2 | Low | Prisma schema | @updatedAt on immutable OrderItem | Misleading data | Removed |
| H-3 | **CRITICAL** | Auth middleware | `decoded.userId` vs `decoded.id` | All authenticated requests fail with 401 | Changed to `decoded.id` |
| H-4 | **CRITICAL** | Order controller | Batch transaction instead of interactive | Cart cleared even when order fails | Rewrote to `prisma.$transaction(async tx => {})` |
| H-5 | Moderate | React hook | Stale closure in setInterval | Polls wrong order after navigation | Extracted to `useOrderPolling` with `useCallback` |

**Critical hallucinations caught: 2** — H-3 and H-4 would have caused complete feature failures affecting every user.

---

## What AI Did Well

| Area | AI Contribution Quality |
|------|------------------------|
| Schema structure | Correct model design, relations, cascade deletes, enum definitions |
| Algorithm skeleton | Pickup slot scoring formula was mathematically sound — required only parameter tuning |
| Recommendation structure | Multi-factor scoring approach was well-reasoned |
| Error middleware | P2002/P2025 Prisma error mapping was correct |
| Frontend component structure | Clean component patterns, consistent with React best practices |
| Tailwind class suggestions | Consistent, accessible styling patterns |

---

*AI Interaction Audit prepared: 30 September 2026*
