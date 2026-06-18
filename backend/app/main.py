from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, expenses, analytics, budgets, export

app = FastAPI(
    title="Expense Tracker API",
    description="Backend API for managing expenses, budgets, and analytics.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(budgets.router)
app.include_router(analytics.router)
app.include_router(export.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Expense Tracker API!"}
