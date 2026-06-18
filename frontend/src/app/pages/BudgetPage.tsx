import { useEffect, useState } from "react";
import { Plus, Edit2, Check, X } from "lucide-react";
import { apiFetch } from "../imports/api";
import { CategoryIcon } from "../imports/category_icons";

interface CategoryBudgetConfig {
  name: string;
  budget: number;
  color: string;
}

const DEFAULT_CATEGORY_BUDGETS: CategoryBudgetConfig[] = [
  { name: "Food", budget: 10000, color: "#f59e0b" },
  { name: "Travel", budget: 5000, color: "#818cf8" },
  { name: "Bills", budget: 8000, color: "#22d3ee" },
  { name: "Shopping", budget: 8000, color: "#f472b6" },
  { name: "Health", budget: 4000, color: "#4ade80" },
  { name: "Entertainment", budget: 3000, color: "#c084fc" },
  { name: "Others", budget: 5000, color: "#8b9ab4" },
];

export function BudgetPage() {
  const [budgetStatus, setBudgetStatus] = useState<any>({
    budget: 0,
    spent: 0,
    remaining: 0,
    percentage_used: 0
  });
  const [categorySpends, setCategorySpends] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Dynamic category budgets state
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudgetConfig[]>(() => {
    const saved = localStorage.getItem("category_budgets");
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORY_BUDGETS;
  });

  // Editing overall budget state
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [updating, setUpdating] = useState(false);

  // Manage categories modal state
  const [showManageModal, setShowManageModal] = useState(false);
  const [tempBudgets, setTempBudgets] = useState<CategoryBudgetConfig[]>([]);

  const fetchStatus = async () => {
    try {
      const res = await apiFetch("/budget/status");
      if (res.ok) {
        const data = await res.json();
        setBudgetStatus(data);
        setEditAmount(data.budget.toString());
      }
    } catch (err) {
      console.error("Error fetching budget status:", err);
    }
  };

  const fetchCategorySpends = async () => {
    try {
      const res = await apiFetch("/analytics/category");
      if (res.ok) {
        const data = await res.json();
        const spends: Record<string, number> = {};
        data.forEach((item: any) => {
          spends[item.category.toLowerCase()] = item.total_amount;
        });
        setCategorySpends(spends);
      }
    } catch (err) {
      console.error("Error fetching category spends:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStatus(), fetchCategorySpends()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleUpdateBudget = async () => {
    const amt = parseFloat(editAmount);
    if (isNaN(amt) || amt < 0) return;
    try {
      setUpdating(true);
      const now = new Date();
      const res = await apiFetch("/budget", {
        method: "POST",
        body: JSON.stringify({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          amount: amt
        })
      });
      if (res.ok) {
        setIsEditing(false);
        await fetchStatus();
      }
    } catch (err) {
      console.error("Error updating budget limit:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenManageModal = () => {
    setTempBudgets([...categoryBudgets]);
    setShowManageModal(true);
  };

  const handleSaveCategoryBudgets = () => {
    setCategoryBudgets(tempBudgets);
    localStorage.setItem("category_budgets", JSON.stringify(tempBudgets));
    setShowManageModal(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px]" style={{ color: "var(--muted-foreground)" }}>
        <div style={{ fontSize: 14 }}>Loading budget planner...</div>
      </div>
    );
  }

  const currentMonthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const pct = Math.round(budgetStatus.percentage_used);

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Overview */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        {/* Total Budget Card */}
        <div className="rounded-2xl p-5 relative" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div style={{ color: "var(--muted-foreground)", fontSize: 11, marginBottom: 6 }} className="flex justify-between items-center">
            <span>Overall Budget Limit</span>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={{ background: "none", border: "none", color: "#00d4b4", cursor: "pointer", padding: 0 }}
                title="Edit Budget"
                aria-label="Edit overall budget limit"
              >
                <Edit2 size={12} />
              </button>
            ) : null}
          </div>
          
          {!isEditing ? (
            <div style={{ color: "var(--foreground)", fontSize: 24, fontWeight: 700 }}>
              ₹{budgetStatus.budget.toLocaleString("en-IN")}
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                style={{
                  background: "var(--secondary)",
                  border: "1px solid rgba(0,212,180,0.4)",
                  borderRadius: 6,
                  color: "var(--foreground)",
                  fontSize: 16,
                  fontWeight: 600,
                  width: "120px",
                  padding: "2px 6px",
                  outline: "none"
                }}
                disabled={updating}
                autoFocus
                aria-label="New budget amount"
              />
              <button
                onClick={handleUpdateBudget}
                disabled={updating}
                style={{ background: "none", border: "none", color: "#00d4b4", cursor: "pointer", padding: 2 }}
                aria-label="Confirm budget update"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditAmount(budgetStatus.budget.toString());
                }}
                disabled={updating}
                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 2 }}
                aria-label="Cancel budget update"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Total Spent Card */}
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div style={{ color: "var(--muted-foreground)", fontSize: 11, marginBottom: 6 }}>Total Spent This Month</div>
          <div style={{ color: "#ef4444", fontSize: 24, fontWeight: 700 }}>
            ₹{budgetStatus.spent.toLocaleString("en-IN")}
          </div>
        </div>

        {/* Remaining Card */}
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div style={{ color: "var(--muted-foreground)", fontSize: 11, marginBottom: 6 }}>Remaining Balance</div>
          <div style={{ color: budgetStatus.remaining < 0 ? "#ef4444" : "#00d4b4", fontSize: 24, fontWeight: 700 }}>
            ₹{budgetStatus.remaining.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: "var(--foreground)", fontSize: 13, fontWeight: 600 }}>Overall Budget Usage — {currentMonthName}</span>
          <span style={{ color: pct > 90 ? "#ef4444" : "#00d4b4", fontSize: 13, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div className="rounded-full" style={{ height: 10, background: "var(--background)" }}>
          <div className="rounded-full transition-all duration-300" style={{ height: 10, width: `${Math.min(pct, 100)}%`, background: pct > 90 ? "linear-gradient(90deg,#ef4444,#dc2626)" : "linear-gradient(90deg,#00d4b4,#0891b2)" }} />
        </div>
        <div className="flex justify-between mt-2">
          <span style={{ color: "var(--muted-foreground)", fontSize: 10 }}>₹{budgetStatus.spent.toLocaleString("en-IN")} spent</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: 10 }}>₹{budgetStatus.budget.toLocaleString("en-IN")} budget</span>
        </div>
      </div>

      {/* Categories breakdown */}
      <div className="flex items-center justify-between">
        <span style={{ color: "var(--foreground)", fontSize: 14, fontWeight: 600 }}>Category Budgets (Reference Limits)</span>
        <button
          onClick={handleOpenManageModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all active:scale-98"
          style={{ background: "rgba(0,212,180,0.12)", color: "#00d4b4", fontSize: 12, fontWeight: 600, border: "1px solid rgba(0,212,180,0.2)" }}
          aria-label="Manage Category Budgets"
          title="Manage Categories"
        >
          <Plus size={13} /> Manage Categories
        </button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {categoryBudgets.map((cat, idx) => {
          const spent = categorySpends[cat.name.toLowerCase()] || 0;
          const usagePct = Math.round((spent / cat.budget) * 100);
          const over = spent > cat.budget;
          
          return (
            <div key={idx} className="rounded-2xl p-5" style={{ background: "var(--card)", border: `1px solid ${over ? "rgba(239,68,68,0.2)" : "var(--border)"}` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CategoryIcon category={cat.name} size={18} color={cat.color} />
                  <span style={{ color: "var(--foreground)", fontSize: 13, fontWeight: 600 }}>{cat.name}</span>
                </div>
                {over && (
                  <span className="rounded-full px-2 py-0.5" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", fontSize: 9, fontWeight: 600 }}>
                    Over Reference Limit
                  </span>
                )}
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: over ? "#ef4444" : cat.color, fontSize: 16, fontWeight: 700 }}>
                  ₹{spent.toLocaleString("en-IN")}
                </span>
                <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>/ ₹{cat.budget.toLocaleString("en-IN")}</span>
              </div>
              <div className="rounded-full" style={{ height: 6, background: "var(--background)" }}>
                <div className="rounded-full transition-all duration-300" style={{ height: 6, width: `${Math.min(usagePct, 100)}%`, background: over ? "#ef4444" : cat.color }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span style={{ color: "var(--muted-foreground)", fontSize: 10 }}>{usagePct}% used</span>
                <span style={{ color: over ? "#ef4444" : "#00d4b4", fontSize: 10 }}>
                  {over ? `₹${(spent - cat.budget).toLocaleString("en-IN")} over` : `₹${(cat.budget - spent).toLocaleString("en-IN")} left`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manage Category Budgets Modal */}
      {showManageModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4 shadow-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 style={{ color: "var(--foreground)", fontSize: 16, fontWeight: 700 }}>Manage Reference Limits</h3>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-80">
              {tempBudgets.map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between gap-3 p-2 rounded-lg" style={{ background: "var(--secondary)" }}>
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={cat.name} size={16} color={cat.color} />
                    <span style={{ color: "var(--foreground)", fontSize: 12, fontWeight: 600 }}>{cat.name}</span>
                  </div>
                  <input
                    type="number"
                    value={cat.budget}
                    onChange={(e) => {
                      const updated = [...tempBudgets];
                      updated[idx] = { ...cat, budget: parseFloat(e.target.value) || 0 };
                      setTempBudgets(updated);
                    }}
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      padding: "4px 8px",
                      borderRadius: 6,
                      width: 100,
                      fontSize: 12,
                      textAlign: "right"
                    }}
                    aria-label={`Limit for ${cat.name}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowManageModal(false)}
                className="px-4 py-2 rounded-lg cursor-pointer"
                style={{ color: "var(--muted-foreground)", background: "none", border: "none", fontSize: 12 }}
                aria-label="Cancel editing category budgets"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategoryBudgets}
                className="px-4 py-2 rounded-lg cursor-pointer"
                style={{ background: "linear-gradient(135deg,#00d4b4,#0891b2)", color: "#fff", fontSize: 12, fontWeight: 600, border: "none" }}
                aria-label="Confirm save category budgets"
              >
                Save Limits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
