import re
from sqlalchemy.orm import Session
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, SMSExpenseInput
from typing import Optional
from datetime import date
from fastapi import HTTPException

def create_expense(db: Session, expense: ExpenseCreate, user_id: str):
    db_expense = Expense(**expense.model_dump(), user_id=user_id)
    
    # Fetch historical expense amounts for this user & category to compute overrides
    category_history = [
        float(r[0]) for r in db.query(Expense.amount).filter(
            Expense.user_id == user_id,
            Expense.category == db_expense.category
        ).all()
    ]
    
    # Calculate anomaly status
    from app.core.anomaly import predict_expense_anomaly_hybrid
    try:
        db_expense.is_anomaly = predict_expense_anomaly_hybrid(db_expense, category_history)
    except Exception:
        db_expense.is_anomaly = False

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def get_expenses(
    db: Session, 
    user_id: str, 
    skip: int = 0, 
    limit: int = 20,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None
):
    query = db.query(Expense).filter(Expense.user_id == user_id)
    
    if category:
        query = query.filter(Expense.category == category)
    if start_date:
        query = query.filter(Expense.expense_date >= start_date)
    if end_date:
        query = query.filter(Expense.expense_date <= end_date)
    if search:
        query = query.filter(Expense.title.ilike(f"%{search.strip()}%"))
        
    query = query.order_by(Expense.expense_date.desc(), Expense.amount.desc())
    return query.offset(skip).limit(limit).all()

def get_expense(db: Session, expense_id: str, user_id: str):
    return db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user_id).first()

def update_expense(db: Session, expense_id: str, expense_update: ExpenseUpdate, user_id: str):
    db_expense = get_expense(db, expense_id, user_id)
    if not db_expense:
        return None
    
    update_data = expense_update.model_dump(exclude_unset=True)
    has_changes = "amount" in update_data or "expense_date" in update_data or "category" in update_data
    
    for key, value in update_data.items():
        setattr(db_expense, key, value)
        
    if has_changes:
        category_history = [
            float(r[0]) for r in db.query(Expense.amount).filter(
                Expense.user_id == user_id,
                Expense.category == db_expense.category,
                Expense.id != db_expense.id
            ).all()
        ]
        from app.core.anomaly import predict_expense_anomaly_hybrid
        try:
            db_expense.is_anomaly = predict_expense_anomaly_hybrid(db_expense, category_history)
        except Exception:
            db_expense.is_anomaly = False
        
    db.commit()
    db.refresh(db_expense)
    return db_expense

def delete_expense(db: Session, expense_id: str, user_id: str):
    db_expense = get_expense(db, expense_id, user_id)
    if not db_expense:
        return False
    
    db.delete(db_expense)
    db.commit()
    return True

def parse_and_create_expense_from_sms(db: Session, sms_input: SMSExpenseInput, user_id: str):
    message = sms_input.message
    sender = sms_input.sender
    
    # 1. Parse Amount
    amount = 0.0
    amount_match = re.search(r'(?i)(?:Rs\.?|INR|spent|debited|charged)\s*(?:by|of)?\s*([0-9,]+(?:\.[0-9]{2})?)', message)
    if amount_match:
        amount_str = amount_match.group(1).replace(",", "")
        try:
            amount = float(amount_str)
        except ValueError:
            pass
            
    if amount <= 0:
        amount_match_fallback = re.search(r'([0-9,]+\.[0-9]{2})', message)
        if amount_match_fallback:
            try:
                amount = float(amount_match_fallback.group(1).replace(",", ""))
            except ValueError:
                pass
                
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Could not parse a valid transaction amount from the message.")

    # 2. Parse Merchant/Title
    merchant = "Unknown Merchant"
    merchant_match = re.search(r'(?i)(?:at|to|info:|on|vpa)\s+([a-zA-Z0-9\s\.\-\*]+?)(?:\s+on|\s+at|\s+date|\s+via|\.|\s+using|\s+balance|\s+ending|\s+ref|\bfor\b|$)', message)
    if merchant_match:
        merchant = merchant_match.group(1).strip()
        merchant = re.sub(r'\s+', ' ', merchant)[:50].strip()
    
    if len(merchant) < 2 or merchant.isdigit():
        merchant = f"Transaction from {sender}"

    # 3. Categorize (Food, Travel, Utilities, Shopping, Medical, Entertainment, etc.)
    category = "Others"
    message_lower = message.lower()
    
    category_mapping = {
        "Food": ["zomato", "swiggy", "starbucks", "mcdonald", "kfc", "restaurant", "cafe", "pizza", "dining", "eats", "grocery", "groceries", "supermarket", "blinkit", "zepto", "instamart"],
        "Travel": ["uber", "ola", "rapido", "irctc", "flight", "indigo", "airasia", "makemytrip", "yatra", "goibibo", "fuel", "petrol", "shell", "hpcl", "bpcl", "metro", "bus", "taxi", "cab", "railway"],
        "Utilities": ["electricity", "power", "bill", "water", "gas", "recharge", "jio", "airtel", "vi", "broadband", "netflix", "spotify", "youtube premium", "prime video", "subscription", "hotstar"],
        "Shopping": ["amazon", "flipkart", "myntra", "meesho", "ajio", "nykaa", "shopping", "mall", "store", "retail"],
        "Medical": ["pharmacy", "chemist", "hospital", "clinic", "doctor", "apollo", "pharmeasy", "1mg", "medicine", "health"],
        "Entertainment": ["bookmyshow", "pvr", "cinema", "movie", "theater", "gaming", "ticket"]
    }
    
    found_category = False
    for cat, keywords in category_mapping.items():
        for keyword in keywords:
            if keyword in message_lower:
                category = cat
                found_category = True
                break
        if found_category:
            break

    # 4. Save Expense
    db_expense = Expense(
        title=f"Auto: {merchant}",
        amount=amount,
        category=category,
        description=f"Auto-tracked SMS from {sender}: {message}",
        expense_date=date.today(),
        user_id=user_id
    )
    
    # Fetch historical expense amounts for this user & category to compute overrides
    category_history = [
        float(r[0]) for r in db.query(Expense.amount).filter(
            Expense.user_id == user_id,
            Expense.category == db_expense.category
        ).all()
    ]
    
    # Calculate anomaly status
    from app.core.anomaly import predict_expense_anomaly_hybrid
    try:
        db_expense.is_anomaly = predict_expense_anomaly_hybrid(db_expense, category_history)
    except Exception:
        db_expense.is_anomaly = False

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense
