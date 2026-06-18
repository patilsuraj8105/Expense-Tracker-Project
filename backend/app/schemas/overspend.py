from pydantic import BaseModel, Field
from typing import Optional

class OverspendPredictInput(BaseModel):
    category: str
    amount: float = Field(gt=0, description="Amount must be greater than 0")
    month: Optional[int] = Field(None, ge=1, le=12, description="Target month for prediction")
    year: Optional[int] = Field(None, ge=2000, description="Target year for prediction")

class OverspendPredictResponse(BaseModel):
    will_overspend: bool
    confidence: float = Field(..., description="The probability likelihood of overspending (0.0 to 1.0)")
    current_budget: float = Field(..., description="Active budget for the month")
    current_spent: float = Field(..., description="Current running total spent this month")
