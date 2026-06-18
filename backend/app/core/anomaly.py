import os
import warnings
import joblib
import pandas as pd

# Path to the anomaly model (resolved absolutely relative to this file)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "anomaly_model.pkl")

_model = None

def get_anomaly_model():
    """
    Loads and caches the pre-trained IsolationForest model.
    """
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Anomaly model file not found at: {os.path.abspath(MODEL_PATH)}")
        
        # Suppress sklearn unpickling version warnings safely
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=UserWarning)
            try:
                # InconsistentVersionWarning is a subclass of UserWarning in sklearn
                from sklearn.exceptions import InconsistentVersionWarning
                warnings.simplefilter("ignore", category=InconsistentVersionWarning)
            except ImportError:
                pass
            
            _model = joblib.load(MODEL_PATH)
            
    return _model

def batch_predict_anomalies(expenses) -> list[int]:
    """
    Predicts anomaly status for a list of expenses.
    Expects objects with attributes: amount, expense_date (a date or datetime object).
    Returns a list of integers: 1 for normal, -1 for anomaly.
    """
    if not expenses:
        return []
    
    model = get_anomaly_model()
    
    # Extract features matching the model training: ['Amount', 'Month', 'Day', 'DayOfWeek']
    data = []
    for exp in expenses:
        data.append({
            "Amount": float(exp.amount),
            "Month": int(exp.expense_date.month),
            "Day": int(exp.expense_date.day),
            "DayOfWeek": int(exp.expense_date.weekday())  # 0=Monday, 6=Sunday
        })
        
    df = pd.DataFrame(data)
    
    # Predict using IsolationForest
    predictions = model.predict(df)
    return [int(p) for p in predictions]

def predict_expense_anomaly_hybrid(expense, category_history: list[float]) -> bool:
    """
    Predicts if a single expense is an anomaly using a hybrid approach.
    Runs IsolationForest model and refines its output using IQR-based bounds
    calculated from the user's historical category-specific spending.
    """
    # 1. Base IsolationForest Prediction
    predictions = batch_predict_anomalies([expense])
    if not predictions or predictions[0] == 1:
        # Base model thinks it's normal
        return False
        
    # Model thinks it's an anomaly. Apply statistical overrides if history exists.
    if len(category_history) >= 5:
        import numpy as np
        amounts = sorted([float(amt) for amt in category_history])
        q1 = np.percentile(amounts, 25)
        q3 = np.percentile(amounts, 75)
        iqr = q3 - q1
        
        # Override threshold: only flag if it exceeds standard IQR limit,
        # is at least 1.5x the median, and exceeds a minimum noise threshold of 1000.0 (INR)
        median = np.median(amounts)
        threshold = max(q3 + 1.5 * iqr, 1.5 * median, 1000.0)
        
        if float(expense.amount) <= threshold:
            return False
            
    return True
