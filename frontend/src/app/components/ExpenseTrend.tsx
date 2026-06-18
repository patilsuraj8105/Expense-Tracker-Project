import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { apiFetch } from "../imports/api";

interface MonthlyTrendItem {
  month: string; // "YYYY-MM"
  total_amount: number;
}

const GRAD_ID = "expenseGradDashboard";
const tooltipStyle = { background: "#1a2035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e8eaf0", fontSize: 11 };

export function ExpenseTrend() {
  const [trendData, setTrendData] = useState<{ month: string; amount: number }[]>([]);
  const [totalSpentThisMonth, setTotalSpentThisMonth] = useState(0);
  const [comparisonText, setComparisonText] = useState("");
  const [isUp, setIsUp] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const response = await apiFetch("/analytics/monthly");
        if (response.ok) {
          const rawData: MonthlyTrendItem[] = await response.json();
          
          // Map backend "YYYY-MM" to "Month Name"
          const mapped = rawData.map((item) => {
            const date = new Date(`${item.month}-02`); // add day offset to avoid timezone shift
            const monthLabel = date.toLocaleString("default", { month: "short" });
            return {
              month: monthLabel,
              amount: item.total_amount
            };
          });

          // Sort months chronologically if needed or use backend order
          setTrendData(mapped);

          // Calculate delta comparison relative to previous month
          if (rawData.length > 0) {
            const currentMonthItem = rawData[rawData.length - 1];
            setTotalSpentThisMonth(currentMonthItem.total_amount);

            if (rawData.length > 1) {
              const prevMonthItem = rawData[rawData.length - 2];
              const diff = currentMonthItem.total_amount - prevMonthItem.total_amount;
              const pct = prevMonthItem.total_amount > 0 ? (diff / prevMonthItem.total_amount) * 100 : 0;
              
              const prevMonthName = new Date(`${prevMonthItem.month}-02`).toLocaleString("default", { month: "short" });
              setIsUp(diff > 0);
              setComparisonText(`${diff > 0 ? "+" : ""}${pct.toFixed(1)}% vs ${prevMonthName}`);
            } else {
              setComparisonText("First month tracked");
            }
          }
        }
      } catch (err) {
        console.error("Error fetching monthly trends:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrend();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="rounded-2xl p-5 flex items-center justify-center flex-1 h-full min-h-[260px]" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
        <span style={{ color: "#8b9ab4", fontSize: 12 }}>Loading trends...</span>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 flex-1 h-full"
      style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center justify-between">
        <span style={{ color: "#e8eaf0", fontSize: 13, fontWeight: 600 }}>Expense Trend</span>
        <span style={{ color: "#8b9ab4", fontSize: 10 }}>Auto-Synced</span>
      </div>

      <div className="flex items-end gap-3">
        <span style={{ color: "#e8eaf0", fontSize: 24, fontWeight: 700 }}>
          {formatCurrency(totalSpentThisMonth)}
        </span>
        {comparisonText && (
          <span
            className="flex items-center gap-1 mb-1"
            style={{ color: isUp ? "#ef4444" : "#00d4b4", fontSize: 11, fontWeight: 600 }}
          >
            {isUp ? <TrendingUp size={13} color="#ef4444" /> : <TrendingDown size={13} color="#00d4b4" />}
            {comparisonText}
          </span>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 130 }}>
        {trendData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center py-8">
            <span style={{ color: "#8b9ab4", fontSize: 11 }}>No monthly trends data.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={GRAD_ID} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4b4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#00d4b4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#8b9ab4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8b9ab4", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Amount"]}
              />
              <Area type="monotone" dataKey="amount" stroke="#00d4b4" strokeWidth={2} fill={`url(#${GRAD_ID})`} dot={false} activeDot={{ r: 4, fill: "#00d4b4" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
