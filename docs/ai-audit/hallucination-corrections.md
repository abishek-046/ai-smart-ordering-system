# Hallucination Corrections Log
## AI-Smart Ordering System

**Purpose:** Record every specific instance where AI-generated code or design was incorrect, and document exactly how it was detected and corrected.

---

## H-3: JWT Payload Key Mismatch (CRITICAL)

### What AI generated
```javascript
// auth.middleware.js — AI version
const user = await prisma.user.findUnique({ 
  where: { id: decoded.userId }  // ← WRONG
});
```

### What was correct
```javascript
// auth.middleware.js — corrected version
const user = await prisma.user.findUnique({ 
  where: { id: decoded.id }  // ← CORRECT
});
```

### How it was detected
Traced the `signToken` function:
```javascript
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { ... });
//                ↑ payload key is 'id', not 'userId'
```
The middleware was looking for `decoded.userId` but the JWT payload only contains `{ id: ... }`. `decoded.userId` would be `undefined`, so `prisma.findUnique({ where: { id: undefined } })` would return `null`, causing every valid token to receive a 401 error.

### Impact if undetected
The entire authentication system would fail silently. Every logged-in user would be immediately logged out on any API call. The application would be completely non-functional for all authenticated users.

### Fix applied
Changed `decoded.userId` to `decoded.id` in `backend/src/middleware/auth.middleware.js`.

---

## H-4: Non-Atomic Transaction (CRITICAL)

### What AI generated
```javascript
// order.controller.js — AI version
const results = await prisma.$transaction([
  prisma.order.create({ data: { ... } }),
  prisma.cartItem.deleteMany({ where: { userId } })
]);
const order = results[0];
```

### What was correct
```javascript
// order.controller.js — corrected version
const order = await prisma.$transaction(async (tx) => {
  const newOrder = await tx.order.create({ data: { ... } });
  await tx.cartItem.deleteMany({ where: { userId: req.user.id } });
  return newOrder;
});
```

### How it was detected
Reviewed Prisma documentation:
- **Batch transaction** (`prisma.$transaction([...])`) — runs operations sequentially but does NOT guarantee rollback if one fails. Each operation is independent.
- **Interactive transaction** (`prisma.$transaction(async tx => {...})`) — wraps all operations in a single database transaction with full ACID guarantees.

The AI used the batch form. A test confirmed: if `order.create` throws (e.g., invalid foreign key), `cartItem.deleteMany` still executes in the batch form — the user's cart is cleared even though no order was created.

### Impact if undetected
Any order creation failure (DB constraint, invalid data) would clear the user's cart without creating an order. The student would lose their cart contents and receive no order, with no way to recover without re-adding items manually.

### Fix applied
Rewrote to interactive transaction in `backend/src/controllers/order.controller.js`. Verified by testing with an intentionally broken orderItem (missing foodItemId) — confirmed cart is preserved on failure.

---

## H-5: Stale Closure in setInterval

### What AI generated
```javascript
// OrderTracking.jsx — AI version
const fetchOrder = async () => {
  const res = await orderApi.trackByToken(token); // token from useParams
  setData(res.data);
};

useEffect(() => {
  fetchOrder();
  const interval = setInterval(fetchOrder, 15000);
  return () => clearInterval(interval);
}, []); // ← empty dependency array
```

### What was correct
```javascript
// useOrderPolling.js — corrected version (extracted to custom hook)
const fetchOrder = useCallback(async () => {
  const res = await orderApi.trackByToken(token);
  setData(res.data);
}, [token]); // ← token as dependency

useEffect(() => {
  fetchOrder();
  const t = setInterval(fetchOrder, intervalMs);
  return () => clearInterval(t);
}, [fetchOrder, intervalMs]); // ← correct deps
```

### How it was detected
Code review: `fetchOrder` closes over `token` from `useParams()`. With empty `[]` dependency array, React creates the interval once using the initial `fetchOrder` closure — which captures the initial token value. If the user navigates from `/track/ORD-A` to `/track/ORD-B`, the interval continues polling `ORD-A` because the closure is stale.

### Impact if undetected
Users navigating between order tracking pages would see data from the wrong order. After navigation, the polling would show stale data from the previously viewed order token until the component fully unmounts and remounts (which may not happen with React Router).

### Fix applied
Extracted polling logic to `useOrderPolling` custom hook with `useCallback` dependencies. Also added auto-stop for terminal statuses (COLLECTED, CANCELLED) — AI's version polled indefinitely even for completed orders.

---

## H-1: Unnecessary Database Indexes

### What AI generated
```prisma
model CartItem {
  // ...
  @@unique([userId, foodItemId])
  @@index([userId])      // ← unnecessary
  @@index([foodItemId])  // ← unnecessary
}
```

### What was correct
```prisma
model CartItem {
  // ...
  @@unique([userId, foodItemId])
  // No explicit indexes needed
}
```

### Why it was removed
Prisma automatically creates indexes on relation fields (foreign keys). Adding explicit `@@index` on fields that are already foreign key fields (and thus auto-indexed) doubles the index storage, slows write operations, and produces misleading schema documentation.

---

## H-2: @updatedAt on Immutable Record

### What AI generated
```prisma
model OrderItem {
  // ...
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt  // ← incorrect
}
```

### What was correct
```prisma
model OrderItem {
  // ...
  createdAt  DateTime @default(now())
  // No updatedAt — OrderItem is immutable
}
```

### Why it was removed
`OrderItem` records are snapshots of what was ordered at a specific price at order time. They should never be modified after creation. `@updatedAt` would add a field that increments on every write but should logically never be written — misleading for analytics and unnecessary overhead.

---

*Corrections log: 30 September 2026*
