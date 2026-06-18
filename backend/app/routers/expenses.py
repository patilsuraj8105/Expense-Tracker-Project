from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse, SMSExpenseInput
from app.models.user import User
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.services import expense_service

router = APIRouter(prefix="/expenses", tags=["expenses"])

@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_in: ExpenseCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return expense_service.create_expense(db=db, expense=expense_in, user_id=current_user.id)

@router.get("", response_model=List[ExpenseResponse])
def read_expenses(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = Query(None, max_length=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=422, detail="start_date must be on or before end_date")

    return expense_service.get_expenses(
        db=db, 
        user_id=current_user.id, 
        skip=skip, 
        limit=limit, 
        category=category, 
        start_date=start_date, 
        end_date=end_date,
        search=search
    )

@router.get("/{id}", response_model=ExpenseResponse)
def read_expense(
    id: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    expense = expense_service.get_expense(db=db, expense_id=id, user_id=current_user.id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.put("/{id}", response_model=ExpenseResponse)
def update_expense(
    id: str, 
    expense_in: ExpenseUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    expense = expense_service.update_expense(db=db, expense_id=id, expense_update=expense_in, user_id=current_user.id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    id: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    success = expense_service.delete_expense(db=db, expense_id=id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    return None

@router.post("/auto-track", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def auto_track_expense(
    sms_in: SMSExpenseInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return expense_service.parse_and_create_expense_from_sms(db=db, sms_input=sms_in, user_id=current_user.id)
