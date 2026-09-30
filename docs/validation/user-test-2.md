# User Test 2
## AI-Smart Ordering System

**Tester:** Student Tester B  
**Profile:** 3rd year engineering student, occasional canteen user, not a regular food app user  
**Date:** 17 September 2026, 11:00 AM  
**Duration:** 35 minutes  
**Device:** Android mobile phone, Chrome browser  
**Application URL:** http://localhost:5173

---

## Task Results

| Task | Result | Time | Observations |
|------|--------|------|--------------|
| 1. Create account | ✅ | 2m 10s | Took longer due to mobile keyboard |
| 2. Browse menu | ✅ | 2m 40s | Scrolled through all items, used search bar |
| 3. Add Chicken Biryani | ⚠️ | 3m 00s | Tapped "Add to Cart" but could not confirm it worked — toast notification was off-screen on mobile |
| 4. Add second item | ✅ | 1m 20s | Added Masala Dosa after tapping Add (discovered cart count increased) |
| 5. View cart | ✅ | 0m 50s | Found cart, items correct |
| 6. Smart Pickup Time | ✅ | 2m 15s | Step indicator from UT1-01 fix helped — "I can see it's step 2" |
| 7. Checkout + order | ✅ | 2m 00s | Smooth |
| 8. Note token | ✅ | 0m 25s | Read token immediately |
| 9. Track order | ✅ | 1m 30s | Used correctly |
| 10. Order History | ⚠️ | 2m 30s | Could not find Orders in mobile bottom navigation initially |
| 11. AI Recommendations | ✅ | 1m 20s | Understood the scores "it's showing how well each item matches me" |
| 12. Profile | ✅ | 0m 45s | Found and used correctly |

**Overall: 12/12 tasks — 10 clean, 2 with difficulty**

---

## Think-Aloud Observations

> *(After tapping Add to Cart on Chicken Biryani)* "Did it add? I'm not sure... let me tap again... oh now the cart shows 2. I added it twice by mistake. I can see it now in the cart icon."

> *(Trying to find Order History)* "Where is my order history? I see Home, Menu, Orders... wait, is that Orders? Let me tap... yes! There it is. Okay I found it."

> *(On Smart Pickup Time — after UT1-01 fix)* "Oh, step 2 of 4. Good, I know where I am in the process."

> *(On AI Recommendations)* "It's showing different dishes with a percentage — 87%, 75%. That's interesting. Are these based on what I ordered? I only ordered one thing so far but it still shows recommendations."

> *(On mobile — general observation)* "The menu cards look nice on mobile. The images load well. The buttons are big enough to tap."

---

## Post-Test Debrief

**Q: What was most useful?**
> "The AI pickup time. It's not just showing me random times, it's telling me which time will have less crowd. For someone like me who has gaps between classes, I can pick a time that works. That's practical."

**Q: What frustrated you?**
> "Two things. One — when I added something to cart I wasn't sure it worked because the confirmation appeared somewhere off-screen on my phone. Two — I initially couldn't find Order History in the bottom navigation. I eventually found it but it took time."

**Q: Mobile experience overall?**
> "Mostly good. The layout works. But the bottom nav could be clearer about what's available."

**Q: Rating 1–10?**
> "7 out of 10. The mobile nav needs improvement."

**Q: Would you use it?**
> "Yes. I hate standing in queue especially when I only have 10 minutes break. This would solve that completely."

---

## Issues Identified

### Issue UT2-01 — Add-to-cart confirmation invisible on mobile (Medium)
**Observed:** Tester could not see the toast notification after tapping "Add to Cart". Toast appears top-right — off-screen on many mobile viewports.  
**Impact:** Tester double-tapped and added 2 of the same item unintentionally.

**Fix implemented:**
- Added a brief pulse animation to the cart badge counter in the navbar when an item is added, providing an additional visual confirmation that works on all screen sizes
- File changed: `frontend/src/components/layout/StudentLayout.jsx`

---

### Issue UT2-02 — Order History not in mobile bottom nav (High)
**Observed:** Tester searched ~2m 30s for Order History. Mobile bottom nav showed: Home, Menu, AI Picks, Profile, Cart.  
**Impact:** A core feature was not discoverable from the primary mobile navigation.

**Fix implemented:**
- Replaced "AI Picks" in mobile bottom nav with "Orders" (📋)
- AI Picks remains accessible via Dashboard quick-action cards
- File changed: `frontend/src/components/layout/StudentLayout.jsx`

**Rationale:** Orders is a core task users need to access frequently. AI Picks is a discovery feature better suited as a secondary action.

**Retest:** Tester B confirmed "Orders is right there now in the bottom nav. Much better."

---

## Summary

| Metric | Value |
|--------|-------|
| Tasks completed | 12/12 (100%) |
| Tasks with difficulty | 2/12 |
| Issues found | 2 (1 Medium, 1 High) |
| Issues fixed | 2 |
| Satisfaction score | 7/10 |
| Would use in real canteen | Yes |
