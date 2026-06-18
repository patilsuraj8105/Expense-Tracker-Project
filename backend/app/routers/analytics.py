from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.analytics import AnalyticsSummary, CategoryAnalytics, MonthlyAnalytics
from app.models.user import User
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary", response_model=AnalyticsSummary)
def read_analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics_service.get_summary(db=db, user_id=current_user.id)

@router.get("/category", response_model=List[CategoryAnalytics])
def read_category_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics_service.get_category_analytics(db=db, user_id=current_user.id)

@router.get("/monthly", response_model=List[MonthlyAnalytics])
def read_monthly_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics_service.get_monthly_analytics(db=db, user_id=current_user.id)
