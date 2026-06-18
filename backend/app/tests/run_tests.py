import os
import sys
import unittest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend path to sys.path so we can import app modules properly
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, backend_dir)

from app.database import Base
from app.models.expense import Expense
from app.services.expense_service import get_expenses

class TestExpenseDateFilters(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Setup SQLite in-memory database
        cls.engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        cls.Session = sessionmaker(bind=cls.engine)
        Base.metadata.create_all(cls.engine)
        
        cls.db = cls.Session()
        cls.user_id = "test-user-id"
        
        # Seed test expenses
        cls.e1 = Expense(id="e1", title="Expense 1", amount=100.0, category="Food", expense_date=date(2026, 6, 1), user_id=cls.user_id)
        cls.e2 = Expense(id="e2", title="Expense 2", amount=200.0, category="Travel", expense_date=date(2026, 6, 5), user_id=cls.user_id)
        cls.e3 = Expense(id="e3", title="Expense 3", amount=300.0, category="Bills", expense_date=date(2026, 6, 10), user_id=cls.user_id)
        
        cls.db.add_all([cls.e1, cls.e2, cls.e3])
        cls.db.commit()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()
        Base.metadata.drop_all(cls.engine)

    def test_no_filter(self):
        res = get_expenses(self.db, self.user_id)
        self.assertEqual(len(res), 3)

    def test_start_date_filter(self):
        res = get_expenses(self.db, self.user_id, start_date=date(2026, 6, 5))
        self.assertEqual(len(res), 2)
        self.assertTrue(all(e.id in ["e2", "e3"] for e in res))

    def test_end_date_filter(self):
        res = get_expenses(self.db, self.user_id, end_date=date(2026, 6, 5))
        self.assertEqual(len(res), 2)
        self.assertTrue(all(e.id in ["e1", "e2"] for e in res))

    def test_range_filter(self):
        res = get_expenses(self.db, self.user_id, start_date=date(2026, 6, 2), end_date=date(2026, 6, 8))
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0].id, "e2")

if __name__ == "__main__":
    unittest.main()
