import { useEffect, useState } from "react";
import { apiFetch } from "../imports/api";
import { Edit2, Check } from "lucide-react";

export function BudgetCard() {
  const [budgetData, setBudgetData] = useState({
    budget: 0,
    spent: 0,
    remaining: 0,
    percentage_used: 0
  });
  const [loading, setLoading] = useState(true);
  const [newBudget, setNewBudget] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchBudgetStatus = async () => {
    try {
      const response = await apiFetch("/budget/status");
      if (response.ok) {
        const data = await response.json();
        setBudgetData(data);
      }
    } catch (err) {
      console.error("Error fetching budget status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetStatus();
  }, []);

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget || isNaN(Number(newBudget))) return;
    try {
      const now = new Date();
      const response = await apiFetch("/budget", {
        method: "POST",
        body: JSON.stringify({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          amount: parseFloat(newBudget)
        })
      });
      if (response.ok) {
        setIsEditing(false);
        setNewBudget("");
        fetchBudgetStatus();
      }
    } catch (err) {
      console.error("Error setting budget:", err);
    }
  };

  const percentage = Math.min(Math.round(budgetData.percentage_used), 100);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="rounded-2xl p-5 flex items-center justify-center h-full min-h-[260px]" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
        <span style={{ color: "#8b9ab4", fontSize: 12 }}>Loading budget...</span>
      </div>
    );
  }

  const currentMonthName = new Date().toLocaleString("default", { month: "short" });

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 h-full"
      style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span style={{ color: "#e8eaf0", fontSize: 13, fontWeight: 600 }}>Monthly Budget</span>
        <span
          className="rounded-full px-2 py-0.5"
          style={{ background: "rgba(0,212,180,0.15)", color: "#00d4b4", fontSize: 10, fontWeight: 600 }}
        >
          {currentMonthName} Net
        </span>
      </div>

      {/* Circle */}
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: 140, height: 140 }}>
          <svg width={140} height={140} style={{ transform: "rotate(-90deg)" }}>
            {/* Background track */}
            <circle
              cx={70} cy={70} r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={12}
            />
            {/* Progress */}
            <circle
              cx={70} cy={70} r={radius}
              fill="none"
              stroke="url(#budgetGrad)"
              strokeWidth={12}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
            <defs>
              <linearGradient id="budgetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d4b4" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>
          </svg>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span style={{ color: "#00d4b4", fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{percentage}%</span>
            <span style={{ color: "#8b9ab4", fontSize: 10, marginTop: 2 }}>Used</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col items-center gap-1 mt-2 w-full">
          {isEditing ? (
            <form onSubmit={handleUpdateBudget} className="flex items-center gap-2 mt-1">
              <input
                required
                type="number"
                placeholder="Limit"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                style={{
                  background: "#1a2035",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#e8eaf0",
                  fontSize: 12,
                  padding: "4px 8px",
                  width: 90
                }}
              />
              <button
                type="submit"
                className="cursor-pointer flex items-center justify-center rounded-lg"
                style={{ width: 26, height: 26, background: "rgba(0,212,180,0.15)", border: "none" }}
              >
                <Check size={14} color="#00d4b4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <div style={{ color: "#e8eaf0", fontSize: 20, fontWeight: 700 }}>
                {formatCurrency(budgetData.remaining)}
              </div>
              <button
                onClick={() => {
                  setNewBudget(budgetData.budget.toString());
                  setIsEditing(true);
                }}
                className="cursor-pointer"
                style={{ background: "none", border: "none", padding: 0 }}
              >
                <Edit2 size={12} color="#8b9ab4" />
              </button>
            </div>
          )}
          <div style={{ color: "#8b9ab4", fontSize: 11 }}>
            remaining of {formatCurrency(budgetData.budget)}
          </div>
        </div>

        {/* Bar */}
        <div className="w-full mt-3 rounded-full" style={{ height: 6, background: "rgba(255,255,255,0.08)" }}>
          <div
            className="rounded-full"
            style={{ height: 6, width: `${percentage}%`, background: "linear-gradient(90deg,#00d4b4,#0891b2)" }}
          />
        </div>
        <div className="flex justify-between w-full mt-1">
          <span style={{ color: "#8b9ab4", fontSize: 10 }}>{formatCurrency(budgetData.spent)} spent</span>
          <span style={{ color: "#8b9ab4", fontSize: 10 }}>{formatCurrency(budgetData.budget)}</span>
        </div>
      </div>
    </div>
  );
}
