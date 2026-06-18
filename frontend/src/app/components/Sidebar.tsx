import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BarChart2,
  Wallet,
  Target,
  CreditCard,
  FileText,
  PiggyBank,
  ChevronRight,
  Moon,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: ArrowLeftRight, label: "Transactions" },
  { icon: PieChart, label: "Budget" },
  { icon: BarChart2, label: "Analytics" },
  { icon: Sparkles, label: "AI Insights" },
  { icon: Target, label: "Goals" },
  { icon: CreditCard, label: "Cards" },
  { icon: FileText, label: "Bills" },
  { icon: PiggyBank, label: "Savings" },
];

export function Sidebar() {
  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: 220,
        minWidth: 220,
        background: "#080c18",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: 36, height: 36, background: "linear-gradient(135deg,#00d4b4,#0891b2)" }}
        >
          <Wallet size={18} color="#fff" />
        </div>
        <div>
          <div style={{ color: "#e8eaf0", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
            Expense Tracker
          </div>
          <div style={{ color: "#8b9ab4", fontSize: 10, lineHeight: 1.3 }}>
            Personal Finance Platform
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 flex-1 mt-2">
        {navItems.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all"
            style={{
              background: active ? "linear-gradient(135deg,rgba(0,212,180,0.2),rgba(8,145,178,0.15))" : "transparent",
              color: active ? "#00d4b4" : "#8b9ab4",
              border: active ? "1px solid rgba(0,212,180,0.2)" : "1px solid transparent",
              fontSize: 13,
              fontWeight: active ? 600 : 400,
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}

      </nav>

      {/* User */}
      <div
        className="flex items-center gap-3 px-4 py-4 mt-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="rounded-full flex items-center justify-center flex-shrink-0"
          style={{ width: 32, height: 32, background: "linear-gradient(135deg,#00d4b4,#0891b2)", color: "#fff", fontSize: 13, fontWeight: 700 }}
        >
          A
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ color: "#e8eaf0", fontSize: 12, fontWeight: 600 }}>Arjun Mehta</div>
        </div>
        <Moon size={14} color="#8b9ab4" />
      </div>
    </aside>
  );
}
