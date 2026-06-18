import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

const bills = [
  { id: 1, icon: "⚡", name: "BESCOM Electricity", amount: 1800, due: "Jun 20, 2025", status: "due", recurring: "Monthly" },
  { id: 2, icon: "📱", name: "Jio Fiber Broadband", amount: 999, due: "Jun 22, 2025", status: "due", recurring: "Monthly" },
  { id: 3, icon: "🏠", name: "House Rent", amount: 18000, due: "Jun 1, 2025", status: "paid", recurring: "Monthly" },
  { id: 4, icon: "🎬", name: "Netflix Subscription", amount: 649, due: "Jun 25, 2025", status: "upcoming", recurring: "Monthly" },
  { id: 5, icon: "💧", name: "BWSSB Water", amount: 350, due: "Jun 18, 2025", status: "overdue", recurring: "Monthly" },
  { id: 6, icon: "📱", name: "Jio Mobile Recharge", amount: 209, due: "Jun 13, 2025", status: "paid", recurring: "Monthly" },
  { id: 7, icon: "🎵", name: "Spotify Premium", amount: 119, due: "Jun 28, 2025", status: "upcoming", recurring: "Monthly" },
  { id: 8, icon: "☁️", name: "iCloud Storage", amount: 75, due: "Jun 15, 2025", status: "paid", recurring: "Monthly" },
  { id: 9, icon: "🏋️", name: "Gym Membership", amount: 1500, due: "Jul 1, 2025", status: "upcoming", recurring: "Monthly" },
];

const statusConfig = {
  paid: { label: "Paid", color: "#4ade80", bg: "rgba(74,222,128,0.12)", icon: CheckCircle2 },
  due: { label: "Due Soon", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: Clock },
  upcoming: { label: "Upcoming", color: "#818cf8", bg: "rgba(129,140,248,0.12)", icon: Clock },
  overdue: { label: "Overdue", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: AlertCircle },
};

export function BillsPage() {
  const totalDue = bills.filter((b) => b.status === "due" || b.status === "overdue").reduce((s, b) => s + b.amount, 0);
  const totalPaid = bills.filter((b) => b.status === "paid").reduce((s, b) => s + b.amount, 0);
  const totalUpcoming = bills.filter((b) => b.status === "upcoming").reduce((s, b) => s + b.amount, 0);

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Summary */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        {[
          { label: "Due Now", value: `₹${totalDue.toLocaleString("en-IN")}`, color: "#f59e0b", count: bills.filter((b) => b.status === "due" || b.status === "overdue").length },
          { label: "Paid This Month", value: `₹${totalPaid.toLocaleString("en-IN")}`, color: "#4ade80", count: bills.filter((b) => b.status === "paid").length },
          { label: "Upcoming", value: `₹${totalUpcoming.toLocaleString("en-IN")}`, color: "#818cf8", count: bills.filter((b) => b.status === "upcoming").length },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: "#8b9ab4", fontSize: 11 }}>{s.label}</span>
              <span className="rounded-full px-2 py-0.5" style={{ background: "rgba(255,255,255,0.07)", color: "#8b9ab4", fontSize: 10 }}>{s.count} bills</span>
            </div>
            <div style={{ color: s.color, fontSize: 22, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Bills list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="grid px-5 py-3" style={{ gridTemplateColumns: "36px 1fr 90px 130px 100px 100px", color: "#8b9ab4", fontSize: 11, fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div></div>
          <div>Bill Name</div>
          <div>Recurring</div>
          <div>Due Date</div>
          <div>Status</div>
          <div className="text-right">Amount</div>
        </div>
        {bills.map((bill) => {
          const s = statusConfig[bill.status as keyof typeof statusConfig];
          const StatusIcon = s.icon;
          return (
            <div key={bill.id} className="grid items-center px-5 py-3.5" style={{ gridTemplateColumns: "36px 1fr 90px 130px 100px 100px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="rounded-lg flex items-center justify-center" style={{ width: 30, height: 30, background: "#1a2035", fontSize: 15 }}>{bill.icon}</div>
              <span style={{ color: "#e8eaf0", fontSize: 13, fontWeight: 500 }}>{bill.name}</span>
              <span style={{ color: "#8b9ab4", fontSize: 11 }}>{bill.recurring}</span>
              <span style={{ color: "#8b9ab4", fontSize: 11 }}>{bill.due}</span>
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: s.bg, color: s.color, fontSize: 9, fontWeight: 600, width: "fit-content" }}>
                <StatusIcon size={9} /> {s.label}
              </span>
              <span className="text-right" style={{ color: bill.status === "paid" ? "#4ade80" : "#e8eaf0", fontSize: 13, fontWeight: 600 }}>
                ₹{bill.amount.toLocaleString("en-IN")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
