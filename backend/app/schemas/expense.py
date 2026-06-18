from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional

class ExpenseBase(BaseModel):
    title: str
    amount: float = Field(gt=0, description="Amount must be greater than 0")
    category: str
    description: Optional[str] = None
    expense_date: date

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    description: Optional[str] = None
    expense_date: Optional[date] = None

class ExpenseResponse(ExpenseBase):
    id: str
    user_id: str
    is_anomaly: bool
    created_at: datetime

    model_config = {"from_attributes": True}

class SMSExpenseInput(BaseModel):
    sender: str
    message: str
