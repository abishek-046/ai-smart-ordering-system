# Problem Definition
## AI-Smart Ordering System

**Derived from:** Empathy research (3 observation sessions + 5 interviews)  
**Date:** 14 September 2026

---

## 1. Problem Framing

### WHO is affected?
**Primary users:** College students with fixed academic schedules — particularly those with back-to-back classes and breaks of 15 minutes or less between periods. First-year students unfamiliar with canteen patterns are disproportionately affected.

**Secondary users:** Canteen counter staff and kitchen staff who operate under peak-hour pressure without demand data.

---

### WHERE does the problem occur?
The college canteen at Sri Venkateswara College of Engineering, specifically at the ordering counter and pickup area during peak service periods.

---

### WHEN does the problem occur?
Predictably at two daily concentrations:
- **Morning peak:** 8:30 AM – 9:00 AM (students rushing before 8:50 AM first lecture)
- **Lunch peak:** 12:45 PM – 1:15 PM (students finishing 12:00–12:45 class block)

These peaks coincide precisely with class schedule boundaries — the problem is structurally caused by academic timetabling, not random demand.

---

### WHAT is the actual problem?

The college canteen operates as a **walk-in, information-free, first-come-first-served system** in a context where demand arrives in concentrated, predictable bursts driven by fixed academic schedules. There is no mechanism to:

1. Pre-order food before arriving at the canteen
2. Check item availability remotely
3. Know preparation or wait time in advance
4. Receive a guaranteed, plannable pickup time
5. Track order status while in class

This creates a situation where students must physically queue with no information about outcome, and canteen staff must serve without any advance demand knowledge.

---

### WHY does this cause friction?

The mismatch between **fixed demand peaks** (caused by class schedule boundaries) and **zero information flow** (caused by the walk-in system) creates several cascading problems:

**For students:**
- Peak queue wait: 12–20 minutes (observed)
- ~40% of peak-hour visitors abandon the canteen without food (estimated from observation)
- 2–3 class lateness incidents per student per week (Priya interview)
- Students who adapt avoid peak hours — but sacrifice academic break time

**For canteen operations:**
- ~15% daily food waste (manager interview) — overprepared to cover unknown demand
- Staff error rate increases under peak pressure (2 errors in 45-minute observation)
- Kitchen batching impossible without advance orders
- No tool to spread demand across time

---

### IMPACT (Measurable Problems)

| Problem | Observable Metric |
|---------|------------------|
| Queue wait time | 12–20 minutes at peak (observed) |
| Food abandonment | ~40% walkaway rate at peak (estimated, Session 1) |
| Academic tardiness | Min. 1 confirmed late-to-class per 45-min observation session |
| Food waste | ~10–15% daily (manager stated) |
| Staff errors | 2 in 45-minute peak session (observed) |
| Student meal skipping | "At least twice a week" (Priya interview) |

---

## 2. Point-of-View (POV) Statement

> **A college student with a 15-minute lunch break** needs **a way to pre-order canteen food and receive a guaranteed pickup time before leaving the classroom** because **the current walk-in, information-free system means they cannot know queue length, item availability, or preparation time before committing to waiting — causing daily meal skipping, class tardiness, and preventable student stress.**

---

## 3. Official Problem Statement

> **College canteen students cannot plan their meal around their class schedule because the canteen operates as a fully walk-in, information-free system. There is no pre-ordering, no remote availability check, no preparation time estimate, and no plannable pickup time. This causes daily time loss (12–20 minutes in queues), meal skipping (~40% walkaway rate at peak), and class tardiness for students with back-to-back schedules — while simultaneously causing ~15% daily food waste and operational errors for canteen staff who have no advance demand data.**

---

## 4. How Might We (HMW) Questions

Derived from the problem statement to guide ideation:

| # | HMW Question | Pain Point Addressed |
|---|-------------|---------------------|
| HMW-1 | ...let students place food orders before leaving the classroom? | P1, P2, P5 |
| HMW-2 | ...give students a guaranteed, plannable pickup time? | P4, P5 |
| HMW-3 | ...show students real-time item availability before they commit? | P3 |
| HMW-4 | ...give students a unique identifier to collect food without queuing? | P1, P7 |
| HMW-5 | ...show students live order status so they know when to walk over? | P4, P5 |
| HMW-6 | ...help canteen staff know how much of each item to prepare in advance? | P8, P9 |
| HMW-7 | ...intelligently spread student pickup across time slots to reduce peak concentration? | P1, P10 |
| HMW-8 | ...give kitchen staff a digital, organised queue sorted by pickup time? | P7, P9 |

---

## 5. Measurable Objectives

The following measurable objectives were defined (not claimed as achieved — these are the design targets):

| Objective | Measure | Baseline (observed) |
|-----------|---------|-------------------|
| Reduce queue wait for pre-ordering students | Target: < 2 min collection time | Current: 12–20 min |
| Improve pickup time predictability | Target: Predicted vs actual within 5 min | Current: No prediction exists |
| Reduce sold-out discovery after waiting | Target: 0% — availability checked at order time | Current: Discovered at counter after full wait |
| Reduce demand concentration at peak | Target: Measurable spread across 15-min slots | Current: 80% demand in 20-min window |
| Improve advance kitchen demand visibility | Target: Portion quantities known 30 min ahead | Current: 0 min ahead |

---

## 6. Problem → Solution Mapping

Each problem component maps directly to a built feature:

| Problem Component | Feature Built | File |
|------------------|---------------|------|
| No pre-ordering | Cart + Checkout flow | `frontend/src/pages/student/Cart.jsx` |
| No availability check | Real-time availability from DB at add-to-cart and at checkout | `backend/src/controllers/cart.controller.js` |
| No pickup time prediction | AI Smart Pickup Time — 12 scored slots from live DB | `backend/src/services/ai.service.js` |
| No order tracking | Live tracking page, 15-second polling | `frontend/src/hooks/useOrderPolling.js` |
| No unique identifier | Digital token (ORD-MMDD-XXXX) generated on order creation | `backend/src/utils/tokenGenerator.js` |
| Staff no advance demand data | Kitchen Queue sorted by pickup time | `frontend/src/pages/admin/KitchenQueue.jsx` |
| Kitchen load invisible | AI Kitchen Predictions dashboard | `frontend/src/pages/admin/AIPredictions.jsx` |
| Food waste from overpreparation | Analytics showing demand patterns | `frontend/src/pages/admin/Analytics.jsx` |

---

*Problem definition derived from field research: 9–14 September 2026*  
*Sri Venkateswara College of Engineering*
