# Smart Expense Tracker & AI Financial Insights

A premium, production-ready full-stack personal finance application built using a **FastAPI** backend (with SQLAlchemy and Supabase PostgreSQL) and a **Vite + React** frontend. 

The platform leverages machine learning (Random Forest Classifiers) to dynamically predict budget overspending, detect transaction anomalies, and parse subscription patterns.

---

## Key Features

### 💻 Frontend (Vite + React)
- **Interactive Light & Dark Themes**: Client-side theme-switching persisted in `localStorage`.
- **Dynamic AI Notification Bell**: Popover dropdown showing real-time transaction anomalies, auto-sync logs, and system statuses.
- **Dynamic & Editable Category Budgets**: Category limits are loaded from/saved to `localStorage` and can be adjusted via a modern modal in the budget page.
- **Unified Lucide Icon Mapping**: Unified visual iconography replacing raw emojis across all components.
- **Live AI Insight Cards**:
  - *Duplicate Charge Protection*: Scans transactions on the fly to detect and list identical charge matches.
  - *AI Subscription Alerts*: Identifies recurring monthly payments (e.g. Netflix, Spotify) and calculates the projected outflow.
- **Complete Route Registration**: Fully integrated tabs for **Dashboard**, **Transactions**, **Budget**, **Analytics**, **Goals**, **Cards**, **Bills**, and **Savings**.

### ⚙️ Backend (FastAPI + ML)
- **Secure CORS Management**: Comma-separated domain restriction through settings-based origin control.
- **Absolute ML Model Paths**: Pickle files resolved dynamically to eliminate working directory errors.
- **User-Isolated ML Models**: Models are isolated per user (e.g. `overspend_model_{user_id}.pkl`) and cached in-memory to prevent concurrent race conditions during training.
- **Standardized Automated Testing**: Lightweight unit testing framework covering SQL date-range queries.

---

## Tech Stack
* **Frontend**: React 18, React Router 7, Vite 6, TailwindCSS, Lucide React, Recharts.
* **Backend**: FastAPI, Uvicorn, SQLAlchemy, Alembic, PostgreSQL (Supabase), Scikit-Learn, Joblib, Pandas.

---

## Directory Structure
```
├── backend/
│   ├── app/
│   │   ├── core/           # Config, security, ML models (anomaly, overspend)
│   │   ├── models/         # SQLAlchemy models (user, expense, budget)
│   │   ├── routers/        # FastAPI endpoint routers (auth, expenses, etc.)
│   │   ├── services/       # Business logic layer
│   │   └── tests/          # Python automated test suite
│   ├── requirements.txt
│   └── main.py
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/ # Shared layout, cards, notifications dropdown
    │   │   ├── pages/      # Pages (Dashboard, Budget, AIInsights, etc.)
    │   │   └── routes.tsx  # React Router config
    │   ├── styles/         # Global styles & theme configuration
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

---

## Setup & Run Instructions

### 1. Backend API Server Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```
2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your Supabase connection string and custom secrets:
   ```bash
   cp .env.example .env
   ```
4. **Database Migrations**:
   ```bash
   alembic upgrade head
   ```
5. **Run the Uvicorn Server**:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   * Access API Documentation: Swagger UI (`http://127.0.0.1:8000/docs`) or ReDoc (`http://127.0.0.1:8000/redoc`).

---

### 2. Frontend Development Server Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```
2. **Install Node dependencies**:
   ```bash
   npm install
   ```
3. **Run the Vite Server**:
   ```bash
   npm run dev
   ```
   * Open `http://localhost:5173/` in your browser.

---

## Running Automated Tests

To execute the backend date-filtering and service logic tests:
```bash
cd backend
python app/tests/run_tests.py
```
*(This executes standard library `unittest` suites using an isolated, in-memory SQLite database instance).*
