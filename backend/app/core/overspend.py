import os
import warnings
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sqlalchemy.orm import Session
from app.models.expense import Expense
from app.models.budget import Budget

MODEL_PATH = "overspend_model.pkl"
_model = None

CATEGORY_MAPPING = {
    "food": 0,
    "travel": 1,
    "utilities": 2,
    "shopping": 3,
    "medical": 4,
    "entertainment": 5,
    "others": 6
}

def encode_category(category_name: str) -> int:
    cat_lower = str(category_name).lower().strip()
    return CATEGORY_MAPPING.get(cat_lower, CATEGORY_MAPPING["others"])

def get_overspend_model():
    """
    Loads and caches the pre-trained RandomForestClassifier model.
    """
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            # Create a fallback classifier if pickle doesn't exist
            m = RandomForestClassifier(n_estimators=100, random_state=42)
            # Dummy fit with matching feature names to prevent warnings
            X_dummy = pd.DataFrame([
                {"Category": 0, "Month": 1, "Budget": 1000.0, "Amount": 10.0},
                {"Category": 0, "Month": 1, "Budget": 1000.0, "Amount": 2000.0}
            ])
            y_dummy = np.array([0, 1])
            m.fit(X_dummy, y_dummy)
            joblib.dump(m, MODEL_PATH)
            _model = m
        else:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", category=UserWarning)
                try:
                    from sklearn.exceptions import InconsistentVersionWarning
                    warnings.simplefilter("ignore", category=InconsistentVersionWarning)
                except ImportError:
                    pass
                _model = joblib.load(MODEL_PATH)
    return _model

def predict_overspend(category: str, month: int, budget: float, amount: float) -> tuple[bool, float]:
    """
    Predicts whether a proposed expense will result in overspending.
    Returns: (will_overspend: bool, confidence: float)
    """
    model = get_overspend_model()
    
    category_encoded = encode_category(category)
    
    # Features format matching training: ['Category', 'Month', 'Budget', 'Amount']
    df_features = pd.DataFrame([{
        "Category": category_encoded,
        "Month": month,
        "Budget": float(budget),
        "Amount": float(amount)
    }])
    
    prediction = model.predict(df_features)[0]
    
    # Calculate probability/confidence if classes [0, 1] are present
    if hasattr(model, "predict_proba") and len(model.classes_) > 1:
        probs = model.predict_proba(df_features)[0]
        # class 1 is overspend
        class_idx = list(model.classes_).index(1)
        confidence = float(probs[class_idx])
    else:
        confidence = 1.0 if prediction == 1 else 0.0
        
    return bool(prediction == 1), confidence

def train_overspend_model(db: Session, user_id: str) -> dict:
    """
    Dynamically trains the RandomForestClassifier based on user's history.
    """
    # 1. Fetch user expenses sorted chronologically
    expenses = db.query(Expense).filter(Expense.user_id == user_id).order_by(Expense.expense_date.asc(), Expense.created_at.asc()).all()
    
    # 2. Fetch user budgets
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    
    if not expenses:
        raise ValueError("Cannot train model: No expense history found for this user.")
        
    # Map budgets for quick lookup: {(year, month): budget_amount}
    budget_map = {(b.year, b.month): float(b.amount) for b in budgets}
    
    # Fallback default budget in case none are set
    avg_budget = np.mean([b.amount for b in budgets]) if budgets else 5000.0
    
    # 3. Formulate dataset
    X_data = []
    y_data = []
    
    # Keep track of running spent totals per month/year
    spent_track = {}
    
    for exp in expenses:
        year = exp.expense_date.year
        month = exp.expense_date.month
        month_key = (year, month)
        
        # Get budget for that specific month, fallback to default budget
        month_budget = budget_map.get(month_key, avg_budget)
        
        # Calculate running monthly total
        current_spent = spent_track.get(month_key, 0.0)
        new_spent = current_spent + float(exp.amount)
        spent_track[month_key] = new_spent
        
        # Label: 1 if spending so far (including current) exceeds budget, else 0
        label = 1 if new_spent > month_budget else 0
        
        X_data.append([
            encode_category(exp.category),
            month,
            month_budget,
            float(exp.amount)
        ])
        y_data.append(label)
        
    # Inject synthetic samples to guarantee both classes (0 and 1) are present for stable RandomForest training
    unique_labels = set(y_data)
    if len(unique_labels) < 2:
        # If all are normal (0), add an extreme overspending example
        if 0 in unique_labels:
            X_data.append([encode_category("Others"), 1, avg_budget, avg_budget * 2.0])
            y_data.append(1)
        # If all are overspent (1), add a negligible spending example
        else:
            X_data.append([encode_category("Others"), 1, avg_budget, 1.0])
            y_data.append(0)
            
    # Convert to pandas DataFrame with matching feature names
    df_train = pd.DataFrame(X_data, columns=["Category", "Month", "Budget", "Amount"])
    y = np.array(y_data)
    
    # 4. Train Random Forest model
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(df_train, y)
    
    # 5. Save model back to MODEL_PATH
    joblib.dump(clf, MODEL_PATH)
    
    # Clear cache
    global _model
    _model = clf
    
    return {
        "status": "success",
        "samples_trained": len(df_train),
        "user_expenses": len(expenses),
        "user_budgets": len(budgets),
        "classes_found": [int(c) for c in clf.classes_],
        "feature_importances": [float(fi) for fi in clf.feature_importances_]
    }
