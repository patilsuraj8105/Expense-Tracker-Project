from pydantic import BaseModel, Field
from datetime import datetime

class BudgetBase(BaseModel):
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2000)
    amount: float = Field(gt=0)

class BudgetCreate(BudgetBase):
    pass

class BudgetResponse(BudgetBase):
    id: str
    user_id: str
    created_at: datetime

    model_config = {"from_attributes": True}

class BudgetStatus(BaseModel):
    budget: float
    spent: float
    remaining: float
    percentage_used: float

class BudgetPredictionResponse(BaseModel):
    target_month: int
    target_year: int
    predicted_budget: float
    average_monthly_spending: float
    last_month_spending: float
    anomalies_excluded_count: int
    normal_expenses_count: int

