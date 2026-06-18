import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

const growthData = [
  { month: "Jan", balance: 120000 },
  { month: "Feb", balance: 138000 },
  { month: "Mar", balance: 172000 },
  { month: "Apr", balance: 165000 },
  { month: "May", balance: 198000 },
  { month: "Jun", balance: 220000 },
];

const accounts = [
  { id: 1, icon: "🏦", name: "SBI Savings Account", type: "Savings", balance: 85000, rate: "3.5% p.a.", color: "#00d4b4" },
  { id: 2, icon: "📈", name: "HDFC FD — 1 Year", type: "Fixed Deposit", balance: 200000, rate: "7.25% p.a.", color: "#818cf8" },
  { id: 3, icon: "💹", name: "Zerodha Mutual Fund", type: "Mutual Fund", balance: 145320, rate: "12.4% CAGR", color: "#f59e0b" },
  { id: 4, icon: "🪙", name: "Digital Gold", type: "Gold", balance: 35000, rate: "+8.2% YTD", color: "#fbbf24" },
];

const tips = [
  "Move your idle savings to a liquid mutual fund for 6-7% returns vs 3.5% in savings.",
  "Consider a SIP of ₹5,000/month in an index fund for long-term wealth creation.",
  "Your FD matures in 4 months — reinvest at a higher rate or diversify.",
];

export function SavingsPage() {
  const totalSavings = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Top stats */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        {[
          { label: "Total Savings", value: `₹${totalSavings.toLocaleString("en-IN")}`, color: "#00d4b4" },
          { label: "This Month Added", value: "₹9,650", color: "#e8eaf0" },
          { label: "Avg. Interest Earned", value: "₹1,230/mo", color: "#818cf8" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ color: "#8b9ab4", fontSize: 11, marginBottom: 6 }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: 24, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Growth chart */}
      <div className="rounded-2xl p-5" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: "#e8eaf0", fontSize: 13, fontWeight: 600 }}>Savings Growth — 2025</span>
          <span className="flex items-center gap-1" style={{ color: "#00d4b4", fontSize: 11, fontWeight: 600 }}>
            <TrendingUp size={13} /> +83% since Jan
          </span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={growthData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#8b9ab4", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8b9ab4", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip contentStyle={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e8eaf0", fontSize: 11 }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Balance"]} />
            <Area type="monotone" dataKey="balance" stroke="#818cf8" strokeWidth={2} fill="url(#savingsGrad)" dot={false} activeDot={{ r: 4, fill: "#818cf8" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Accounts */}
      <div style={{ color: "#e8eaf0", fontSize: 14, fontWeight: 600 }}>Savings Accounts & Investments</div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {accounts.map((acc) => (
          <div key={acc.id} className="rounded-2xl p-5" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl flex items-center justify-center" style={{ width: 42, height: 42, background: "#1a2035", fontSize: 20 }}>{acc.icon}</div>
              <div>
                <div style={{ color: "#e8eaf0", fontSize: 13, fontWeight: 600 }}>{acc.name}</div>
                <div style={{ color: "#8b9ab4", fontSize: 10 }}>{acc.type}</div>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div style={{ color: "#8b9ab4", fontSize: 10, marginBottom: 2 }}>Balance</div>
                <div style={{ color: acc.color, fontSize: 20, fontWeight: 700 }}>₹{acc.balance.toLocaleString("en-IN")}</div>
              </div>
              <span className="rounded-full px-2 py-1" style={{ background: "rgba(255,255,255,0.06)", color: acc.color, fontSize: 10, fontWeight: 600 }}>{acc.rate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Tips */}
      <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,rgba(0,212,180,0.08),rgba(8,145,178,0.05))", border: "1px solid rgba(0,212,180,0.15)" }}>
        <div style={{ color: "#00d4b4", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>✨ AI Savings Tips</div>
        <div className="flex flex-col gap-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 rounded-full flex items-center justify-center" style={{ width: 20, height: 20, background: "rgba(0,212,180,0.2)", color: "#00d4b4", fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
              <span style={{ color: "#8b9ab4", fontSize: 12, lineHeight: 1.6 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
