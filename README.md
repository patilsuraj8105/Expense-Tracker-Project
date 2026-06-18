# Expense Tracker Backend API

This is a production-ready Expense Tracker Backend API built with FastAPI, SQLAlchemy, and Supabase PostgreSQL.

## Features
- **Authentication**: JWT-based user registration and login.
- **Expenses**: CRUD operations with pagination, sorting, and filtering.
- **Budgets**: Set monthly budgets and view budget status.
- **Analytics**: Get summary, category-wise, and monthly aggregated analytics.
- **Export**: Export expenses to Excel based on date range.

## Prerequisites
- Python 3.9+
- Supabase PostgreSQL database URL

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your actual Supabase PostgreSQL connection string and a secure `SECRET_KEY`.

3. **Database Migrations**
   Generate and apply the initial migration to create tables in your database:
   ```bash
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   ```

4. **Run the Server**
   ```bash
   uvicorn app.main:app --reload
   ```

5. **API Documentation**
   - Swagger UI: `http://127.0.0.1:8000/docs`
   - ReDoc: `http://127.0.0.1:8000/redoc`

## Sample Requests

### 1. Register User
```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}'
```

### 2. Login
```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "john@example.com",
  "password": "securepassword123"
}'
```
*(Copy the access_token from the response)*

### 3. Create Expense
```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/expenses' \
  -H 'Authorization: Bearer <your_token_here>' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Groceries",
  "amount": 150.50,
  "category": "Food",
  "description": "Weekly groceries",
  "expense_date": "2026-06-15"
}'
```

### 4. Get Analytics Summary
```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/analytics/summary' \
  -H 'Authorization: Bearer <your_token_here>'
```
