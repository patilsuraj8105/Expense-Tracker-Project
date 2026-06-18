from sqlalchemy.orm import Session
from sqlalchemy.sql import func, extract
from app.models.expense import Expense
from app.schemas.analytics import AnalyticsSummary, CategoryAnalytics, MonthlyAnalytics
from typing import List

def get_summary(db: Session, user_id: str) -> AnalyticsSummary:
    total_expenses = db.query(func.sum(Expense.amount)).filter(Expense.user_id == user_id).scalar() or 0.0
    total_transactions = db.query(func.count(Expense.id)).filter(Expense.user_id == user_id).scalar() or 0
    
    top_category_row = db.query(
        Expense.category, func.sum(Expense.amount).label("total")
    ).filter(Expense.user_id == user_id).group_by(Expense.category).order_by(func.sum(Expense.amount).desc()).first()
    
    top_category = top_category_row.category if top_category_row else ""
    average_expense = (total_expenses / total_transactions) if total_transactions > 0 else 0.0
    
    return AnalyticsSummary(
        total_expenses=total_expenses,
        total_transactions=total_transactions,
        top_category=top_category,
        average_expense=average_expense
    )

def get_category_analytics(db: Session, user_id: str) -> List[CategoryAnalytics]:
    results = db.query(
        Expense.category, func.sum(Expense.amount).label("total")
    ).filter(Expense.user_id == user_id).group_by(Expense.category).all()
    
    return [CategoryAnalytics(category=row.category, total_amount=row.total) for row in results]

def get_monthly_analytics(db: Session, user_id: str) -> List[MonthlyAnalytics]:
    # Use database agnostic approach or specific string formatting based on db
    # For simplicity and standard SQL, we use extract month/year
    results = db.query(
        extract('year', Expense.expense_date).label('year'),
        extract('month', Expense.expense_date).label('month'),
        func.sum(Expense.amount).label('total')
    ).filter(Expense.user_id == user_id).group_by('year', 'month').order_by('year', 'month').all()
    
    monthly_data = []
    for row in results:
        month_str = f"{int(row.year):04d}-{int(row.month):02d}"
        monthly_data.append(MonthlyAnalytics(month=month_str, total_amount=row.total))
        
    return monthly_data
