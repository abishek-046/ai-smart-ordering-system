# AI-Smart Ordering System
## College Canteen Pre-Ordering Platform

> **Project Better Tomorrow** — Eliminating physical canteen queues through AI-powered pre-ordering, smart pickup time prediction, digital tokens, and live order tracking.

**GitHub:** https://github.com/abishek-046/ai-smart-ordering-system  
**Institution:** Rathinam Technical Campus  
**Team:** Abishek

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution](#solution)
3. [Key Features](#key-features)
4. [Tech Stack](#tech-stack)
5. [Architecture](#architecture)
6. [Installation & Setup](#installation--setup)
7. [Environment Variables](#environment-variables)
8. [Running Tests](#running-tests)
9. [API Documentation](#api-documentation)
10. [Database Schema](#database-schema)
11. [Order Status Workflow](#order-status-workflow)
12. [AI Engine](#ai-engine)
13. [Error Handling](#error-handling)
14. [Security](#security)
15. [Edge Cases Handled](#edge-cases-handled)
16. [Design Thinking Documentation](#design-thinking-documentation)
17. [Project Limitations](#project-limitations)

---

## Problem Statement

College students with 15-minute lunch breaks lose 12–20 minutes in canteen queues during peak hours. ~40% abandon the canteen without food. Students miss classes. Canteen staff waste ~15% of daily food stock because they cannot forecast demand.

The root cause: **the canteen operates as a walk-in, information-free system** with no pre-ordering, no availability checks, no preparation time estimates, and no plannable pickup time.

> *"I want to order before I leave class. Just like Swiggy."* — Student interview, 10 Sep 2026

---

## Solution

A full-stack web application that allows students to:
- Pre-order food before leaving the classroom
- Get an **AI-predicted pickup time** based on live kitchen load
- Receive a **digital token** for contactless pickup
- Track their order live (15-second polling)

And allows canteen staff to:
- See all orders in advance with pickup times
- Manage a **real-time kitchen queue** sorted by urgency
- Predict kitchen load for the next 3 hours

---

## Key Features

### Student Features
- Register / Login (JWT + bcrypt)
- Browse 32 authentic South Indian dishes with real food photos
- Search and filter by category
- Food availability checked in real-time
- Cart with quantity validation (1–20 per item)
- **AI Smart Pickup Time** — 12 scored slots from live database
- **AI Food Recommendations** — personalised from order history
- Checkout with server-side price calculation
- Digital order token (`ORD-MMDD-8hexchars`)
- Live order tracking with progress bar (15-second polling)
- Order history with status filter
- Order cancellation (PENDING status only)
- Star rating system (1–5, Bayesian average)
- Profile and password management

### Admin Features
- Dashboard with live KPIs (active orders, revenue, pending count)
- View and manage all orders with pagination and status filter
- **Status workflow:** PENDING → ACCEPTED → PREPARING → READY → COLLECTED
- Cancel orders (PENDING or ACCEPTED)
- **Kitchen Queue** sorted by pickup time + urgency flags (overdue, < 15 min)
- Full menu management (add / edit / soft-delete / availability toggle)
- Analytics: orders by status, top items, hourly distribution, revenue
- **AI Kitchen Load Predictions** — 30-min slot forecast for next 3 hours

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3 |
| Fonts | Playfair Display + Inter + DM Sans (Google Fonts) |
| Backend | Node.js + Express 4 |
| Database | PostgreSQL 18 + Prisma ORM 5 |
| Authentication | JWT (jsonwebtoken) + bcrypt (cost 12) |
| Security | helmet, express-rate-limit |
| Validation | express-validator (backend), inline (frontend) |
| AI Engine | Algorithmic — modular external ML API escape hatch via `.env` |
| Unit Testing | Jest (backend) + Vitest (frontend) |
| E2E Testing | Custom scripts (`scripts/e2e-test.js`, `scripts/verify-api.js`) |

---

## Architecture

```
Browser (React 18 + Vite + Tailwind)
  │  AuthContext  CartContext  (global state)
  │  ErrorBoundary (wraps entire app tree)
  └── Axios (api.js — global 401 interceptor, 15s timeout)
        │
        ▼
   Express REST API  (Node.js, port 5000)
        ├── helmet (security headers)
        ├── cors (origin: FRONTEND_URL)
        ├── express-rate-limit (200/15min global; 15/15min auth)
        ├── express-validator (input validation on auth routes)
        ├── JWT protect + adminOnly middleware
        ├── 6 controllers: auth, menu, cart, order, ai, admin
        └── Prisma Client
              └── PostgreSQL 18
                    └── 5 tables: users, food_items, cart_items,
                                  orders, order_items
```

---

## Installation & Setup

### Prerequisites
- Node.js ≥ 18
- PostgreSQL 18 (running on port 5432)

### 1. Clone
```bash
git clone https://github.com/abishek-046/ai-smart-ordering-system.git
cd ai-smart-ordering-system
```

### 2. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment
```bash
cp .env.example backend/.env
```
Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/smart_ordering"
JWT_SECRET="change-this-to-a-64-char-random-string"
JWT_EXPIRES_IN="7d"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

### 4. Create database
```sql
-- In psql or pgAdmin:
CREATE DATABASE smart_ordering;
```

### 5. Run migrations and generate Prisma client
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Seed demo data
```bash
node src/utils/seed.js
```
Creates:
- **Admin:** `admin@canteen.com` / `admin123`
- **Student:** `student@test.com` / `student123`
- 32 authentic South Indian dishes with Unsplash photos

### 7. Start servers

**Terminal 1 — Backend:**
```bash
cd backend
node src/index.js
# Server: http://localhost:5000
# Health: http://localhost:5000/api/health
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App: http://localhost:5173
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | — | JWT signing secret — use a long random string in production |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry duration |
| `PORT` | No | `5000` | Backend HTTP port |
| `FRONTEND_URL` | No | `http://localhost:5173` | CORS allowed origin |
| `AI_API_KEY` | No | — | External AI API key (algorithmic engine used if empty) |
| `AI_API_URL` | No | — | External AI API base URL |
| `NODE_ENV` | No | `development` | `production` suppresses stack traces in error responses |

> ⚠️ **Security:** Never commit real credentials. `.env` is in `.gitignore`. Use a minimum 32-character random string for `JWT_SECRET` in any deployed environment.

---

## Running Tests

### Unit Tests (Jest — backend)

```bash
cd backend
npm test
# Runs all __tests__/**/*.test.js files
# Expected: all tests pass
```

Test files:
- `src/utils/__tests__/tokenGenerator.test.js` — token format, entropy, uniqueness
- `src/controllers/__tests__/menu.validation.test.js` — menu input validation
- `src/controllers/__tests__/order.validation.test.js` — order/cart/pickup validation
- `src/services/__tests__/ai.helpers.test.js` — AI slot/scoring/rating helpers
- `src/middleware/__tests__/auth.middleware.test.js` — JWT protect + adminOnly
- `src/middleware/__tests__/error.middleware.test.js` — error handler + notFound

### Unit Tests (Vitest — frontend)

```bash
cd frontend
npm test
# Runs all src/**/__tests__/**/*.test.{js,jsx}
# Expected: all tests pass
```

Test files:
- `src/utils/__tests__/helpers.test.js` — formatCurrency, getStatusLabel, getApiError, etc.

### API Smoke Tests (no database required)

```bash
# With backend running on :5000
cd backend && node scripts/verify-api.js
# Expected: 20/20 PASS
```

### End-to-End Tests (requires running backend + database)

```bash
# With backend running on :5000 and database seeded
cd backend && node scripts/e2e-test.js
# Expected: 33/33 PASS
# Covers: student flow, admin flow, security edge cases, audit validations
```

### Frontend Production Build

```bash
cd frontend && npm run build
# Expected: 124 modules, 0 errors
```

---

## API Documentation

**Base URL:** `http://localhost:5000/api`  
**Content-Type:** `application/json`  
**Authentication:** `Authorization: Bearer <jwt_token>`

All error responses follow this shape:
```json
{ "success": false, "message": "Human-readable error description" }
```

---

### Health

#### `GET /health`
Check that the API server is running.

**Auth:** None  
**Response 200:**
```json
{
  "success": true,
  "message": "AI-Smart Ordering API is running",
  "timestamp": "2026-10-01T10:00:00.000Z",
  "version": "2.0.0"
}
```

---

### Authentication — `/auth`

#### `POST /auth/register`
Register a new student account.

**Auth:** None  
**Rate limit:** 15 req / 15 min (failures only)

**Request body:**
```json
{
  "name": "Abishek Kumar",
  "email": "abishek@test.com",
  "password": "mypassword",
  "studentId": "STU-2024-001",
  "phone": "9876543210"
}
```
- `name` — required, min 2 chars
- `email` — required, valid email format
- `password` — required, min 6 chars
- `studentId` — optional, must be unique if provided
- `phone` — optional

**Response 201:**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "...", "name": "...", "email": "...", "role": "STUDENT", "studentId": "..." }
}
```

**Errors:** `400` validation errors | `409` email or studentId already registered

---

#### `POST /auth/login`
Login for both students and admins.

**Auth:** None  
**Rate limit:** 15 req / 15 min (failures only)

**Request body:**
```json
{ "email": "admin@canteen.com", "password": "admin123" }
```

**Response 200:**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "...", "name": "...", "email": "...", "role": "ADMIN" }
}
```

**Errors:** `400` validation | `401` invalid credentials

---

#### `GET /auth/me`
Get the currently authenticated user's profile.

**Auth:** JWT required

**Response 200:**
```json
{
  "success": true,
  "user": { "id": "...", "name": "...", "email": "...", "role": "STUDENT", "studentId": "...", "phone": "...", "preferences": {}, "createdAt": "..." }
}
```

---

#### `PUT /auth/profile`
Update the current user's name and/or phone number.

**Auth:** JWT required

**Request body (all fields optional):**
```json
{ "name": "New Name", "phone": "9876543210" }
```
- `name` — min 2, max 100 chars
- `phone` — must be exactly 10 digits if provided

**Response 200:**
```json
{ "success": true, "message": "Profile updated.", "user": { ... } }
```

**Errors:** `400` invalid name/phone format

---

#### `PUT /auth/change-password`
Change the current user's password.

**Auth:** JWT required

**Request body:**
```json
{ "currentPassword": "oldpass", "newPassword": "newpass123" }
```
- `newPassword` — min 6, max 128 chars

**Errors:** `400` wrong current password | `400` password too short/long

---

### Menu — `/menu`

#### `GET /menu`
List all food items. Public endpoint.

**Auth:** None  
**Query parameters:**
- `category` — filter by `BREAKFAST|LUNCH|SNACKS|BEVERAGES|DESSERTS|SPECIAL`
- `search` — full-text search on name, description, tags (max 100 chars)
- `available` — `true` or `false` to filter by availability

**Response 200:**
```json
{
  "success": true,
  "count": 32,
  "items": [
    {
      "id": "...", "name": "Masala Dosa", "description": "...", "price": 60,
      "category": "BREAKFAST", "image": "https://...", "isAvailable": true,
      "prepTimeMinutes": 12, "rating": 4.35, "totalRatings": 128, "tags": ["popular"]
    }
  ]
}
```

**Errors:** `400` invalid category enum

---

#### `GET /menu/:id`
Get a single food item by its ID.

**Auth:** None

**Response 200:**
```json
{ "success": true, "item": { ... } }
```

**Errors:** `404` item not found

---

#### `POST /menu/:id/rate`
Submit a star rating (1–5) for a food item.

**Auth:** JWT required (any authenticated user)

**Request body:**
```json
{ "rating": 5 }
```
Rating must be an integer 1–5. Uses Bayesian weighted average to update stored rating.

**Response 200:**
```json
{ "success": true, "message": "Rating submitted.", "rating": 4.42, "totalRatings": 129 }
```

**Errors:** `400` invalid rating value | `400` item unavailable | `404` item not found

---

#### `POST /menu` _(Admin)_
Create a new menu item.

**Auth:** JWT + Admin role

**Request body:**
```json
{
  "name": "Ghee Masala Dosa",
  "description": "Crispy dosa with ghee...",
  "price": 80,
  "category": "BREAKFAST",
  "prepTimeMinutes": 15,
  "image": "https://images.unsplash.com/photo-...",
  "tags": ["popular", "vegetarian"]
}
```

**Response 201:**
```json
{ "success": true, "message": "Food item created.", "item": { ... } }
```

**Errors:** `400` validation errors (name, price, category required)

---

#### `PUT /menu/:id` _(Admin)_
Update an existing menu item. All fields optional (partial update).

**Auth:** JWT + Admin role

**Errors:** `404` item not found | `400` invalid field values

---

#### `DELETE /menu/:id` _(Admin)_
Delete a menu item. If the item appears in any order history, it is soft-deleted (marked unavailable) instead of hard-deleted to preserve order integrity.

**Auth:** JWT + Admin role

**Response 200:**
```json
{
  "success": true,
  "message": "Item has existing orders — marked as unavailable instead of deleted.",
  "softDeleted": true
}
```

**Errors:** `404` item not found

---

#### `PATCH /menu/:id/availability` _(Admin)_
Toggle a menu item's availability on/off.

**Auth:** JWT + Admin role

**Response 200:**
```json
{ "success": true, "message": "Item marked unavailable.", "item": { ... } }
```

---

### Cart — `/cart`

All cart endpoints require JWT authentication. Cart is scoped to the requesting user.

#### `GET /cart`
Get the current user's cart contents.

**Response 200:**
```json
{
  "success": true,
  "items": [
    { "id": "...", "foodItemId": "...", "quantity": 2, "foodItem": { "name": "...", "price": 60, ... } }
  ],
  "total": 120.00,
  "totalItems": 2
}
```

---

#### `POST /cart/add`
Add an item to the cart. Increments quantity if item already exists.

**Request body:**
```json
{ "foodItemId": "<id>", "quantity": 1 }
```
- Quantity must be 1–20
- Sum of existing + new quantity must not exceed 20

**Errors:** `400` invalid quantity | `400` item unavailable | `404` item not found

---

#### `PUT /cart/update`
Set the exact quantity of a cart item. Sending `quantity ≤ 0` removes the item.

**Request body:**
```json
{ "foodItemId": "<id>", "quantity": 3 }
```

---

#### `DELETE /cart/remove/:itemId`
Remove a specific item (by foodItemId) from the cart.

---

#### `DELETE /cart/clear`
Remove all items from the cart.

---

### Orders — `/orders`

#### `POST /orders`
Place an order. Atomically: validates cart, calculates total from DB prices, creates order + order items, clears cart.

**Auth:** JWT required  
**Rate limit:** 10 per user per hour

**Request body:**
```json
{
  "pickupTime": "2026-10-01T13:30:00.000Z",
  "specialInstructions": "Less spicy please"
}
```
- `pickupTime` — required ISO 8601 datetime; must be in the future; max 24 hours ahead
- `specialInstructions` — optional string, max 300 characters

**Response 201:**
```json
{
  "success": true,
  "message": "Order placed successfully!",
  "order": {
    "id": "...", "token": "ORD-1001-a3f8c2d1", "status": "PENDING",
    "totalAmount": 120.00, "pickupTime": "...", "estimatedPrepTime": 18,
    "items": [ { "foodItemId": "...", "quantity": 2, "unitPrice": 60, "foodItem": {...} } ],
    "user": { "name": "...", "email": "...", "studentId": "..." }
  }
}
```

**Errors:**  
`400` empty cart | `400` unavailable item | `400` invalid pickup time | `400` instructions > 300 chars  
`409` duplicate order (placed within 60 seconds)

---

#### `GET /orders`
Get the authenticated user's order history.

**Query parameters:**
- `status` — filter by status enum
- `limit` — max results (1–100, default 20)
- `offset` — pagination offset (default 0)

**Response 200:**
```json
{
  "success": true,
  "orders": [ { "id": "...", "token": "...", "status": "...", "totalAmount": 120, "items": [...] } ],
  "total": 5
}
```

---

#### `GET /orders/:id`
Get a specific order by database ID. Returns 404 if the order belongs to a different user.

**Auth:** JWT required (owner only)

---

#### `GET /orders/track/:token`
Track an order by its public token (e.g. `ORD-1001-a3f8c2d1`).

**Auth:** JWT required (owner or admin)

**Response 200:**
```json
{
  "success": true,
  "order": { "id": "...", "token": "...", "status": "PREPARING", "items": [...] },
  "tracking": {
    "progress": 60,
    "minutesUntilPickup": 12,
    "statusMessage": "Your food is being prepared in the kitchen.",
    "estimatedReadyTime": "2026-10-01T13:18:00.000Z"
  }
}
```

**Errors:** `400` invalid token format | `404` token not found | `403` not the order owner

---

#### `PATCH /orders/:id/cancel`
Cancel a PENDING order. Only PENDING orders can be student-cancelled.

**Auth:** JWT required (owner only)

**Response 200:**
```json
{ "success": true, "message": "Order cancelled.", "order": { "status": "CANCELLED", ... } }
```

**Errors:** `400` order is not in PENDING status | `404` order not found

---

### AI — `/ai`

#### `GET /ai/pickup-slots`
Get 12 recommended pickup time slots, scored by live kitchen load and time of day.

**Auth:** JWT required (cart must be non-empty)

**Response 200:**
```json
{
  "success": true,
  "slots": [
    {
      "time": "2026-10-01T13:15:00.000Z",
      "displayTime": "01:15 PM",
      "waitMinutes": 22,
      "estimatedPrepMinutes": 18,
      "currentLoad": 2,
      "score": 87,
      "label": "Best Pick",
      "recommended": true
    }
  ],
  "basePrepMinutes": 18,
  "totalItems": 3,
  "analysis": {
    "currentActiveOrders": 4,
    "estimatedWaitRange": "18–28 minutes"
  }
}
```

**Errors:** `400` empty cart

---

#### `GET /ai/recommendations`
Get personalised food recommendations for the current user.

**Auth:** JWT required

**Response 200:**
```json
{
  "success": true,
  "topPicks": [ { ...foodItem, "aiScore": 84 } ],
  "popularItems": [ { ...foodItem } ],
  "categoryRecommendations": {
    "BREAKFAST": [ { ...foodItem, "aiScore": 91 } ]
  },
  "userProfile": {
    "favoriteCategories": ["BREAKFAST", "LUNCH"],
    "avgSpend": 72.50,
    "totalOrders": 5,
    "hasHistory": true
  }
}
```

---

#### `GET /ai/kitchen-predictions` _(Admin)_
Get kitchen load predictions for the next 3 hours in 30-minute slots.

**Auth:** JWT + Admin role

**Response 200:**
```json
{
  "success": true,
  "predictions": [
    {
      "time": "...", "displayTime": "01:30 PM",
      "orderCount": 4, "totalItems": 9,
      "estimatedLoad": 40, "loadLabel": "Moderate"
    }
  ],
  "currentActiveOrders": 6,
  "currentLoad": 40
}
```

---

### Admin — `/admin`

All admin endpoints require `JWT + Admin role`.

#### `GET /admin/dashboard`
Get live KPI summary.

**Response 200:**
```json
{
  "success": true,
  "summary": {
    "activeOrders": 3,
    "todayOrders": 12,
    "pendingOrders": 1,
    "totalStudents": 45,
    "menuItemCount": 32,
    "todayRevenue": 840.00
  }
}
```

---

#### `GET /admin/orders`
Get all orders with optional filters and pagination.

**Query parameters:**
- `status` — `PENDING|ACCEPTED|PREPARING|READY|COLLECTED|CANCELLED`
- `date` — `YYYY-MM-DD` — filter orders created on this date
- `limit` — 1–100, default 50
- `offset` — pagination offset, default 0

**Errors:** `400` invalid status enum | `400` invalid date format

---

#### `PATCH /admin/orders/:id/status`
Advance or cancel an order status.

**Request body:**
```json
{ "status": "ACCEPTED" }
```

Valid transitions:
- `PENDING → ACCEPTED | CANCELLED`
- `ACCEPTED → PREPARING | CANCELLED`
- `PREPARING → READY`
- `READY → COLLECTED`
- `COLLECTED → (none)`
- `CANCELLED → (none)`

**Errors:** `400` invalid transition | `404` order not found

---

#### `GET /admin/kitchen-queue`
Get active orders (PENDING, ACCEPTED, PREPARING) sorted by pickup time with urgency flags.

**Response 200:**
```json
{
  "success": true,
  "queue": [
    { "...orderFields", "minutesUntilPickup": 8, "isUrgent": true, "isOverdue": false }
  ],
  "count": 3
}
```

---

#### `GET /admin/analytics`
Get aggregated order analytics.

**Query parameter:** `days` — lookback period in days (default 7)

**Response 200:**
```json
{
  "success": true,
  "period": "Last 7 days",
  "summary": {
    "totalOrders": 87, "todayOrders": 12, "totalRevenue": 5040,
    "avgPrepTimeMinutes": 16, "completionRate": 78
  },
  "ordersByStatus": { "COLLECTED": 68, "PENDING": 2, "CANCELLED": 5 },
  "topItems": [ { "id": "...", "name": "Masala Dosa", "category": "BREAKFAST", "totalOrdered": 34 } ],
  "hourlyDistribution": [ { "hour": 8, "count": 5 }, { "hour": 12, "count": 23 } ]
}
```

---

#### Admin Menu Endpoints

Same as student menu endpoints but scoped to the admin namespace:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/menu` | List items (supports `search` param) |
| `POST` | `/admin/menu` | Create item |
| `PUT` | `/admin/menu/:id` | Update item |
| `DELETE` | `/admin/menu/:id` | Delete (soft if has orders) |
| `PATCH` | `/admin/menu/:id/availability` | Toggle on/off |

---

## Database Schema

### Entity Relationship Overview

```
users ─────────────────── 1:N ──→ cart_items
  │                                    └─ N:1 ──→ food_items
  └── 1:N ──→ orders ─── 1:N ──→ order_items ─── N:1 ──→ food_items
```

---

### `users`

Stores both student and admin accounts. Role determines access level.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `String` | PK, CUID | Auto-generated unique identifier |
| `name` | `String` | NOT NULL | Display name |
| `email` | `String` | NOT NULL, UNIQUE | Login email (stored lowercase) |
| `password` | `String` | NOT NULL | bcrypt hash (cost 12) |
| `role` | `Role` enum | NOT NULL, default `STUDENT` | `STUDENT` or `ADMIN` |
| `studentId` | `String` | UNIQUE, nullable | Optional campus student ID |
| `phone` | `String` | nullable | 10-digit mobile number |
| `preferences` | `Json` | default `{}` | Reserved for future preference storage |
| `createdAt` | `DateTime` | default `now()` | Registration timestamp |
| `updatedAt` | `DateTime` | auto-updated | Last modification timestamp |

**Relations:** `cart_items[]`, `orders[]`

---

### `food_items`

Canteen menu catalogue. Managed by admins.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `String` | PK, CUID | Auto-generated unique identifier |
| `name` | `String` | NOT NULL | Dish name |
| `description` | `String` | NOT NULL | Dish description |
| `price` | `Float` | NOT NULL | Price in INR |
| `category` | `Category` enum | NOT NULL | `BREAKFAST|LUNCH|SNACKS|BEVERAGES|DESSERTS|SPECIAL` |
| `image` | `String` | nullable | Unsplash photo URL |
| `isAvailable` | `Boolean` | default `true` | Whether the item can be ordered |
| `prepTimeMinutes` | `Int` | default `10` | Estimated kitchen prep time |
| `rating` | `Float` | default `0` | Bayesian weighted average (0–5) |
| `totalRatings` | `Int` | default `0` | Count of ratings submitted |
| `tags` | `String[]` | default `[]` | e.g. `["popular", "vegetarian"]` |
| `createdAt` | `DateTime` | default `now()` | When item was added to menu |
| `updatedAt` | `DateTime` | auto-updated | Last modification timestamp |

**Relations:** `cartItems[]`, `orderItems[]`

**Soft-delete note:** Items with existing order history are never hard-deleted. Instead, `isAvailable` is set to `false` to preserve order history integrity.

---

### `cart_items`

Transient pre-order basket. Cleared automatically when an order is placed.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `String` | PK, CUID | Auto-generated unique identifier |
| `userId` | `String` | FK → users.id, CASCADE DELETE | Cart owner |
| `foodItemId` | `String` | FK → food_items.id, CASCADE DELETE | The food item |
| `quantity` | `Int` | NOT NULL, default `1` | Quantity (enforced 1–20 in application) |
| `createdAt` | `DateTime` | default `now()` | When item was added to cart |
| `updatedAt` | `DateTime` | auto-updated | Last modification |

**Unique constraint:** `(userId, foodItemId)` — one row per user per item; upsert increments quantity.

---

### `orders`

Placed orders. Immutable after creation except for `status` and timestamp fields.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `String` | PK, CUID | Auto-generated unique identifier |
| `token` | `String` | NOT NULL, UNIQUE | Public display token `ORD-MMDD-8hex` |
| `userId` | `String` | FK → users.id | Order owner |
| `status` | `OrderStatus` enum | NOT NULL, default `PENDING` | Current lifecycle stage |
| `totalAmount` | `Float` | NOT NULL | Total in INR (computed server-side) |
| `pickupTime` | `DateTime` | NOT NULL | Student's chosen pickup time |
| `estimatedPrepTime` | `Int` | default `15` | Minutes until ready (calculated at order creation) |
| `specialInstructions` | `String` | nullable, max 300 chars | Any food instructions |
| `createdAt` | `DateTime` | default `now()` | Order placement timestamp |
| `updatedAt` | `DateTime` | auto-updated | Last status update |
| `acceptedAt` | `DateTime` | nullable | When admin accepted |
| `preparingAt` | `DateTime` | nullable | When kitchen started |
| `readyAt` | `DateTime` | nullable | When order was marked ready |
| `collectedAt` | `DateTime` | nullable | When student collected |
| `cancelledAt` | `DateTime` | nullable | When order was cancelled |

**Relations:** `user`, `items[]`

**`OrderStatus` enum values:** `PENDING`, `ACCEPTED`, `PREPARING`, `READY`, `COLLECTED`, `CANCELLED`

---

### `order_items`

Individual line items within an order. Snapshot of prices at order time.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `String` | PK, CUID | Auto-generated unique identifier |
| `orderId` | `String` | FK → orders.id, CASCADE DELETE | Parent order |
| `foodItemId` | `String` | FK → food_items.id | The food item ordered |
| `quantity` | `Int` | NOT NULL | Quantity ordered |
| `unitPrice` | `Float` | NOT NULL | Price snapshot at time of order |
| `createdAt` | `DateTime` | default `now()` | Line item creation timestamp |

**Note:** `unitPrice` is snapshotted from `food_items.price` at order time so that subsequent menu price changes do not affect historical order amounts.

**Relations:** `order`, `foodItem`

---

### Enums

```
Role:        STUDENT | ADMIN
OrderStatus: PENDING | ACCEPTED | PREPARING | READY | COLLECTED | CANCELLED
Category:    BREAKFAST | LUNCH | SNACKS | BEVERAGES | DESSERTS | SPECIAL
```

---

### Migration

One migration file: `backend/prisma/migrations/20260915114318_init/migration.sql`  
Schema file: `backend/prisma/schema.prisma`

---

## Order Status Workflow

```
PENDING → ACCEPTED → PREPARING → READY → COLLECTED
               ↘                 
            CANCELLED ←────────── (from PENDING or ACCEPTED only)
```

Status transitions are enforced server-side in `admin.controller.js`. Invalid transitions return `400`.

---

## AI Engine

### Pickup Time Prediction (`GET /ai/pickup-slots`)

Reads the current active order load from the database and scores 12 candidate 15-minute slots:

```
basePrepTime = max(item.prepTimeMinutes) + ceil(totalCartQty × 1.5)
earliestPickup = now + basePrepTime + 5 min buffer
slots = 12 × 15-min windows starting from earliestPickup

score(slot) = 100
  - (activeOrdersInSlot × 8)    ← load penalty
  - (15 if peakHour else 0)     ← peak-hour penalty
  + max(0, 30 - waitMinutes)    ← early-pickup bonus
score = clamp(0, 100)
```

Top 3 by score are flagged `recommended: true`. Peak hours: 8am, 9am, 12pm, 1pm, 2pm.

### Food Recommendations (`GET /ai/recommendations`)

Scores all available items using the user's last 20 completed orders:

```
score = rating × 10                        ← base (0–50)
  + category_rank_bonus (30/20/10/0)       ← top 3 favourite categories
  + min(reorder_count × 10, 30)            ← reorder history bonus
  + price_proximity_bonus (15/8/0)         ← within 30%/50% of avg spend
  + popularity_bonus (10 if >150 ratings, +5 if >250)
score = clamp(0, 100)
```

New users with no order history see items sorted by overall rating.

### External AI Integration

Set `AI_API_KEY` + `AI_API_URL` in `.env` to route through any external ML API. The service calls the external endpoint first and falls back to the algorithmic engine on any failure.

---

## Error Handling

### Backend
- **Global error handler** (`error.middleware.js`) catches all unhandled errors
- **Prisma P2002** (unique constraint) → 409 with field name
- **Prisma P2025** (record not found) → 404
- **TokenExpiredError** → 401 "Token expired"
- **JsonWebTokenError** → 401 "Invalid token"
- **Stack traces** hidden in `NODE_ENV=production`
- **404 handler** (`notFound`) for unregistered routes

### Frontend
- **ErrorBoundary** (class component) wraps the entire app in `main.jsx`
- Catches any React render error tree-wide and shows a recovery UI
- Per-page error states for API failures (not just the global boundary)
- Axios interceptor: any `401` response → clears localStorage and redirects to `/login`
- Loading, empty, and error states implemented on every data-fetching page
- `getApiError()` helper normalises all axios error shapes to a string

---

## Security

| Control | Implementation |
|---------|---------------|
| Password storage | bcrypt, cost factor 12 |
| API authentication | JWT Bearer, re-validated against DB on every request |
| Admin routes | `protect + adminOnly` middleware — server-enforced, not just frontend |
| Ownership | Cart and order operations scoped to `req.user.id` |
| Price integrity | Total always calculated from DB prices — frontend sends no price data |
| Input validation | All endpoints: length, range, enum, date, type checks |
| Security headers | `helmet` (CSP, HSTS, X-Frame-Options, etc.) |
| Rate limiting | 200/15min global; 15/15min auth (skips successful requests) |
| Duplicate order prevention | 60-second PENDING window check per user |
| Token entropy | `crypto.randomBytes(4)` — 4.29 billion combinations/day |
| SQL injection | Prisma ORM parameterised queries throughout — no raw string interpolation |
| Secrets | `.env` gitignored; `.env.example` with placeholders only |

---

## Edge Cases Handled

- Empty cart at checkout → `400`
- Unavailable item in cart at checkout → `400` (lists item names)
- Negative / zero / excessive quantity → `400`
- Past pickup time → `400`
- Pickup time > 24h ahead → `400`
- Duplicate rapid order (60s window) → `409`
- Token collision on generation → retry loop (up to 10 attempts)
- Expired JWT mid-session → `401`, frontend redirects to login
- Student accessing another student's order → `404`
- Student hitting admin endpoint → `403`
- Invalid order status transition → `400` with allowed transitions listed
- Invalid menu category enum → `400`
- Admin order query with invalid date → `400`
- Admin order query with oversized limit → silently clamped to 100
- Menu item with order history deleted → soft-delete (marked unavailable)
- Image load failure → FoodImage falls back to category gradient + emoji

---

## Design Thinking Documentation

All research and design thinking artefacts are in `/docs`:

```
docs/
├── 1-empathy-portfolio.md
├── 2-problem-statement.md
├── 3-ai-interaction-audit.md
├── 4-user-testing.md
├── 5-progress-report.md
├── design-thinking/
│   ├── empathy-portfolio.md      ← 5 user personas + empathy maps
│   ├── interview-transcripts.md  ← 4 full transcripts
│   ├── observation-log.md        ← 3 canteen observation sessions
│   ├── problem-definition.md     ← 5W+H problem statement
│   └── user-journey-map.md       ← current + future state journey map
├── ai-audit/
│   ├── ai-interaction-audit.md   ← 15 AI decisions documented
│   └── hallucination-corrections.md
├── validation/
│   ├── user-testing-plan.md
│   ├── user-test-1.md            ← Student tester (laptop)
│   ├── user-test-2.md            ← Student tester (mobile)
│   ├── user-test-3.md            ← Canteen staff tester (admin flow)
│   └── validation-summary.md
├── evidence/
│   ├── screenshots/              ← 20 Puppeteer screenshots (01–20.png)
│   └── demo/demo-script.md       ← 8-minute demo walkthrough
└── review/
    ├── milestone-review-report.md
    ├── phase2-rectification-report.md
    └── final-completion-report.md
```

---

## Project Limitations

The following items are intentionally deferred to future phases:

| ID | Limitation | Notes |
|----|-----------|-------|
| R1 | JWT not invalidated on password change | Requires `tokenVersion` field in schema migration |
| R2 | JWT_SECRET is a placeholder | Deployer must replace with a 64-char random string |
| R3 | No email verification or password reset | Requires SMTP / mail service integration |
| R4 | No push notifications for READY status | Requires service worker + HTTPS + FCM |
| R5 | Student ratings not scoped per-order | Any student can rate any item regardless of order history |

---

*Built with React + Node.js + PostgreSQL + Prisma + Tailwind CSS*  
*AI engine: algorithmic with external API escape hatch*  
*Rathinam Technical Campus — September 2026*
