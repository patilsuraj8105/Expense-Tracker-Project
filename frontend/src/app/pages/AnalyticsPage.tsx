import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { apiFetch } from "../imports/api";

const CATEGORY_COLORS: Record<string, string> = {
  food: "#f59e0b",
  travel: "#818cf8",
  bills: "#22d3ee",
  utilities: "#22d3ee",
  shopping: "#f472b6",
  health: "#4ade80",
  medical: "#4ade80",
  entertainment: "#a78bfa",
  others: "#9ca3af",
};

const tooltipStyle = {
  background: "#1a2035",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#e8eaf0",
  fontSize: 11
};

export function AnalyticsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatMonth = (monthStr: string) => {
    try {
      const parts = monthStr.split("-");
      if (parts.length < 2) return monthStr;
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const date = new Date(parseInt(year, 10), monthIdx, 1);
      return date.toLocaleDateString("en-IN", { month: "short" }) + " " + year.substring(2);
    } catch (e) {
      return monthStr;
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [summaryRes, categoryRes, monthlyRes] = await Promise.all([
          apiFetch("/analytics/summary"),
          apiFetch("/analytics/category"),
          apiFetch("/analytics/monthly")
        ]);

        if (summaryRes.ok) {
          const s = await summaryRes.json();
          setSummary(s);
        }

        if (categoryRes.ok) {
          const c = await categoryRes.json();
          const mapped = c.map((item: any) => {
            const name = item.category.charAt(0).toUpperCase() + item.category.slice(1);
            const color = CATEGORY_COLORS[item.category.toLowerCase()] || "#9ca3af";
            return {
              name,
              value: item.total_amount,
              color
            };
          });
          setCategoryData(mapped);
        }

        if (monthlyRes.ok) {
          const m = await monthlyRes.json();
          const mapped = m.map((item: any) => {
            const expense = item.total_amount;
            const income = 85000; // Mock monthly income base
            const rate = Math.max(0, Math.round(((income - expense) / income) * 100));
            return {
              month: formatMonth(item.month),
              income,
              expense,
              rate
            };
          });
          setMonthlyData(mapped);
        }
      } catch (err) {
        console.error("Error loading analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div style={{ color: "#8b9ab4", fontSize: 14 }}>Loading financial analytics analytics...</div>
      </div>
    );
  }

  const highestSpendVal = monthlyData.length > 0 
    ? Math.max(...monthlyData.map(m => m.expense)) 
    : 0;
  const highestSpendMonth = monthlyData.find(m => m.expense === highestSpendVal)?.month || "None";

  const avgSavingsRate = monthlyData.length > 0
    ? Math.round(monthlyData.reduce((acc, curr) => acc + curr.rate, 0) / monthlyData.length)
    : 0;

  const stats = [
    { label: "Total Expense Volume", value: `₹${(summary?.total_expenses || 0).toLocaleString("en-IN")}`, change: `${summary?.total_transactions || 0} transactions` },
    { label: "Highest Spend Month", value: highestSpendMonth, change: `₹${highestSpendVal.toLocaleString("en-IN")}` },
    { label: "Avg Savings Rate", value: `${avgSavingsRate}%`, change: "Relative to baseline" },
    { label: "Top Category", value: summary?.top_category ? (summary.top_category.charAt(0).toUpperCase() + summary.top_category.slice(1)) : "None", change: "Highest total spent" },
  ];

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Stats row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ color: "#8b9ab4", fontSize: 10, marginBottom: 6 }}>{s.label}</div>
            <div style={{ color: "#e8eaf0", fontSize: 18, fontWeight: 700 }}>{s.value}</div>
            <div style={{ color: "#8b9ab4", fontSize: 10, marginTop: 3 }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Income vs Expense bar chart */}
      <div className="rounded-2xl p-5" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ color: "#e8eaf0", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Income vs Expenses (Database Logged)</div>
        {monthlyData.length === 0 ? (
          <div className="flex items-center justify-center min-h-[150px]" style={{ color: "#8b9ab4", fontSize: 12 }}>
            No transaction history to chart.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ left: -10, right: 4, top: 4, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#8b9ab4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8b9ab4", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]} />
              <Bar dataKey="income" fill="#00d4b4" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#818cf8" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex gap-5">
        {/* Pie chart */}
        <div className="rounded-2xl p-5 flex-1" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ color: "#e8eaf0", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Spending by Category</div>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center min-h-[150px]" style={{ color: "#8b9ab4", fontSize: 12 }}>
              No categories mapped.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend formatter={(value) => <span style={{ color: "#8b9ab4", fontSize: 11 }}>{value}</span>} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Savings rate */}
        <div className="rounded-2xl p-5 flex-1" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ color: "#e8eaf0", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Monthly Savings Rate (%)</div>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center min-h-[150px]" style={{ color: "#8b9ab4", fontSize: 12 }}>
              No monthly trend data.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#8b9ab4", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8b9ab4", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Savings Rate"]} />
                <Line type="monotone" dataKey="rate" stroke="#818cf8" strokeWidth={2} dot={{ r: 4, fill: "#818cf8" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
