# Problem Statement
## AI-Smart Ordering System — College Canteen
### Design Thinking Phase 2: Define

**Project:** AI-Smart Ordering System  
**College:** [Your College Name]  
**Team Member:** Abishek  
**Date:** 14 September 2026

---

## 1. Raw Data from Empathy Phase

Before writing the problem statement, I organised all the pain points collected from observations and interviews into themes.

### Pain Points Collected

| # | Pain Point | Who Mentioned It | Frequency |
|---|-----------|-----------------|-----------|
| 1 | Long queue during peak hours (12:45–1:15 PM, 8:30–9:00 AM) | Priya, Karthik, Meena, Observation Log | Very High |
| 2 | No visibility into queue length before arriving | Priya, Karthik | High |
| 3 | Item sold out only discovered after waiting | Priya, Karthik, Observation Log | High |
| 4 | No preparation time estimate given | Meena, Karthik, Observation Log | High |
| 5 | Students late to class due to canteen wait | Priya, Observation Log Session 1 | High |
| 6 | Students skipping meals entirely | Priya, Observation Log Session 1 | Medium |
| 7 | Staff making errors under peak pressure | Rajan, Observation Log | Medium |
| 8 | Kitchen cannot predict demand — daily food waste (~15%) | Canteen Manager | Medium |
| 9 | No batching of similar orders — inefficient preparation | Observation Log Session 2 | Medium |
| 10 | Students with tight schedules most severely affected | Priya, Observation Log | High |

### Insight Clustering (Affinity Grouping)

Grouping the above into three core themes:

**Theme A — Student Time Loss**
Points 1, 2, 5, 6, 10 → Students lose meaningful break time to an unpredictable, unoptimised queue system

**Theme B — Information Gap**
Points 2, 3, 4 → Neither students nor staff have real-time information about queue state, availability, or preparation time

**Theme C — Operational Inefficiency**
Points 7, 8, 9 → Without advance demand data, staff cannot coordinate, leading to errors, waste, and poor kitchen throughput

---

## 2. Point-of-View (POV) Statement

Using the standard Design Thinking POV format:

> **[User] needs [need] because [insight]**

| Component | Value |
|-----------|-------|
| **User** | A college student with 10–15 minutes of lunch break between back-to-back classes |
| **Need** | A way to pre-order canteen food and receive a guaranteed pickup time before leaving their classroom |
| **Insight** | Because arriving at the canteen without prior information means unpredictable waiting that regularly causes students to miss class time, skip meals, or settle for food they didn't want |

**Full POV Statement:**

> *A time-constrained college student needs a reliable way to pre-order canteen food and receive a confirmed pickup time in advance, because the current walk-in queue system gives zero information about wait times, item availability, or preparation status — causing students to lose 10–20 minutes daily, miss classes, and regularly skip meals.*

---

## 3. The Single Precise Problem Statement

After synthesising all research data, the core problem is defined as:

---

### ✦ Official Problem Statement

> **"College canteen students have no way to plan their meal around their class schedule because the canteen operates as a fully walk-in, information-free system — there is no pre-ordering, no queue visibility, no item availability check, and no preparation time estimate. This causes daily time loss, meal skipping, and class tardiness for students with tight academic schedules, while simultaneously causing food waste and operational errors for canteen staff who cannot predict demand."**

---

## 4. Problem Scope Definition

To ensure the problem statement is precise and actionable, the scope is defined as follows:

### In Scope
- Students ordering food during college hours (breakfast, lunch, snack breaks)
- The physical queue and waiting experience at the canteen counter
- Information asymmetry between students and canteen staff
- Preparation time unpredictability
- Food availability uncertainty
- Canteen staff coordination during peak hours

### Out of Scope (for this phase)
- External food delivery (Swiggy, Zomato) — this is a canteen-specific problem
- Nutritional tracking or dietary management
- Payment gateway integration (to be addressed in later phases)
- Multi-canteen coordination

---

## 5. "How Might We" Questions

Derived directly from the problem statement to guide the ideation phase:

| # | How Might We... |
|---|----------------|
| HMW-1 | ...allow students to place food orders before they leave their classroom? |
| HMW-2 | ...give students a guaranteed pickup time so they can plan around their class schedule? |
| HMW-3 | ...show students the current queue length and item availability in real time? |
| HMW-4 | ...help canteen staff know in advance how many portions of each item to prepare? |
| HMW-5 | ...reduce the coordination errors that happen when staff are overwhelmed at peak hours? |
| HMW-6 | ...give students a unique identifier (token) so they can collect their order without standing in a queue? |
| HMW-7 | ...predict which time slots will be busiest so the AI can recommend less congested pickup times? |
| HMW-8 | ...ensure students only order items that are currently available, before they commit? |

---

## 6. Why This Problem Is Worth Solving

### Impact Quantification

Based on observation data:
- **500+ students** use the canteen daily
- Average peak hour wait: **12–18 minutes**
- Students who skip meals due to queue: estimated **~40 students/day** (observed 40% of queue walkaways during Session 1)
- Food wasted daily: **~15%** of prepared stock (from Manager Interview)
- Classes missed or entered late due to canteen delay: **observed minimum 3 incidents in one 45-min session**

### Who Is Most Affected
1. Students with consecutive class periods and short breaks
2. First-year students unfamiliar with canteen patterns
3. Students with dietary restrictions (fewer fallback options if first choice is sold out)

### Why Existing Solutions Are Insufficient
- **No current digital solution** exists for this canteen
- **Physical tokens** are not used
- **Estimated wait signs** do not exist
- **WhatsApp/social media** ordering is ad hoc, unreliable, and not scalable

---

## 7. Validation of Problem Statement

The problem statement was validated against the research data using three checks:

**Check 1 — Does it match what users said?**  
✅ Yes — Priya said *"I want to order before I leave class."* Karthik said *"I waited 20 minutes then they said it's finished."* Both match the statement directly.

**Check 2 — Does it avoid jumping to a solution?**  
✅ Yes — the statement describes the problem (no pre-ordering, no visibility, no estimate) without prescribing a specific technology. A mobile app, a website, or an SMS system could all be potential responses.

**Check 3 — Is it specific enough to build from?**  
✅ Yes — it names the exact friction points (walk-in system, information gap, preparation time, demand unpredictability) which directly map to the features built in the prototype:
- Pre-ordering → Cart + Checkout
- Pickup time → Smart Pickup Time with AI prediction
- Queue visibility → AI load prediction for admins
- Demand forecasting → Kitchen Queue + AI Predictions dashboard
- Token → Digital order token on Order Confirmation page

---

## 8. Problem Statement → Solution Mapping

| Problem Component | Solution Built |
|------------------|---------------|
| No pre-ordering | Cart system + Checkout flow |
| No pickup time estimate | AI Smart Pickup Time page — algorithmic slot scoring |
| No item availability check | Menu page shows real-time availability from DB |
| No queue visibility | Admin AI Predictions dashboard + Kitchen Queue |
| No order tracking | Live Order Tracking with 15-second polling |
| Staff demand unpredictability | Kitchen Queue sorted by pickup time + Admin Orders |
| No unique identifier per order | Digital Token generated on order creation |
| Food waste from overpreparation | AI Kitchen Load Prediction helps staff plan portions |

---

*Document prepared for Design Thinking Review — 40% to 75% Milestone*  
*Abishek — [Your College Name]*
