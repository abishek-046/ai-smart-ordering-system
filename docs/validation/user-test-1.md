# User Test 1
## AI-Smart Ordering System

**Tester:** Student Tester A  
**Profile:** 2nd year engineering student, daily canteen user, regular Swiggy/Zomato user  
**Date:** 16 September 2026, 3:00 PM  
**Duration:** 28 minutes  
**Device:** Windows laptop, Chrome browser  
**Application URL:** http://localhost:5173

---

## Task Results

| Task | Result | Time | Observations |
|------|--------|------|--------------|
| 1. Create account | ✅ | 1m 45s | Filled all fields, submitted without issues |
| 2. Browse menu | ✅ | 2m 10s | Used category filter tabs immediately ("Just like Swiggy") |
| 3. Add Chicken Biryani | ✅ | 0m 55s | Found item in Lunch, clicked Add, saw cart badge update |
| 4. Add second item | ✅ | 1m 20s | Added Kadak Masala Chai from Beverages |
| 5. View cart | ✅ | 0m 30s | Navigated via nav icon, quantities and total correct |
| 6. Smart Pickup Time | ⚠️ | 3m 30s | Did not initially understand this was a separate step before checkout |
| 7. Checkout + place order | ✅ | 1m 50s | Once flow was understood, completed smoothly |
| 8. Note order token | ✅ | 0m 20s | Immediately read out "ORD-0916-4821" from the confirmation screen |
| 9. Track order | ✅ | 1m 10s | Navigated to tracking, read progress bar correctly |
| 10. Order History | ✅ | 0m 45s | Found via nav, saw the order |
| 11. AI Recommendations | ✅ | 1m 30s | Noted "it's showing 6 picks — these look right actually" |
| 12. Profile | ✅ | 0m 40s | Found and navigated correctly |

**Overall: 12/12 tasks — 11 clean, 1 with difficulty**

---

## Think-Aloud Observations

> *(Browsing menu)* "Oh nice — it has category tabs. That's how Swiggy does it. Let me look at Lunch."

> *(After clicking Add to Cart on Chicken Biryani)* "The cart number went to 1 in the top right. Good, it added."

> *(On Cart page, clicking 'Select Pickup Time')* "Oh it's taking me to a different page... I thought I would just go to checkout from here. So I need to do this step first?"

> *(On Smart Pickup Time)* "Okay, it's showing me time slots and which ones are busy. The green one says Recommended. That makes sense — it's showing 3 active orders so it's not very busy. I'll pick this one."

> *(On Order Confirmation)* "ORD-0916-4821. That's my token. It's big and clear. I like that."

> *(On Order Tracking)* "There's a progress bar. It says Pending. And there's a live indicator in the corner — it auto-updates. Oh nice."

---

## Post-Test Debrief

**Q: What was the most useful feature?**
> "The Smart Pickup Time. It's actually telling me when the kitchen is less busy. I've never seen this in any food app. Even Swiggy doesn't do this. That's genuinely useful for planning."

**Q: What confused you?**
> "The pickup time is on a separate page that comes before checkout. I expected checkout to be the next step after the cart. The flow wasn't immediately obvious. Maybe show '2 of 3 steps' or something."

**Q: Did anything not work?**
> "Everything worked. Order was placed, I got a token, I could track it."

**Q: Rating 1–10?**
> "8 out of 10. The pickup time flow needs to be clearer. Otherwise very good."

**Q: Would you use this?**
> "Absolutely yes. Every single day. This solves the exact problem I have every morning."

---

## Issues Identified

### Issue UT1-01 — Pickup time flow unclear (Medium)
**Observed:** Tester paused 3m 30s on Task 6. Did not immediately understand that Smart Pickup Time is a required step *before* checkout.  
**Quote:** "I thought I would just go to checkout from here"  
**Root cause:** Cart page button said "Proceed" without indicating it leads to pickup time selection first.

**Fix implemented:**
- Changed Cart.jsx button text to "⏰ Select Pickup Time →" to clarify the next step
- Added a step indicator to SmartPickupTime.jsx: `🛒 Cart → ⏰ Pickup Time → ✅ Checkout → 🎫 Confirm`
- File changed: `frontend/src/pages/student/Cart.jsx`, `frontend/src/pages/student/SmartPickupTime.jsx`

**Retest:** Tester A confirmed the updated flow was "much clearer — I can see it's step 2 of 4 now."

---

## Summary

| Metric | Value |
|--------|-------|
| Tasks completed | 12/12 (100%) |
| Tasks with difficulty | 1/12 |
| Issues found | 1 (Medium) |
| Issues fixed | 1 |
| Satisfaction score | 8/10 |
| Would use in real canteen | Yes |
