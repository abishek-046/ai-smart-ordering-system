# User Test 3
## AI-Smart Ordering System

**Tester:** Canteen Staff Tester (Admin Persona)  
**Profile:** Canteen counter staff member, 35 years old, comfortable with basic Android smartphone, limited experience with web dashboards  
**Date:** 18 September 2026, 2:00 PM  
**Duration:** 40 minutes  
**Device:** College lab computer, Windows, Chrome browser  
**Application URL:** http://localhost:5173  
**Note:** This is the same staff member (Rajan) interviewed during the empathy phase — providing continuity between research and validation.

---

## Task Results

| Task | Result | Time | Observations |
|------|--------|------|--------------|
| 1. Login as admin | ✅ | 1m 30s | Used printed credentials, typed carefully |
| 2. Find today's order count on Dashboard | ⚠️ | 2m 30s | Looked at wrong stat initially (total students instead of today's orders) |
| 3. Navigate to Orders, find pending | ⚠️ | 4m 00s | Went to Dashboard first, then Kitchen Queue, then finally Orders |
| 4. Accept the pending order | ✅ | 1m 45s | Found "Accept" button, clicked, saw status change confirmation |
| 5. Move order to Preparing | ✅ | 0m 50s | "Start Prep" button immediately visible after Accepting |
| 6. Mark order as Ready | ✅ | 0m 45s | "Mark Ready" button found and used correctly |
| 7. Navigate to Kitchen Queue | ✅ | 1m 20s | Found via sidebar, understood card layout immediately |
| 8. Add new menu item | ⚠️ | 5m 30s | Found the "+ Add Item" button, but confused by Category dropdown — did not know what "SPECIAL" category means |
| 9. Toggle item to unavailable | ✅ | 1m 00s | Found "Disable" toggle on menu item card |
| 10. View Analytics | ✅ | 1m 30s | Navigated correctly, understood bar charts |

**Overall: 10/10 tasks — 7 clean, 3 with difficulty**

---

## Think-Aloud Observations

> *(On Admin Dashboard)* "Okay... today's orders is 1. Active orders 0. Revenue... where do I see the actual orders that need action? Is this the right place?"

> *(Navigating to Orders)* "Kitchen Queue first... no, that's showing the preparing orders. Let me try... Orders. Ah, here. I can see the order — student name, items, pickup time."

> *(After accepting order)* "Good — it changed. Now 'Start Prep'... okay. Changed to Preparing. This is how it should work. Simple."

> *(On Kitchen Queue)* "Oh this is very good. I can see all orders sorted by pickup time. The urgent ones are in orange. Right now I use a paper on the wall — this is much better."

> *(On Menu Management — Category)* "BREAKFAST, LUNCH, SNACKS, BEVERAGES, DESSERTS, SPECIAL — what is SPECIAL? Is it daily special? Festival special? I don't understand what to put here."

> *(On Analytics)* "This shows how many orders per hour. So at 12–1 PM it's the busiest. Yes, that's correct. I could use this to know when to prepare what."

---

## Post-Test Debrief

**Q: What did you like most?**
> "The kitchen queue page. I can see all orders in one place, sorted by who needs food first. The orange urgent badge is very useful. And I can change status from this page directly — Accept, Prepare, Ready. That's exactly what I need."

**Q: What confused you?**
> "Two things. The dashboard — I couldn't immediately see where the pending orders are. Maybe a bigger alert. And the SPECIAL category — I need to know what that means."

**Q: Do you think your canteen staff could use this?**
> "Yes, if we train them for 15 minutes. The basic flow — see order, accept, prepare, ready — is simple enough. Even my older colleagues could learn it. The menu management part is a bit more involved but manageable."

**Q: Would this help reduce the problems you face?**
> "Definitely. If students order in advance I know exactly how many biryanis I need for 1 PM. No more guessing. No more throwing away food. That alone is worth everything."

**Q: Rating 1–10?**
> "7 out of 10. If the pending orders are more visible it would be 9."

---

## Issues Identified

### Issue UT3-01 — Pending orders not prominent enough on Admin Dashboard (High)
**Observed:** Tester spent 2m 30s on Task 2 and 4m 00s on Task 3 because pending orders were not immediately obvious from the dashboard.  
**Quote:** "Where do I see the actual orders that need action?"  
**Impact:** Staff may miss or delay accepting orders, causing student wait time.

**Fix implemented:**
- Enhanced the pending-orders alert banner on Admin Dashboard — made it larger, added animation (`animate-bounce` on the bell icon), changed button text from "Review Now" to "Accept Now →"
- File changed: `frontend/src/pages/admin/AdminDashboard.jsx`

**Retest:** Tester confirmed "Now I can see immediately there are orders waiting. The bell is moving. I would not miss this."

---

### Issue UT3-02 — "SPECIAL" category label unclear to canteen staff (Medium)
**Observed:** Tester paused ~2 minutes on Task 8 wondering what SPECIAL means.  
**Quote:** "Is it daily special? Festival special?"  

**Fix implemented:**
- Changed `getCategoryLabel('SPECIAL')` from `'⭐ Special'` to `"⭐ Today's Special"` in `frontend/src/utils/helpers.js`
- This label appears in the Menu Management form dropdown, food cards, and category filters

**Retest:** Tester confirmed "Today's Special — yes, that's clear. I know what to put there now."

---

## Summary

| Metric | Value |
|--------|-------|
| Tasks completed | 10/10 (100%) |
| Tasks with difficulty | 3/10 |
| Issues found | 2 (1 High, 1 Medium) |
| Issues fixed | 2 |
| Satisfaction score | 7/10 |
| Would use in real canteen | Yes |
