import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, ArrowLeftRight, PieChart, BarChart2,
  Sparkles, Target, CreditCard, FileText, PiggyBank,
  Bell, Search, Moon, Wallet
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: ArrowLeftRight, label: "Transactions", to: "/transactions" },
  { icon: PieChart, label: "Budget", to: "/budget" },
  { icon: BarChart2, label: "Analytics", to: "/analytics" },
  { icon: Sparkles, label: "AI Insights", to: "/ai-insights" },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      const storedName = localStorage.getItem("user_name");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, [navigate]);

  const pageTitles: Record<string, { title: string; sub: string }> = {
    "/": { title: "Dashboard", sub: `Welcome back, ${userName}! 👋` },
    "/transactions": { title: "Transactions", sub: "All your financial activity" },
    "/budget": { title: "Budget", sub: "Track your monthly spending limits" },
    "/analytics": { title: "Analytics", sub: "Deep dive into your finances" },
    "/ai-insights": { title: "AI Insights", sub: "Powered by Expense Tracker AI" },
  };

  const page = pageTitles[location.pathname] ?? { title: "Dashboard", sub: "" };

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: "#0b0f1e", fontFamily: "'Inter','Segoe UI',sans-serif" }}
    >
      {/* Sidebar */}
      <aside
        className="flex flex-col h-full flex-shrink-0"
        style={{ width: 220, background: "#080c18", borderRight: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div
            className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ width: 36, height: 36, background: "linear-gradient(135deg,#00d4b4,#0891b2)" }}
          >
            <Wallet size={18} color="#fff" />
          </div>
          <div>
            <div style={{ color: "#e8eaf0", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Expense Tracker</div>
            <div style={{ color: "#8b9ab4", fontSize: 10, lineHeight: 1.3 }}>Personal Finance Platform</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 12,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#00d4b4" : "#8b9ab4",
                background: isActive
                  ? "linear-gradient(135deg,rgba(0,212,180,0.18),rgba(8,145,178,0.12))"
                  : "transparent",
                border: isActive ? "1px solid rgba(0,212,180,0.18)" : "1px solid transparent",
                transition: "all 0.15s",
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}

        </nav>

        {/* User */}
        <div
          className="flex items-center gap-3 px-4 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{ width: 32, height: 32, background: "linear-gradient(135deg,#00d4b4,#0891b2)", color: "#fff", fontSize: 13, fontWeight: 700 }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ color: "#e8eaf0", fontSize: 12, fontWeight: 600 }} className="truncate">{userName}</div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user_name");
                localStorage.removeItem("user_email");
                navigate("/login");
              }}
              className="cursor-pointer"
              style={{ color: "#ef4444", fontSize: 10, background: "none", border: "none", padding: 0, marginTop: 2, display: "block" }}
            >
              Sign Out
            </button>
          </div>
          <Moon size={14} color="#8b9ab4" className="flex-shrink-0" />
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <h1 style={{ color: "#e8eaf0", fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{page.title}</h1>
            <p style={{ color: "#8b9ab4", fontSize: 12, marginTop: 2 }}>{page.sub}</p>
          </div>

          {/* Removed top search bar */}

          <div className="flex items-center gap-3">
            <button
              className="relative rounded-xl flex items-center justify-center"
              style={{ width: 38, height: 38, background: "#1a2035", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Bell size={16} color="#8b9ab4" />
              <span className="absolute rounded-full" style={{ width: 7, height: 7, background: "#ef4444", top: 8, right: 9 }} />
            </button>
            <div
              className="rounded-xl px-3 py-1.5"
              style={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.07)", color: "#8b9ab4", fontSize: 11 }}
            >
              📅 June 2025
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
