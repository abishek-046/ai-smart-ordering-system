# User Testing & Feedback Report
## AI-Smart Ordering System — College Canteen
### Design Thinking Phase 4: Test

**Project:** AI-Smart Ordering System  
**Team Member:** Abishek  
**Testing Period:** 16–18 September 2026  
**Testers:** 3 real users (2 students, 1 canteen staff)  
**Application URL during testing:** http://localhost:5173  
**Backend:** http://localhost:5000

---

## 1. Testing Methodology

### Approach
I used **moderated usability testing** — each tester was given a set of tasks to complete while I observed silently. I did not help them unless they were completely stuck. After completing the tasks, I conducted a short debrief interview to capture their overall impressions.

### Why These 3 Testers
- **Tester 1 (Divya)** — 2nd year student, daily canteen user, represents the primary persona
- **Tester 2 (Arjun)** — 3rd year student, occasional canteen user, represents a less frequent user
- **Tester 3 (Rajan)** — Canteen counter staff, represents the admin persona

### Task List Given to Each Tester
Each tester was handed this printed task sheet:

```
TASK SHEET — AI Smart Ordering System
--------------------------------------
Please try to complete each task on your own.
Say out loud what you are thinking as you go.

Student Tasks:
  Task 1: Create a new account with your details
  Task 2: Browse the menu and find something you'd like to eat
  Task 3: Add 2 items to your cart
  Task 4: Use the AI Pickup Time feature and select a time slot
  Task 5: Place your order
  Task 6: Find your order token
  Task 7: Track your order status
  Task 8: View your order history

Admin Tasks (Rajan only):
  Task 9:  Login as admin
  Task 10: Find the order that was just placed
  Task 11: Accept the order and move it to Preparing
  Task 12: Mark the order as Ready
  Task 13: Check the Kitchen Queue
  Task 14: Add a new menu item
```

### Metrics Tracked Per Task
- ✅ Completed without help
- ⚠️ Completed with difficulty / confusion
- ❌ Failed / could not complete

---

## 2. Tester 1 — Divya M. (Student)

**Profile:** 2nd Year CSE, 20 years old, uses Swiggy/Zomato regularly  
**Date:** 16 September 2026, 3:00 PM  
**Duration:** 28 minutes  
**Device:** Her own laptop (Windows, Chrome browser)

### Task Results

| Task | Result | Time Taken | Notes |
|------|--------|-----------|-------|
| Task 1: Register | ✅ | 1m 45s | Filled all fields smoothly |
| Task 2: Browse menu | ✅ | 2m 10s | Used category filter tabs correctly |
| Task 3: Add 2 items to cart | ✅ | 1m 20s | Added items, checked cart count in navbar |
| Task 4: AI Pickup Time | ⚠️ | 3m 30s | Confused initially — expected it to be part of checkout, not a separate page |
| Task 5: Place order | ✅ | 1m 50s | Smooth once she understood the flow |
| Task 6: Find order token | ✅ | 0m 30s | Immediately noticed the large token display |
| Task 7: Track order | ✅ | 1m 15s | Found the Track button, understood the progress bar |
| Task 8: Order history | ✅ | 0m 45s | Found it in the nav easily |

**Overall Success Rate: 8/8 tasks completed (7 clean, 1 with difficulty)**

### Verbal Feedback During Test (Think-Aloud)

> *"Oh nice, the menu looks clean. I can filter by category — that's exactly how Swiggy works."*

> *(On Cart page)* *"So now I need to checkout... okay there's a 'Select Pickup Time' button. Let me click that... oh it took me to a separate page. I thought it would be in checkout itself."*

> *(On Smart Pickup Time page)* *"Oh okay I see — it's showing me the best time slots. The green 'Recommended' badge is clear. I'll select that one."*

> *(On Order Confirmation)* *"ORD-0916-4821 — that's my token. Nice, it's big and visible. I like that."*

> *(On Order Tracking)* *"Oh there's a progress bar. It says Pending. Cool. And there's a live indicator — like it's showing me it updates automatically."*

### Post-Test Debrief Interview

**Q: What did you like most?**
> "The AI Pickup Time is genuinely useful. It showed me which slots are busy and recommended the least congested one. I've never seen this in any food ordering app before. Even Swiggy doesn't have this."

**Q: What confused you?**
> "The pickup time selection is on a separate page before checkout. I expected it to be a step inside checkout — like 'Step 1: Review Order, Step 2: Choose Pickup Time, Step 3: Confirm.' The way it's currently set up, I wasn't sure if I had to go to the pickup time page before clicking 'Proceed to Checkout' in the cart."

**Q: Did anything not work?**
> "No, everything worked. The order was placed, I got the token, I could track it. It all functioned."

**Q: Would you use this in the real canteen?**
> "Absolutely yes. This solves exactly the problem I have every day. If the canteen had this I would pre-order every day without fail."

**Q: Rate the experience out of 10.**
> "8 out of 10. Minus one for the pickup time page confusion, minus one for no dark mode." *(laughed)*

---

### Changes Made Based on Divya's Feedback

**Issue:** Pickup time selection felt disconnected from the checkout flow.

**Change Made:** Updated the `Cart.jsx` button text from `"Proceed to Checkout"` to `"Select Pickup Time →"` to make it clear that the next step is pickup time selection, not direct checkout. Also added a step indicator line to `SmartPickupTime.jsx` showing `Cart → Pickup Time → Checkout → Confirm`.
<br>

**File Changed:** `frontend/src/pages/student/Cart.jsx`, `frontend/src/pages/student/SmartPickupTime.jsx`

---

## 3. Tester 2 — Arjun T. (Student)

**Profile:** 3rd Year Mechanical Engineering, 21 years old, uses canteen 2–3 times a week, not a regular app user  
**Date:** 17 September 2026, 11:00 AM  
**Duration:** 35 minutes  
**Device:** His own mobile phone (Android, Chrome browser)

### Task Results

| Task | Result | Time Taken | Notes |
|------|--------|-----------|-------|
| Task 1: Register | ✅ | 2m 10s | Took time typing on mobile keyboard |
| Task 2: Browse menu | ✅ | 2m 40s | Scrolled through all items, used search bar |
| Task 3: Add 2 items to cart | ⚠️ | 3m 00s | Tapped "Add to Cart" but couldn't see confirmation — didn't notice the toast notification |
| Task 4: AI Pickup Time | ✅ | 2m 15s | Navigated naturally — said "oh it's showing me which time is best" |
| Task 5: Place order | ✅ | 2m 00s | Completed without issues |
| Task 6: Find order token | ✅ | 0m 25s | Immediately read the token aloud |
| Task 7: Track order | ✅ | 1m 30s | Found and understood the tracking page |
| Task 8: Order history | ⚠️ | 2m 30s | Looked for it in the bottom mobile nav — initially tapped "AI Picks" by mistake |

**Overall Success Rate: 8/8 tasks completed (6 clean, 2 with difficulty)**

### Verbal Feedback During Test (Think-Aloud)

> *(After tapping Add to Cart)* *"Did it add? I'm not sure... let me tap again... oh now there are 2 in the cart. I added it twice."*

> *(On mobile bottom nav)* *"Where is my order history? I see Dashboard, Menu, AI Picks, Profile, Cart... I don't see Orders. Oh wait — I need to scroll? No... let me check Profile... no. Let me try Dashboard... I see 'View all orders' link here, okay."*

> *(On AI Pickup Time)* *"This is interesting. It shows me how busy each time slot will be. The green one is the best. That makes sense."*

> *(On Order Token)* *"ORD-0917-3342. I would screenshot this on my phone normally."*

### Post-Test Debrief Interview

**Q: What did you like most?**
> "The AI pickup time thing. It's smart — it's not just showing me random times, it's telling me which time has less crowd. For someone like me who has gaps between classes, I can choose the right time."

**Q: What frustrated you?**
> "Two things. One — when I added something to cart I wasn't sure it worked because the confirmation message appeared at the top right corner. On mobile, that's off-screen basically. Two — I couldn't find Order History in the bottom navigation. I only found it through the Dashboard."

**Q: Was the mobile experience okay overall?**
> "Mostly yes. The menu is readable, buttons are big enough. The AI pickup time page works well on mobile too. But the bottom navigation should have an Orders icon."

**Q: Would you use this?**
> "Yes. Especially the pre-ordering part. I hate standing in queue on days when I only have 10 minutes break. This would help a lot."

**Q: Rate the experience out of 10.**
> "7 out of 10. The mobile nav needs the Orders option."

---

### Changes Made Based on Arjun's Feedback

**Issue 1:** Toast notification not visible on mobile (appears top-right, off-screen on some phones).

**Change Made:** Added a visual cart count badge animation on the navbar cart icon that pulses briefly when an item is added, giving additional visual confirmation beyond the toast.

**File Changed:** `frontend/src/components/layout/StudentLayout.jsx`

---

**Issue 2:** Order History not accessible from mobile bottom navigation.

**Change Made:** Replaced the "AI Picks" icon in the mobile bottom nav with "Orders" (📋), and moved AI Picks to be accessible through the Dashboard quick-action cards instead. Orders is a core feature that users need frequently; AI Picks is secondary.

**File Changed:** `frontend/src/components/layout/StudentLayout.jsx`

---

## 4. Tester 3 — Rajan (Canteen Counter Staff — Admin)

**Profile:** Canteen counter staff, 35 years old, uses a basic Android smartphone, not tech-savvy with web apps  
**Date:** 18 September 2026, 2:00 PM  
**Duration:** 40 minutes  
**Device:** College lab computer (Windows, Chrome browser)  
**Note:** This was the same Rajan interviewed during the empathy phase.

### Task Results

| Task | Result | Time Taken | Notes |
|------|--------|-----------|-------|
| Task 9: Admin login | ✅ | 1m 30s | Used demo credentials from printed sheet |
| Task 10: Find pending order | ⚠️ | 4m 00s | Landed on Dashboard first, didn't know to go to Orders. Eventually found it via sidebar. |
| Task 11: Accept → Preparing | ✅ | 1m 45s | Found the "Accept" button, clicked it, saw status change. Then clicked "Start Prep." |
| Task 12: Mark as Ready | ✅ | 0m 45s | Immediately found "Mark Ready" button |
| Task 13: Kitchen Queue | ✅ | 1m 20s | Navigated via sidebar, understood the card layout |
| Task 14: Add new menu item | ⚠️ | 5m 30s | Found Menu Management, found the "+ Add Item" button, but was confused by the "Category" dropdown — didn't know what "SPECIAL" means |

**Overall Success Rate: 6/6 tasks completed (4 clean, 2 with difficulty)**

### Verbal Feedback During Test (Think-Aloud)

> *(On Admin Dashboard)* *"Okay I see today's orders is 1. Active orders 0. Revenue 0... where do I see the actual order?"*

> *(After finding Orders page)* *"Ah here. I can see the order — ORD-0916-4821. Student name is Divya. Chicken Biryani × 2. Pickup at 5:45 PM. Okay, I'll click Accept."*

> *(After accepting)* *"Good — it changed to Accepted. Now I click Start Prep... changed to Preparing. Good, this is how it should work."*

> *(On Kitchen Queue)* *"Oh this is good. I can see all active orders sorted by pickup time. The urgent ones are marked in orange. This is very useful — right now I have a paper on the wall for this."*

> *(On Menu Management — Category dropdown)* *"BREAKFAST, LUNCH, SNACKS, BEVERAGES, DESSERTS, SPECIAL — what is SPECIAL? Is it daily special? Festival special? I don't understand."*

### Post-Test Debrief Interview

**Q: What did you like most?**
> "The kitchen queue page. I can see all the orders in one place, sorted by pickup time. Right now I have to write orders on paper and cross them off. This is much better. Also I can see which orders are urgent — the orange colour."

**Q: What was confusing?**
> "Two things. One — the dashboard doesn't show me new orders clearly. I had to look for a few minutes to find the Orders section. Maybe a big button saying 'New Orders (1)' on the dashboard would help. Two — the SPECIAL category for food items. I don't know what to put there."

**Q: Do you think the staff at your canteen could use this?**
> "Yes if we train them for 10–15 minutes. The basic flow — see order, accept, prepare, ready — is simple. The menu management is a bit more complex but also manageable."

**Q: Would this help reduce the canteen's problems?**
> "Definitely. If students order in advance I know exactly how many biryanis I need for 1 PM. No waste. No shortage. That alone is worth it."

**Q: Rate the admin experience out of 10.**
> "7 out of 10. If the new orders are more visible on dashboard it would be 9."

---

### Changes Made Based on Rajan's Feedback

**Issue 1:** New/pending orders not prominent enough on Admin Dashboard.

**Change Made:** Added a highlighted alert banner on the Admin Dashboard that shows when there are pending orders waiting for acceptance, with a direct "Review Now" button. This was already partially in the code — enhanced the styling to make it more prominent with a warning colour and larger text.

**File Changed:** `frontend/src/pages/admin/AdminDashboard.jsx`

---

**Issue 2:** "SPECIAL" category label unclear to canteen staff.

**Change Made:** Updated the category display label from `SPECIAL` to `"⭐ Today's Special"` in the Menu Management form dropdown and all display components. This makes the intent clear — it's for items the canteen wants to highlight (daily specials, festival items, etc.).

**File Changed:** `frontend/src/utils/helpers.js` (`getCategoryLabel` function)

---

## 5. Consolidated Feedback Summary

### Issues Found & Fixed

| # | Tester | Issue | Severity | Fix Applied | Status |
|---|--------|-------|----------|-------------|--------|
| UT-01 | Divya | Pickup time page feels disconnected from checkout flow | Medium | Updated Cart button text + added step indicator | ✅ Fixed |
| UT-02 | Arjun | Toast notification not visible on mobile | Medium | Added cart icon pulse animation on item add | ✅ Fixed |
| UT-03 | Arjun | Order History missing from mobile bottom nav | High | Replaced AI Picks with Orders in bottom nav | ✅ Fixed |
| UT-04 | Rajan | Pending orders not visible on Admin Dashboard | High | Added prominent pending order alert banner | ✅ Fixed |
| UT-05 | Rajan | "SPECIAL" category unclear | Low | Renamed to "Today's Special" with star emoji | ✅ Fixed |

### Issues Noted but Not Fixed in This Milestone

| # | Tester | Issue | Reason Deferred |
|---|--------|-------|----------------|
| UT-06 | Divya | No dark mode | Out of scope for 40–75% milestone |
| UT-07 | Arjun | Would like to screenshot/share token | Push notifications / share API — Phase 2 |
| UT-08 | Rajan | Wants a sound/beep when new order arrives | Requires browser notification API + HTTPS — Phase 2 |

---

## 6. Overall Testing Metrics

| Metric | Value |
|--------|-------|
| Total testers | 3 |
| Total tasks across all testers | 22 |
| Tasks completed successfully | 20 (91%) |
| Tasks completed with difficulty | 5 (23%) — some overlap |
| Tasks failed | 0 (0%) |
| Critical bugs found | 0 |
| UX issues found | 5 |
| UX issues fixed | 5 (100%) |
| Average satisfaction score | 7.3 / 10 |
| Testers who would use the system | 3 / 3 (100%) |

---

## 7. Key Takeaway

All three testers successfully completed every task. No tester failed any task entirely. The application worked correctly throughout all test sessions — no crashes, no data loss, no authentication failures.

The issues found were all **UX/navigation issues**, not functional failures. This confirms that the core technical implementation (authentication, cart, ordering, AI prediction, tracking, admin management) works correctly and can be understood by real users with minimal training.

The most significant finding was from the admin tester (Rajan): the kitchen queue view is immediately useful and understandable to canteen staff, validating that the system solves the operational problem identified in the empathy phase.

---

*Document prepared for Design Thinking Review — 40% to 75% Milestone*  
*Testing conducted: 16–18 September 2026*  
*Abishek — Rathinam Technical Campus*
