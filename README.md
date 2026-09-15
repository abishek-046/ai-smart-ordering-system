# AI-Smart Ordering System

A full-stack web application for college canteen pre-ordering, AI-powered pickup time prediction, digital token generation, and order tracking.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT + bcrypt
- **AI Engine:** Algorithmic recommendation engine (modular — swap in external API via env vars)

---

## Project Structure

```
smart-ordering/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── src/
│   │   ├── controllers/          # Route handlers
│   │   ├── middleware/           # Auth, error handling
│   │   ├── routes/               # Express routers
│   │   ├── services/             # Business logic & AI engine
│   │   └── utils/                # Helpers (token, time)
│   ├── .env                      # Local env (not committed)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── context/              # React context (Auth, Cart)
│   │   ├── hooks/                # Custom React hooks
│   │   ├── pages/                # All page components
│   │   ├── services/             # Axios API service layer
│   │   └── utils/                # Frontend utilities
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

---

## Setup Instructions

### 1. Clone and install dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure environment variables

```bash
# Copy the example env file
cp .env.example backend/.env
```

Edit `backend/.env` with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/smart_ordering"
JWT_SECRET="change-this-to-a-long-random-string"
JWT_EXPIRES_IN="7d"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

### 3. Create the database

```bash
# In PostgreSQL (psql or pgAdmin)
CREATE DATABASE smart_ordering;
```

### 4. Run database migrations

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Seed the database (optional but recommended)

```bash
cd backend
node src/utils/seed.js
```

This creates:
- 1 admin account: `admin@canteen.com` / `admin123`
- 1 student account: `student@test.com` / `student123`
- Sample menu items across categories

### 6. Run the application

**Backend** (port 5000):
```bash
cd backend
npm run dev
```

**Frontend** (port 5173):
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Documentation

Base URL: `http://localhost:5000/api`

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new student | No |
| POST | `/auth/login` | Login (student or admin) | No |
| GET | `/auth/me` | Get current user | JWT |

### Menu Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/menu` | List all available items | No |
| GET | `/menu/:id` | Get food item details | No |
| POST | `/menu` | Create food item | Admin |
| PUT | `/menu/:id` | Update food item | Admin |
| DELETE | `/menu/:id` | Delete food item | Admin |
| PATCH | `/menu/:id/availability` | Toggle availability | Admin |

### Cart Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/cart` | Get current cart | JWT |
| POST | `/cart/add` | Add item to cart | JWT |
| PUT | `/cart/update` | Update item quantity | JWT |
| DELETE | `/cart/remove/:itemId` | Remove item | JWT |
| DELETE | `/cart/clear` | Clear cart | JWT |

### Order Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/orders` | Create order | JWT |
| GET | `/orders` | Get student's orders | JWT |
| GET | `/orders/:id` | Get order details | JWT |
| GET | `/orders/track/:token` | Track by token | JWT |

### AI Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/ai/pickup-slots` | Recommended pickup times | JWT |
| GET | `/ai/recommendations` | Food recommendations | JWT |

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/orders` | All orders | Admin |
| PATCH | `/admin/orders/:id/status` | Update order status | Admin |
| GET | `/admin/kitchen-queue` | Active kitchen queue | Admin |
| GET | `/admin/analytics` | Order analytics | Admin |
| GET | `/admin/ai-predictions` | AI load predictions | Admin |

---

## AI Engine

The built-in AI engine uses these algorithms:

1. **Pickup Time Prediction**: Calculates optimal slots by analyzing active order count per time window, average preparation time per category, historical order density per hour, and current kitchen workload.

2. **Food Recommendations**: Scores menu items based on user's order history (frequency), category preferences, price range, and item availability + ratings.

Swap in an external ML API by setting `AI_API_KEY` and `AI_API_URL` in `.env`. The service layer checks for these values and routes accordingly.

---

## Order Status Workflow

```
PENDING → ACCEPTED → PREPARING → READY → COLLECTED
                                       ↘ CANCELLED
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | JWT expiry (default: 7d) |
| `PORT` | No | Backend port (default: 5000) |
| `FRONTEND_URL` | No | CORS origin (default: http://localhost:5173) |
| `AI_API_KEY` | No | External AI API key |
| `AI_API_URL` | No | External AI API base URL |

---

## 40% Milestone Coverage

- [x] Student registration & login with JWT
- [x] Secure password hashing (bcrypt)
- [x] PostgreSQL database with Prisma ORM
- [x] Full menu stored in database
- [x] Cart add/remove/update
- [x] Real order creation via backend API
- [x] Unique digital token generation
- [x] Pickup time selection
- [x] AI pickup slot recommendation
- [x] AI food recommendations
- [x] Estimated prep/wait time calculation
- [x] Order status workflow (Pending→Accepted→Preparing→Ready→Collected)
- [x] Live order tracking
- [x] Order history
- [x] Admin order view & status update
- [x] Admin menu management
- [x] Kitchen queue (sorted by pickup time)
- [x] Basic analytics dashboard
- [x] Loading states, validation, error handling
