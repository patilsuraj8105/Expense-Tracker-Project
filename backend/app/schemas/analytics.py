from pydantic import BaseModel
from typing import Dict, Any, List

class AnalyticsSummary(BaseModel):
    total_expenses: float
    total_transactions: int
    top_category: str
    average_expense: float

class CategoryAnalytics(BaseModel):
    category: str
    total_amount: float

class MonthlyAnalytics(BaseModel):
    month: str # e.g., "2026-01"
    total_amount: float
