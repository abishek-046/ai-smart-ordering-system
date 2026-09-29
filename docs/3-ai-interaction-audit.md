# AI Interaction Audit
## AI-Smart Ordering System — College Canteen
### Design Thinking Phase 3: AI Usage Transparency

**Project:** AI-Smart Ordering System  
**Team Member:** Abishek  
**AI Tool Used:** Kiro (AI-powered IDE) — powered by Claude  
**Audit Period:** September 2026  
**Purpose:** To document all AI interactions during ideation and development, record what was adopted, what was rejected, what hallucinations occurred, and how they were corrected.

---

## 1. What This Document Is

The reviewer requires evidence that AI was used as a **thinking partner**, not as a blind code generator. This audit proves that:
1. I gave the AI specific, thoughtful prompts grounded in real research
2. I critically evaluated every AI output before accepting it
3. I rejected or corrected outputs that were wrong, hallucinated, or did not fit the real problem
4. The final system reflects deliberate decisions, not uncritical copy-paste

---

## 2. Ideation Phase — AI Prompts & Responses

### Interaction AI-001
**Stage:** Ideation  
**Date:** 14 September 2026  
**My Prompt:**
> *"I have done research at my college canteen. Students waste 10–20 minutes in queue daily during lunch. Staff can't predict demand. Items sell out without warning. What digital solutions could address this? Give me 5 different directions, not just a food ordering app."*

**AI Response Summary:**
The AI gave 5 directions:
1. A pre-ordering web app with time-slot booking
2. A live queue display screen at the canteen entrance
3. A WhatsApp bot for ordering
4. A loyalty and reservation system (like restaurant table booking)
5. An IoT sensor-based queue counter

**What I Adopted:** Direction 1 (pre-ordering with time-slot booking) — directly aligned with what students asked for in interviews (*"I want to order before I leave class"*)

**What I Rejected:**
- Direction 2 (queue display screen) — this is read-only and doesn't solve the problem, it just informs about it. Students still have to queue.
- Direction 3 (WhatsApp bot) — not scalable, no database, no order tracking, no admin panel
- Direction 4 (loyalty/reservation) — over-engineered for a college canteen with small transactions
- Direction 5 (IoT sensors) — requires hardware procurement, out of scope for this project

**Why I Rejected Them:** Based on interview data. Priya specifically said *"I want to order, not just see the queue."* The solution had to eliminate the queue, not just visualise it.

---

### Interaction AI-002
**Stage:** Ideation  
**Date:** 14 September 2026  
**My Prompt:**
> *"For the pre-ordering direction — what specific features must a college canteen pre-ordering system have for the 40% project milestone? The system must be real, not a prototype. Students should be able to register, order food, get a pickup time, receive a token, and track their order. Admin should manage orders and menu."*

**AI Response Summary:**
The AI listed 20+ features across authentication, menu, cart, ordering, AI prediction, and admin modules.

**What I Adopted:**
- JWT authentication with bcrypt (industry standard, appropriate for student data)
- Cart system with real-time sync
- Digital token generation (ORD-MMDD-XXXX format)
- Order status workflow: PENDING → ACCEPTED → PREPARING → READY → COLLECTED
- AI pickup slot scoring based on current queue load and prep time
- Admin kitchen queue sorted by pickup time with urgency flags

**What I Rejected:**
- Payment gateway integration — AI suggested Razorpay. Rejected because the 40% milestone focuses on ordering flow, not payment. College canteens also typically collect payment at counter.
- Push notifications — AI suggested Firebase Cloud Messaging. Rejected as it requires app installation and Google account setup. Live order tracking with 15-second polling achieves the same result in a web context.
- QR code scanning for token — AI suggested generating a QR. Rejected because it adds complexity without solving the core problem. A readable token number (ORD-0915-2259) is simpler and more accessible.
- Star rating system for food — AI suggested post-order ratings. Rejected for 40% scope. Deferred to later milestone.

---

### Interaction AI-003
**Stage:** AI Feature Design  
**Date:** 15 September 2026  
**My Prompt:**
> *"Design an algorithm for AI pickup time prediction for a college canteen. The algorithm must use real data from the database — active orders per time slot, item preparation times, current kitchen load. No machine learning libraries needed. Pure algorithmic logic. Give me the formula and scoring method."*

**AI Response Summary:**
The AI proposed a slot scoring algorithm:
```
score = 100 - (load_penalty) - (peak_penalty) + (wait_bonus)
where:
  load_penalty = active_orders_in_slot × 8
  peak_penalty = 15 if hour in [8,9,12,13,14] else 0
  wait_bonus = max(0, 30 - minutes_until_slot)
```

**What I Adopted:** The core formula — load penalty + peak penalty + wait bonus approach. This was mathematically sound and mapped to real-world canteen behaviour (peak hours genuinely have more load).

**What I Rejected/Modified:**
- AI originally set `load_penalty = active_orders × 10`. I changed it to `× 8` after testing — with 10, any slot with 5+ orders scored below 50 which made too many slots appear "Very Busy" when they were just moderately busy.
- AI suggested the peak hours should be `[12, 13]` only. I expanded to `[8, 9, 12, 13, 14]` based on my Observation Log Session 2 which showed breakfast (8:30–9:00 AM) was also a peak period.
- AI did not account for item preparation time variance — I added `basePrepTime = max(item.prepTimeMinutes) + ceil(totalQuantity × 1.5)` to ensure the earliest possible slot reflects actual kitchen capacity.

---

### Interaction AI-004
**Stage:** AI Feature Design  
**Date:** 15 September 2026  
**My Prompt:**
> *"Design an algorithm for food recommendations in a college canteen app. Use the student's order history from the database. No external ML API. Score items based on: category preference, reorder frequency, price range match, item rating, and availability. Give me the scoring formula."*

**AI Response Summary:**
The AI proposed:
```
score = (rating × 10) + category_bonus + reorder_bonus + price_bonus + popularity_bonus
```
With specific values for each component.

**What I Adopted:** The overall multi-factor scoring structure. It was well-reasoned and matched how recommendation systems work in practice.

**What I Modified:**
- AI set `category_bonus` as 25/15/5 for top 3 categories. I kept this.
- AI set `reorder_bonus = frequency × 15` with no cap. I capped it at 30 to prevent a single heavily-ordered item from dominating all recommendations. Users should see variety.
- AI set `price_bonus = 20 if within 20% of average`. I changed threshold to 30% after checking actual menu prices — a ₹60 item vs ₹45 average is 33% difference but is still reasonably affordable for a student.

**What I Added (not in AI response):**
- `popularity_bonus`: +10 if totalRatings > 150, +5 more if > 250. AI did not include social proof. I added this because in interviews students mentioned popular items by name — social proof matters in a canteen context.
- Fallback for new users with no order history: show overall top-rated items sorted by rating × totalRatings. AI's original code would return an empty recommendation for first-time users. I caught this and added the fallback.

---

### Interaction AI-005  
**Stage:** Database Design  
**Date:** 15 September 2026  
**My Prompt:**
> *"Design a PostgreSQL schema using Prisma ORM for a college canteen ordering system. Models needed: User (student and admin roles), FoodItem (with category enum, preparation time, availability), CartItem, Order (with status enum and timestamps for each status change), OrderItem. Include proper relations, unique constraints, and cascade deletes."*

**AI Response Summary:**
The AI generated a full Prisma schema with all 5 models.

**What I Adopted:** Overall structure, enum definitions, relation syntax, `@@map` for table naming, `@@unique` constraint on CartItem.

**What I Corrected — Hallucination #1:**
The AI generated this relation on CartItem:
```prisma
@@unique([userId, foodItemId])
@@index([userId])  // AI added this
@@index([foodItemId])  // AI added this
```
The `@@index` directives are valid Prisma syntax but were unnecessary — Prisma automatically creates indexes on relation fields in PostgreSQL. Adding explicit indexes on already-indexed foreign keys wastes storage. I removed them.

**What I Corrected — Hallucination #2:**
The AI generated `updatedAt DateTime @updatedAt` on `OrderItem`. This is incorrect — order items are immutable once created (you can't change what you ordered after the order is placed). The `@updatedAt` decorator would add unnecessary overhead updating a field that should never change. I removed it and kept only `createdAt`.

**What I Added:**
- Status-specific timestamps on Order model: `acceptedAt`, `preparingAt`, `readyAt`, `collectedAt`, `cancelledAt`. AI only included `createdAt` and `updatedAt`. These additional timestamps are essential for analytics (calculating actual preparation time per order) and for the admin to see when each status was set.

---

### Interaction AI-006
**Stage:** Development  
**Date:** 15 September 2026  
**My Prompt:**
> *"Write an Express.js middleware for JWT authentication. It should: extract Bearer token from Authorization header, verify with jsonwebtoken, fetch user from Prisma database, attach to req.user. Handle TokenExpiredError and JsonWebTokenError separately with appropriate messages."*

**AI Response Summary:**
The AI generated a clean auth middleware.

**What I Adopted:** Overall structure — try/catch, token extraction, specific error handling for expired vs invalid tokens.

**What I Corrected — Hallucination #3:**
The AI wrote:
```javascript
const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
```
The field is `decoded.id` not `decoded.userId` — because when signing the token I used `jwt.sign({ id: userId }, ...)`. The AI assumed the payload key would be `userId` but I had defined it as `id`. This would have caused all authenticated requests to fail silently (user would be null and middleware would return 401 for every valid token). I caught this by tracing the `signToken` function and corrected it to `decoded.id`.

**What I Added:**
- Select only necessary fields from the database: `{ id, name, email, role, studentId }`. The AI fetched the entire user object including the hashed password. This is a security risk — the password hash would be attached to `req.user` and could potentially be exposed in error logs or accidentally serialised. I added an explicit select to exclude the password field.

---

### Interaction AI-007
**Stage:** Development  
**Date:** 15 September 2026  
**My Prompt:**
> *"Write the createOrder controller for a canteen ordering system. It must: validate cart is not empty, check all items are still available, calculate total amount and estimated prep time, generate a unique token with collision retry, create the order and order items atomically using Prisma transaction, and clear the cart in the same transaction."*

**AI Response Summary:**
The AI generated the order creation logic.

**What I Adopted:** Prisma `$transaction` usage, token collision retry loop, cart clearing within the transaction.

**What I Corrected — Hallucination #4:**
The AI wrote the transaction as:
```javascript
const order = await prisma.$transaction([
  prisma.order.create({...}),
  prisma.cartItem.deleteMany({...})
]);
```
This is the **batch transaction** syntax in Prisma, which runs operations independently — it does NOT guarantee that if `order.create` fails, the `cartItem.deleteMany` is rolled back. For true atomicity (either both succeed or both fail), Prisma requires the **interactive transaction** syntax with a callback function:
```javascript
const order = await prisma.$transaction(async (tx) => {
  const newOrder = await tx.order.create({...});
  await tx.cartItem.deleteMany({...});
  return newOrder;
});
```
This is a subtle but critical bug — using the wrong transaction type could result in carts being cleared even when order creation fails. I corrected it to the interactive transaction pattern.

**What I Added:**
- Unavailable item validation before creating the order. AI skipped this check. Without it, a student could successfully order an item that was marked unavailable between the time they added it to cart and when they checked out. I added:
```javascript
const unavailable = cartItems.filter(ci => !ci.foodItem.isAvailable);
if (unavailable.length > 0) return res.status(400).json({...});
```

---

### Interaction AI-008
**Stage:** Frontend Development  
**Date:** 15–16 September 2026  
**My Prompt:**
> *"Build a React component for live order tracking. It should: poll the backend every 15 seconds, show a progress bar with 5 steps (PENDING, ACCEPTED, PREPARING, READY, COLLECTED), display countdown to pickup time, show a pulsing green indicator when READY, and automatically stop polling when order reaches COLLECTED or CANCELLED status."*

**AI Response Summary:**
The AI generated a tracking component using `useEffect` with `setInterval`.

**What I Adopted:** Overall component structure, status step rendering, polling logic.

**What I Corrected — Hallucination #5:**
The AI wrote:
```javascript
useEffect(() => {
  const interval = setInterval(fetchOrder, 15000);
  return () => clearInterval(interval);
}, []);  // empty dependency array
```
This has a **stale closure bug** — `fetchOrder` inside the interval captures the initial state of `token` (from the URL param). If the component re-renders with a different token (e.g., navigating between orders), the interval still calls the old `fetchOrder` with the old token. The correct pattern uses `useCallback` with proper dependencies:
```javascript
const fetchOrder = useCallback(async () => { ... }, [token]);
useEffect(() => {
  fetchOrder();
  const interval = setInterval(fetchOrder, intervalMs);
  return () => clearInterval(interval);
}, [fetchOrder, intervalMs]);
```
I extracted this into a reusable `useOrderPolling` custom hook (`frontend/src/hooks/useOrderPolling.js`) that handles this correctly and can be reused.

**What I Added:**
- Auto-stop polling for terminal statuses. AI's version polled forever, even after the order was collected. Unnecessary API calls waste server resources and battery. I added:
```javascript
const TERMINAL_STATUSES = ['COLLECTED', 'CANCELLED'];
if (TERMINAL_STATUSES.includes(res.data.order?.status)) {
  clearInterval(intervalRef.current);
}
```

---

## 3. Hallucination Log Summary

| # | Location | What AI Got Wrong | Impact if Undetected | How I Fixed It |
|---|----------|-------------------|---------------------|----------------|
| H-1 | Prisma schema | Unnecessary `@@index` on FK fields | Minor performance overhead | Removed redundant index directives |
| H-2 | Prisma schema | `@updatedAt` on immutable OrderItem | Misleading data, unnecessary DB writes | Removed `updatedAt` from OrderItem |
| H-3 | Auth middleware | `decoded.userId` instead of `decoded.id` | **Critical** — all authenticated requests would return 401 | Changed to `decoded.id` to match JWT payload |
| H-4 | Order controller | Batch transaction instead of interactive transaction | **Critical** — cart could clear even when order fails | Rewrote using `prisma.$transaction(async (tx) => {...})` |
| H-5 | Order tracking component | Stale closure in setInterval | Polling wrong order after navigation | Used `useCallback` + proper dependencies, extracted to hook |

**Critical issues caught: 2 (H-3, H-4)**  
**Moderate issues caught: 1 (H-5)**  
**Minor issues caught: 2 (H-1, H-2)**

---

## 4. What AI Did Well

| Area | AI Contribution |
|------|----------------|
| Schema structure | Clean Prisma model design with correct relations and cascade deletes |
| Algorithm skeleton | Pickup slot scoring formula was mathematically sound and required only tuning |
| Recommendation system | Multi-factor scoring approach was well-structured |
| JWT middleware | Correct error handling pattern for expired vs invalid tokens |
| Error handler | Clean Express error middleware with Prisma error code mapping (P2002, P2025) |
| Tailwind styling | Consistent, accessible component styling throughout the frontend |

---

## 5. AI as a Tool, Not an Author

The AI accelerated development significantly — writing boilerplate, suggesting patterns, and structuring components. However, every output was reviewed against:

1. **The research data** — does this feature solve a real pain point identified in interviews?
2. **Technical correctness** — does this code actually work, or does it look like it works?
3. **Security** — does this expose any sensitive data or create vulnerabilities?
4. **Scope** — is this part of the 40% milestone, or is it scope creep?

The five hallucinations caught during this project demonstrate that AI outputs require careful human review. Two of them (H-3 and H-4) would have caused the application to fail completely for all users if they had not been caught and corrected.

---

## 6. Prompting Lessons Learned

| Lesson | Example |
|--------|---------|
| **Specific prompts get better outputs** | "Use Prisma interactive transaction syntax" produces better code than "create an order" |
| **Ask for reasoning, not just code** | "Explain the formula before writing it" helped me validate the algorithm logic |
| **Always test edge cases AI skips** | AI rarely handles the "new user with no history" case — always test this |
| **Cross-check with documentation** | H-4 (transaction syntax) was caught by checking the official Prisma docs |
| **Reject scope creep suggestions** | AI frequently suggests "while you're at it, add..." — stay focused on the milestone |

---

*Document prepared for Design Thinking Review — 40% to 75% Milestone*  
*Abishek — [Your College Name]*
