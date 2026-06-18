from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetStatus, BudgetPredictionResponse
from app.schemas.overspend import OverspendPredictInput, OverspendPredictResponse
from app.models.user import User
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.services import budget_service

router = APIRouter(prefix="/budget", tags=["budgets"])

@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_budget(
    budget_in: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return budget_service.create_or_update_budget(db=db, budget_in=budget_in, user_id=current_user.id)

@router.get("/status", response_model=BudgetStatus)
def read_budget_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return budget_service.get_budget_status(db=db, user_id=current_user.id)

@router.get("/predict", response_model=BudgetPredictionResponse)
def predict_budget(
    month: Optional[int] = Query(None, ge=1, le=12, description="Target month for budget prediction"),
    year: Optional[int] = Query(None, ge=2000, description="Target year for budget prediction"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now()
    if month is None or year is None:
        if now.month == 12:
            target_month = 1
            target_year = now.year + 1
        else:
            target_month = now.month + 1
            target_year = now.year
    else:
        target_month = month
        target_year = year
        
    return budget_service.predict_budget(
        db=db, 
        user_id=current_user.id, 
        target_month=target_month, 
        target_year=target_year
    )

@router.post("/predict-overspend", response_model=OverspendPredictResponse)
def predict_expense_overspend(
    input_data: OverspendPredictInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return budget_service.predict_overspend_likelihood(
        db=db,
        user_id=current_user.id,
        category=input_data.category,
        amount=input_data.amount,
        month=input_data.month,
        year=input_data.year
    )

@router.post("/train-overspend", status_code=status.HTTP_200_OK)
def train_overspend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return budget_service.retrain_overspend_model_handler(db=db, user_id=current_user.id)
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))

