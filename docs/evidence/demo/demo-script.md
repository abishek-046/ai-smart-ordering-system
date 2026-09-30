# Demo Script
## AI-Smart Ordering System — Complete Walkthrough

**Duration:** ~8 minutes  
**URL:** http://localhost:5173

---

## Part 1 — Student Flow (5 minutes)

### Step 1: Landing Page (15 seconds)
- Open http://localhost:5173
- Show the hero section with animated floating dish cards
- Point out: "This is a college canteen pre-ordering system built to eliminate physical queues"

### Step 2: Register (30 seconds)
- Click "Get Started"
- Fill in: Name, Email, Password
- Click "Create Account"
- Show successful registration and redirect to dashboard

### Step 3: Student Dashboard (20 seconds)
- Show the dark hero banner with greeting
- Point out Quick Actions: Browse Menu, AI Picks, Cart, Order History

### Step 4: Browse Menu (45 seconds)
- Navigate to /menu
- Show all 32 dishes loaded with real food photographs
- Click a category filter (Lunch) — show it filters instantly
- Type "biryani" in the search bar — show search working
- Clear search

### Step 5: Add to Cart (30 seconds)
- Click "Add to Cart" on Chicken Biryani
- Show cart badge updating in navbar
- Add a second item (Kadak Masala Chai)
- Navigate to Cart — show both items, total calculated correctly

### Step 6: AI Smart Pickup Time (60 seconds) ← KEY FEATURE
- Click "Select Pickup Time →" from cart
- Show the AI analysis card: "X active orders, est. prep time, wait range"
- Show 12 time slots with load scores and bars
- Point out the "Recommended" badge on the best slot
- Explain: "The AI reads live order data from the database and scores each slot by kitchen load, peak-hour penalties, and how soon the food can be ready"
- Select the recommended slot

### Step 7: Checkout + Order (30 seconds)
- Show checkout page with item thumbnails and total
- Show the scheduled pickup time
- Click "Place Order"
- Show Order Confirmation page with large digital token (e.g. ORD-0929-4578)

### Step 8: Order Tracking (30 seconds) ← KEY FEATURE
- Click "Track Order →"
- Show the live tracking page with progress bar (PENDING state)
- Show the "Live · updates every 15s" indicator
- Point out the pickup countdown timer

---

## Part 2 — Admin Flow (3 minutes)

### Step 9: Admin Login (15 seconds)
- Open new tab, go to /login
- Login as admin@canteen.com / admin123
- Show redirect to Admin Dashboard

### Step 10: Admin Dashboard (20 seconds)
- Show live stats: Active Orders, Today's Orders, Pending, Revenue
- Show the pending order alert banner: "X orders waiting for acceptance"
- Click "Accept Now →"

### Step 11: Order Management (45 seconds) ← KEY FEATURE
- Show Admin Orders page with the student's order
- Show all details: token, student name, items, pickup time
- Click "✓ Accept" → status changes to ACCEPTED
- Click "🍳 Start Prep" → status changes to PREPARING
- Click "🔔 Mark Ready" → status changes to READY
- Switch back to student tab — show the tracking page now shows "🔔 Ready for Pickup!"

### Step 12: Kitchen Queue (30 seconds)
- Navigate to Kitchen Queue
- Show orders sorted by pickup time
- Point out urgency flags (orange for <15 min)

### Step 13: Analytics (20 seconds)
- Show Analytics page
- Point out Orders by Status chart
- Show the hourly distribution chart

### Step 14: Menu Management (20 seconds)
- Show Menu Management with food photos in grid
- Click "+ Add Item" to show the form
- Show the image preview feature

---

## Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | student@test.com | student123 |
| Admin | admin@canteen.com | admin123 |

## Setup to Run Demo
```bash
# Terminal 1
cd backend && node src/index.js

# Terminal 2  
cd frontend && npm run dev

# Open http://localhost:5173
```
