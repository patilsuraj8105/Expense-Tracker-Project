import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { apiFetch } from "../imports/api";

export function StatCards() {
  const [topCategory, setTopCategory] = useState("None");
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await apiFetch("/analytics/summary");
        if (response.ok) {
          const data = await response.json();
          setTopCategory(data.top_category || "None");
          setTotalExpenses(data.total_expenses || 0);
        }
      } catch (err) {
        console.error("Error fetching analytics summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "food":
        return "🍽️";
      case "travel":
        return "🚗";
      case "shopping":
        return "🛍️";
      case "utilities":
        return "⚡";
      default:
        return "💳";
    }
  };

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
      {/* Card 1: Top Category */}
      <div
        className="rounded-2xl p-5 flex flex-col gap-3"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div style={{ color: "var(--muted-foreground)", fontSize: 11, fontWeight: 500 }}>Top Category</div>
            <div style={{ color: "var(--muted-foreground)", fontSize: 10, marginTop: 1 }}>Highest Spending Sector</div>
          </div>
          <div
            className="rounded-xl flex items-center justify-center"
            style={{ width: 38, height: 38, background: "rgba(245,158,11,0.15)", fontSize: 18 }}
          >
            {getCategoryIcon(topCategory)}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--foreground)", fontSize: 22, fontWeight: 700 }}>
            {loading ? "Loading..." : topCategory}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={12} color="#00d4b4" />
            <span style={{ color: "#00d4b4", fontSize: 11, fontWeight: 600 }}>Active</span>
            <span style={{ color: "var(--muted-foreground)", fontSize: 10 }}>this month</span>
          </div>
        </div>
      </div>

      {/* Card 2: Total Spent */}
      <div
        className="rounded-2xl p-5 flex flex-col gap-3"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div style={{ color: "var(--muted-foreground)", fontSize: 11, fontWeight: 500 }}>Total Outflow</div>
            <div style={{ color: "var(--muted-foreground)", fontSize: 10, marginTop: 1 }}>This Month's Spending</div>
          </div>
          <div
            className="rounded-xl flex items-center justify-center"
            style={{ width: 38, height: 38, background: "rgba(239,68,68,0.15)", fontSize: 18 }}
          >
            📉
          </div>
        </div>
        <div>
          <div style={{ color: "#ef4444", fontSize: 22, fontWeight: 700 }}>
            {loading ? "Loading..." : formatCurrency(totalExpenses)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span style={{ color: "var(--muted-foreground)", fontSize: 10 }}>Tracked from active expenses</span>
          </div>
        </div>
      </div>

      {/* Card 3: Net Worth (Dynamic) */}
      <div
        className="rounded-2xl p-5 flex flex-col gap-3"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div style={{ color: "var(--muted-foreground)", fontSize: 11, fontWeight: 500 }}>Simulated Accounts</div>
            <div style={{ color: "var(--muted-foreground)", fontSize: 10, marginTop: 1 }}>All accounts</div>
          </div>
          <div
            className="rounded-xl flex items-center justify-center"
            style={{ width: 38, height: 38, background: "rgba(99,102,241,0.15)", fontSize: 18 }}
          >
            💳
          </div>
        </div>
        <div>
          <div style={{ color: "var(--foreground)", fontSize: 22, fontWeight: 700 }}>
            {loading ? "Loading..." : formatCurrency(865320 - totalExpenses)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span style={{ color: "var(--muted-foreground)", fontSize: 10 }}>Includes assets and cash</span>
          </div>
        </div>
      </div>
    </div>
  );
}
