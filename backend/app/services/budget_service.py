from sqlalchemy.orm import Session
from sqlalchemy.sql import extract, func
from app.models.budget import Budget
from app.models.expense import Expense
from app.schemas.budget import BudgetCreate
from datetime import datetime
from typing import Optional

def create_or_update_budget(db: Session, budget_in: BudgetCreate, user_id: str):
    db_budget = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.month == budget_in.month,
        Budget.year == budget_in.year
    ).first()
    
    if db_budget:
        db_budget.amount = budget_in.amount
    else:
        db_budget = Budget(**budget_in.model_dump(), user_id=user_id)
        db.add(db_budget)
        
    db.commit()
    db.refresh(db_budget)
    return db_budget

def get_budget_status(db: Session, user_id: str):
    now = datetime.now()
    current_month = now.month
    current_year = now.year
    
    db_budget = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.month == current_month,
        Budget.year == current_year
    ).first()
    
    budget_amount = db_budget.amount if db_budget else 0.0
    
    spent_query = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == user_id,
        extract('month', Expense.expense_date) == current_month,
        extract('year', Expense.expense_date) == current_year
    ).scalar()
    
    spent = spent_query if spent_query else 0.0
    remaining = budget_amount - spent
    percentage_used = (spent / budget_amount * 100) if budget_amount > 0 else 0.0
    
    return {
        "budget": budget_amount,
        "spent": spent,
        "remaining": remaining,
        "percentage_used": round(percentage_used, 2)
    }

def predict_budget(db: Session, user_id: str, target_month: int, target_year: int):
    # 1. Fetch normal expenses and anomalies using the DB column
    normal_expenses = db.query(Expense).filter(
        Expense.user_id == user_id,
        Expense.is_anomaly == False
    ).order_by(Expense.expense_date.asc()).all()
    
    anomalies_count = db.query(Expense).filter(
        Expense.user_id == user_id,
        Expense.is_anomaly == True
    ).count()
    
    if not normal_expenses:
        # If there are no normal expenses, check if the user has any expenses at all
        all_expenses = db.query(Expense).filter(Expense.user_id == user_id).order_by(Expense.expense_date.asc()).all()
        if not all_expenses:
            return {
                "target_month": target_month,
                "target_year": target_year,
                "predicted_budget": 0.0,
                "average_monthly_spending": 0.0,
                "last_month_spending": 0.0,
                "anomalies_excluded_count": 0,
                "normal_expenses_count": 0
            }
        # Fallback to all expenses to avoid zero data if all are anomalies
        normal_expenses = all_expenses
        anomalies_count = 0
        
    # 3. Group normal expenses by (year, month) to calculate monthly totals
    monthly_totals = {}
    for exp in normal_expenses:
        key = (exp.expense_date.year, exp.expense_date.month)
        monthly_totals[key] = monthly_totals.get(key, 0.0) + exp.amount
        
    # 4. Average monthly normal spending
    total_spending = sum(monthly_totals.values())
    num_months = len(monthly_totals)
    avg_monthly_spending = (total_spending / num_months) if num_months > 0 else 0.0
    
    # 5. Determine the spending of the last month that has data (relative to target)
    if target_month == 1:
        prev_month = 12
        prev_year = target_year - 1
    else:
        prev_month = target_month - 1
        prev_year = target_year
        
    last_month_spending = monthly_totals.get((prev_year, prev_month), 0.0)
    
    # If the immediately preceding month has no data, find the latest recorded chronological month before target
    if last_month_spending == 0.0 and monthly_totals:
        sorted_keys = sorted(monthly_totals.keys())
        past_keys = [k for k in sorted_keys if k < (target_year, target_month)]
        if past_keys:
            last_month_spending = monthly_totals[past_keys[-1]]
            
    # 6. Predict recommended budget
    # Check if there are past years' data for the same target month (seasonality)
    same_month_totals = [val for key, val in monthly_totals.items() if key[1] == target_month]
    
    if same_month_totals:
        same_month_avg = sum(same_month_totals) / len(same_month_totals)
        # Recommendation: weighted average of specific seasonal month and overall average
        predicted_budget = 0.7 * same_month_avg + 0.3 * avg_monthly_spending
    elif last_month_spending > 0:
        # Recommendation: blend of last month's spending and overall average
        predicted_budget = 0.5 * last_month_spending + 0.5 * avg_monthly_spending
    else:
        predicted_budget = avg_monthly_spending
        
    return {
        "target_month": target_month,
        "target_year": target_year,
        "predicted_budget": round(predicted_budget, 2),
        "average_monthly_spending": round(avg_monthly_spending, 2),
        "last_month_spending": round(last_month_spending, 2),
        "anomalies_excluded_count": anomalies_count,
        "normal_expenses_count": len(normal_expenses)
    }

def predict_overspend_likelihood(
    db: Session, 
    user_id: str, 
    category: str, 
    amount: float, 
    month: Optional[int] = None, 
    year: Optional[int] = None
):
    now = datetime.now()
    target_month = month if month is not None else now.month
    target_year = year if year is not None else now.year
    
    # 1. Get the set budget for the month
    db_budget = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.month == target_month,
        Budget.year == target_year
    ).first()
    budget_amount = db_budget.amount if db_budget else 0.0
    
    # 2. Get current running spent this month
    spent_query = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == user_id,
        extract('month', Expense.expense_date) == target_month,
        extract('year', Expense.expense_date) == target_year
    ).scalar()
    current_spent = float(spent_query) if spent_query else 0.0
    
    # 3. Predict overspend using ML core
    from app.core.overspend import predict_overspend
    will_overspend, confidence = predict_overspend(
        category=category,
        month=target_month,
        budget=budget_amount,
        amount=amount
    )
    
    # 4. Strict check override: If transaction math mathematically breaches budget, flag True
    if budget_amount > 0 and (current_spent + amount) > budget_amount:
        will_overspend = True
        confidence = max(confidence, 1.0)
        
    return {
        "will_overspend": will_overspend,
        "confidence": round(confidence, 4),
        "current_budget": budget_amount,
        "current_spent": current_spent
    }

def retrain_overspend_model_handler(db: Session, user_id: str):
    from app.core.overspend import train_overspend_model
    return train_overspend_model(db, user_id)

