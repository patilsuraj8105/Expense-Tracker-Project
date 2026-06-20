import { useEffect, useState } from "react";
import { RefreshCw, MessageSquarePlus } from "lucide-react";
import { apiFetch } from "../imports/api";
import { CategoryIcon } from "../imports/category_icons";

interface SMSTxItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
}

export function SMSTransactions() {
  const [transactions, setTransactions] = useState<SMSTxItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Test SMS Modal state
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [smsSender, setSmsSender] = useState("VK-HDFC");
  const [smsMessage, setSmsMessage] = useState("Spent INR 500 on Food at Starbucks via Card ending 1234. Avl Bal INR 1000.");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const fetchSMSTransactions = async () => {
      try {
        const response = await apiFetch("/expenses");
        if (response.ok) {
          const data = await response.json();
          // Filter for auto-tracked SMS expenses
          const smsItems = data.filter(
            (item: any) =>
              item.title.startsWith("Auto:") ||
              (item.description && item.description.includes("SMS"))
          );
          setTransactions(smsItems.slice(0, 5)); // show latest 5
        }
      } catch (err) {
        console.error("Error fetching SMS transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSMSTransactions();
  }, []);

  const handleTestSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsSender || !smsMessage) return;
    try {
      setTesting(true);
      const response = await apiFetch("/expenses/auto-track", {
        method: "POST",
        body: JSON.stringify({
          sender: smsSender,
          message: smsMessage,
        }),
      });
      if (response.ok) {
        setIsTestOpen(false);
        // refresh list
        const res = await apiFetch("/expenses");
        if (res.ok) {
          const data = await res.json();
          const smsItems = data.filter(
            (item: any) =>
              item.title.startsWith("Auto:") ||
              (item.description && item.description.includes("SMS"))
          );
          setTransactions(smsItems.slice(0, 5));
        }
        alert("SMS parsed and tracked successfully!");
      } else {
        const errData = await response.json();
        alert(`Failed: ${errData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error testing SMS:", err);
      alert("An error occurred while simulating SMS");
    } finally {
      setTesting(false);
    }
  };

  const getCategoryColors = (category: string) => {
    switch (category.toLowerCase()) {
      case "food":
        return { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" };
      case "travel":
        return { bg: "rgba(99,102,241,0.12)", color: "#6366f1" };
      case "utilities":
      case "bills":
        return { bg: "rgba(8,145,178,0.12)", color: "#0891b2" };
      default:
        return { bg: "rgba(255,255,255,0.08)", color: "#8b9ab4" };
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const totalSum = transactions.reduce((s, tx) => s + tx.amount, 0);

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 flex-1 h-full"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span style={{ color: "var(--foreground)", fontSize: 13, fontWeight: 600 }}>Auto-Tracked SMS Transactions</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTestOpen(true)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.1)]"
            style={{ color: "#8b9ab4", fontSize: 10, fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)" }}
            title="Simulate incoming SMS"
          >
            <MessageSquarePlus size={12} />
            Test SMS
          </button>
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{ background: "rgba(0,212,180,0.12)", color: "#00d4b4", fontSize: 9, fontWeight: 600 }}
          >
            <RefreshCw size={8} className={loading ? "animate-spin" : ""} />
            {loading ? "Syncing" : "Synced"}
          </span>
        </div>
      </div>

      {/* Table header */}
      <div
        className="grid gap-2 px-2"
        style={{ gridTemplateColumns: "32px 1fr 80px 110px 80px", color: "var(--muted-foreground)", fontSize: 10, fontWeight: 600 }}
      >
        <div></div>
        <div>Merchant</div>
        <div>Category</div>
        <div>Date</div>
        <div className="text-right">Amount</div>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[180px]">
        {loading ? (
          <span style={{ color: "var(--muted-foreground)", fontSize: 12, textAlign: "center", padding: "10px 0" }}>
            Loading SMS logs...
          </span>
        ) : transactions.length === 0 ? (
          <span style={{ color: "var(--muted-foreground)", fontSize: 11, textAlign: "center", padding: "20px 0" }}>
            No SMS transactions tracked yet.
          </span>
        ) : (
          transactions.map((tx) => {
            const cleanTitle = tx.title.replace("Auto: ", "");
            const colors = getCategoryColors(tx.category);
            return (
              <div
                key={tx.id}
                className="grid items-center gap-2 px-2 py-2 rounded-xl"
                style={{
                  gridTemplateColumns: "32px 1fr 80px 110px 80px",
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="rounded-lg flex items-center justify-center" style={{ width: 28, height: 28, background: "var(--secondary)", fontSize: 15 }}>
                  <CategoryIcon category={tx.category} size={14} />
                </div>
                <span style={{ color: "var(--foreground)", fontSize: 12, fontWeight: 500 }} className="truncate">
                  {cleanTitle}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-center"
                  style={{ background: colors.bg, color: colors.color, fontSize: 9, fontWeight: 600 }}
                >
                  {tx.category}
                </span>
                <span style={{ color: "var(--muted-foreground)", fontSize: 10 }}>{formatDate(tx.expense_date)}</span>
                <span className="text-right" style={{ color: "#ef4444", fontSize: 12, fontWeight: 600 }}>
                  -{formatCurrency(tx.amount)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Total */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-xl mt-auto"
        style={{ background: "rgba(0,212,180,0.06)", border: "1px solid rgba(0,212,180,0.15)" }}
      >
        <span style={{ color: "var(--muted-foreground)", fontSize: 11, fontWeight: 600 }}>Total Auto-Tracked</span>
        <span style={{ color: "#00d4b4", fontSize: 14, fontWeight: 700 }}>{formatCurrency(totalSum)}</span>
      </div>

      {/* Test SMS Modal */}
      {isTestOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4 shadow-2xl" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: "#e8eaf0", fontSize: 16, fontWeight: 700 }}>Simulate SMS Alert</h3>
            <p style={{ color: "#8b9ab4", fontSize: 11 }}>Paste a raw bank SMS here to test the AI parsing directly.</p>
            <form onSubmit={handleTestSMS} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label style={{ color: "#8b9ab4", fontSize: 11, fontWeight: 600 }}>Sender ID</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. VK-HDFC"
                  value={smsSender}
                  onChange={(e) => setSmsSender(e.target.value)}
                  style={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.06)", color: "#e8eaf0", fontSize: 12, padding: "8px 12px", borderRadius: 8 }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ color: "#8b9ab4", fontSize: 11, fontWeight: 600 }}>SMS Message</label>
                <textarea
                  required
                  placeholder="e.g. You have spent INR 200 on Zomato..."
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  style={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.06)", color: "#e8eaf0", fontSize: 12, padding: "8px 12px", borderRadius: 8, height: 80, resize: "none" }}
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  disabled={testing}
                  onClick={() => setIsTestOpen(false)}
                  className="px-4 py-2 rounded-lg cursor-pointer"
                  style={{ color: "#8b9ab4", background: "none", border: "none", fontSize: 12 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={testing}
                  className="px-4 py-2 rounded-lg cursor-pointer disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#00d4b4,#0891b2)", color: "#fff", fontSize: 12, fontWeight: 600 }}
                >
                  {testing ? "Parsing..." : "Simulate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
