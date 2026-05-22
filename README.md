# Aurum — Luxury Hotel Management System

A full-stack hotel management platform with three isolated portals: Platform Admin, Hotel Admin, and Guest Portal. Built with a dark gold luxury theme throughout.

---

## Tech Stack

| Layer    | Technology                                        |
|----------|---------------------------------------------------|
| Backend  | Python 3.13 · FastAPI · SQLModel · SQLite         |
| Frontend | React 18 · Vite · TypeScript · Tailwind CSS       |
| UI       | Framer Motion · Lucide Icons · Recharts           |
| State    | Zustand · TanStack React Query                    |
| Auth     | JWT (python-jose) · bcrypt (passlib)              |

---

## Quick Start

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run the server
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

On first run, a default platform admin is seeded automatically:
- **Email:** admin@luxury.com
- **Password:** admin123

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

App available at: http://localhost:5173

---

## Portals & Demo Accounts

| Portal           | Route         | How to access                              |
|------------------|---------------|--------------------------------------------|
| Platform Admin   | `/admin/*`    | Login with `admin@luxury.com` / `admin123` |
| Hotel Admin      | `/hotel/*`    | Register with role "Hotel Manager"         |
| Guest Portal     | `/app/*`      | Register with role "Guest"                 |

---

## Feature Walkthrough

### Platform Admin
1. Log in at `/login` with admin credentials
2. View KPIs on the Dashboard
3. Go to Hotels → Approve or reject hotel registrations
4. Go to Users → Block/unblock guest accounts
5. Go to Commission → View platform earnings

### Hotel Admin
1. Register a new account at `/register` → select "Hotel Manager"
2. Go to My Hotel → Submit your property for approval
3. Once approved: add rooms with pricing and amenities
4. Manage incoming bookings, confirm or cancel them
5. View revenue breakdown and commission stats

### Guest Portal
1. Register at `/register` → select "Guest"
2. Search hotels by city, dates, guests, and price range
3. Browse results, view hotel details, select a room
4. Complete checkout with dates and special requests
5. Track reservations in My Bookings, cancel if needed

---

## Project Structure

```
hotel-management-system/
├── backend/
│   ├── main.py              # FastAPI entry, seeds admin
│   ├── database.py          # SQLite + session
│   ├── config.py            # Settings
│   ├── core/                # JWT, bcrypt, role guards
│   ├── models/              # SQLModel tables
│   ├── schemas/             # Pydantic schemas
│   ├── routers/
│   │   ├── public/          # /api/auth, /api/public (no auth)
│   │   ├── admin/           # /api/admin/* (platform_admin only)
│   │   ├── hotel/           # /api/hotel/* (hotel_admin only)
│   │   └── user/            # /api/user/*  (user only)
│   └── services/            # Business logic layer
│
└── frontend/
    └── src/
        ├── portals/
        │   ├── admin/       # Platform admin portal
        │   ├── hotel/       # Hotel admin portal
        │   └── user/        # Guest portal
        └── shared/          # API client, stores, UI components
```

---

## Environment Variables

### Backend `.env`
```
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./hotel.db
CORS_ORIGINS=["http://localhost:5173"]
COMMISSION_RATE=0.10
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:8000
```

---

## Commission Model

- Platform takes **10%** of each confirmed booking's total
- Commission is recorded automatically when a hotel admin confirms a booking
- Viewable in the Platform Admin → Commission page

---

*Aurum — Where luxury meets precision.*
