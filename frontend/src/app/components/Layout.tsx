import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, ArrowLeftRight, PieChart, BarChart2,
  Sparkles, Target, CreditCard, FileText, PiggyBank,
  Bell, Moon, Wallet
} from "lucide-react";
import { apiFetch } from "../imports/api";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: ArrowLeftRight, label: "Transactions", to: "/transactions" },
  { icon: PieChart, label: "Budget", to: "/budget" },
  { icon: BarChart2, label: "Analytics", to: "/analytics" },
  { icon: Target, label: "Goals", to: "/goals" },
  { icon: CreditCard, label: "Cards", to: "/cards" },
  { icon: FileText, label: "Bills", to: "/bills" },
  { icon: PiggyBank, label: "Savings", to: "/savings" },
  { icon: Sparkles, label: "AI Insights", to: "/ai-insights" },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  
  // Notifications states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

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

  // Handle theme changes
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Load dynamic notifications/alerts based on database activity
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiFetch("/expenses");
        if (response.ok) {
          const data = await response.json();
          const list: any[] = [];
          
          // 1. Fetch anomalies
          const anomalies = data.filter((item: any) => item.is_anomaly === true);
          anomalies.slice(0, 3).forEach((a: any) => {
            list.push({
              id: `anom-${a.id}`,
              text: `⚠️ Anomaly: Unusual ₹${a.amount.toLocaleString("en-IN")} spent on ${a.title}`,
              time: new Date(a.expense_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
            });
          });

          // 2. Fetch SMS sync status
          const smsItems = data.filter((item: any) => item.title.startsWith("Auto:") || (item.description && item.description.includes("SMS")));
          if (smsItems.length > 0) {
            list.push({
              id: "sms-sync",
              text: `📱 Auto-Sync: Tracked ${smsItems.length} transactions from SMS alerts`,
              time: "June 2026",
            });
          }

          // 3. Default optimization info
          list.push({
            id: "ai-status",
            text: "✨ AI retraining status: Active & optimized",
            time: "System",
          });

          setNotifications(list);

          // If user hasn't cleared notifications, display the dot
          const isCleared = localStorage.getItem("notifications_read") === "true";
          setUnreadNotifications(isCleared ? 0 : list.length);
        }
      } catch (err) {
        console.error("Error loading notifications:", err);
      }
    };
    fetchNotifications();
  }, []);

  const pageTitles: Record<string, { title: string; sub: string }> = {
    "/": { title: "Dashboard", sub: `Welcome back, ${userName}! 👋` },
    "/transactions": { title: "Transactions", sub: "All your financial activity" },
    "/budget": { title: "Budget", sub: "Track your monthly spending limits" },
    "/analytics": { title: "Analytics", sub: "Deep dive into your finances" },
    "/goals": { title: "Goals", sub: "Track your financial milestones" },
    "/cards": { title: "Cards", sub: "Manage your credit and debit cards" },
    "/bills": { title: "Bills", sub: "Upcoming and paid recurring bills" },
    "/savings": { title: "Savings", sub: "Your savings accounts and investment growth" },
    "/ai-insights": { title: "AI Insights", sub: "Powered by Expense Tracker AI" },
  };

  const page = pageTitles[location.pathname] ?? { title: "Dashboard", sub: "" };
  const currentMonthYear = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }); // Dynamic month/year

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: "var(--background)", fontFamily: "'Inter','Segoe UI',sans-serif" }}
    >
      {/* Sidebar */}
      <aside
        className="flex flex-col h-full flex-shrink-0"
        style={{ width: 220, background: "var(--sidebar-bg)", borderRight: "1px solid var(--border)" }}
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
            <div style={{ color: "var(--foreground)", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Expense Tracker</div>
            <div style={{ color: "var(--muted-foreground)", fontSize: 10, lineHeight: 1.3 }}>Personal Finance Platform</div>
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
                color: isActive ? "#00d4b4" : "var(--muted-foreground)",
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

        {/* User & Settings Panel */}
        <div
          className="flex items-center gap-3 px-4 py-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{ width: 32, height: 32, background: "linear-gradient(135deg,#00d4b4,#0891b2)", color: "#fff", fontSize: 13, fontWeight: 700 }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ color: "var(--foreground)", fontSize: 12, fontWeight: 600 }} className="truncate">{userName}</div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user_name");
                localStorage.removeItem("user_email");
                localStorage.removeItem("notifications_read");
                navigate("/login");
              }}
              className="cursor-pointer"
              style={{ color: "#ef4444", fontSize: 10, background: "none", border: "none", padding: 0, marginTop: 2, display: "block" }}
              aria-label="Sign Out"
              title="Sign Out"
            >
              Sign Out
            </button>
          </div>
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className="flex items-center justify-center rounded-lg p-1.5 cursor-pointer hover:bg-slate-700/20"
            style={{ background: "none", border: "none" }}
            aria-label="Toggle Theme"
            title="Toggle Dark/Light Mode"
          >
            <Moon size={14} color="var(--muted-foreground)" className="flex-shrink-0" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h1 style={{ color: "var(--foreground)", fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{page.title}</h1>
            <p style={{ color: "var(--muted-foreground)", fontSize: 12, marginTop: 2 }}>{page.sub}</p>
          </div>

          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setUnreadNotifications(0);
                localStorage.setItem("notifications_read", "true");
              }}
              className="relative rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-700/20"
              style={{ width: 38, height: 38, background: "var(--secondary)", border: "1px solid var(--border)" }}
              aria-label="Toggle Notifications Alert"
              title="AI Notifications"
            >
              <Bell size={16} color="var(--muted-foreground)" />
              {unreadNotifications > 0 && (
                <span className="absolute rounded-full animate-pulse" style={{ width: 7, height: 7, background: "#ef4444", top: 8, right: 9 }} />
              )}
            </button>

            {/* Notifications Panel */}
            {showNotifications && (
              <div
                className="absolute right-12 mt-2 w-80 rounded-2xl p-4 shadow-2xl z-50 flex flex-col gap-3"
                style={{
                  top: "100%",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)"
                }}
              >
                <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: "var(--border)" }}>
                  <span style={{ color: "var(--foreground)", fontSize: 13, fontWeight: 700 }}>AI Financial Alerts</span>
                  <button
                    onClick={() => {
                      setNotifications([]);
                      setUnreadNotifications(0);
                    }}
                    style={{ color: "#00d4b4", fontSize: 10, background: "none", border: "none", cursor: "pointer" }}
                    aria-label="Clear All Alerts"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div style={{ color: "var(--muted-foreground)", fontSize: 11, textAlign: "center", padding: "12px 0" }}>
                      No new alerts
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl flex flex-col gap-1"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
                      >
                        <div style={{ color: "var(--foreground)", fontSize: 11, lineHeight: 1.4 }}>{n.text}</div>
                        <div style={{ color: "var(--muted-foreground)", fontSize: 9, alignSelf: "flex-end" }}>{n.time}</div>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="rounded-lg py-1.5 text-center cursor-pointer text-xs"
                  style={{
                    background: "rgba(0,212,180,0.1)",
                    color: "#00d4b4",
                    border: "1px solid rgba(0,212,180,0.2)"
                  }}
                  aria-label="Close Notifications Alert Panel"
                >
                  Close Panel
                </button>
              </div>
            )}

            <div
              className="rounded-xl px-3 py-1.5"
              style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: 11 }}
            >
              📅 {currentMonthYear}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto" style={{ background: "var(--background)" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
