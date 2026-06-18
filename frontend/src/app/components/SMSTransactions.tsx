import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { apiFetch } from "../imports/api";

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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "food":
        return "🍕";
      case "travel":
        return "🚗";
      case "utilities":
        return "⚡";
      case "shopping":
        return "🛍️";
      case "medical":
      case "health":
        return "💊";
      case "entertainment":
        return "🎬";
      default:
        return "💳";
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
      style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span style={{ color: "#e8eaf0", fontSize: 13, fontWeight: 600 }}>Auto-Tracked SMS Transactions</span>
        <span
          className="flex items-center gap-1 rounded-full px-2 py-0.5"
          style={{ background: "rgba(0,212,180,0.12)", color: "#00d4b4", fontSize: 9, fontWeight: 600 }}
        >
          <RefreshCw size={8} className={loading ? "animate-spin" : ""} />
          {loading ? "Syncing" : "Synced"}
        </span>
      </div>

      {/* Table header */}
      <div
        className="grid gap-2 px-2"
        style={{ gridTemplateColumns: "32px 1fr 80px 110px 80px", color: "#8b9ab4", fontSize: 10, fontWeight: 600 }}
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
          <span style={{ color: "#8b9ab4", fontSize: 12, textAlign: "center", padding: "10px 0" }}>
            Loading SMS logs...
          </span>
        ) : transactions.length === 0 ? (
          <span style={{ color: "#8b9ab4", fontSize: 11, textAlign: "center", padding: "20px 0" }}>
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
                  background: "#0d1321",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div className="rounded-lg flex items-center justify-center" style={{ width: 28, height: 28, background: "#1a2035", fontSize: 15 }}>
                  {getCategoryIcon(tx.category)}
                </div>
                <span style={{ color: "#e8eaf0", fontSize: 12, fontWeight: 500 }} className="truncate">
                  {cleanTitle}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-center"
                  style={{ background: colors.bg, color: colors.color, fontSize: 9, fontWeight: 600 }}
                >
                  {tx.category}
                </span>
                <span style={{ color: "#8b9ab4", fontSize: 10 }}>{formatDate(tx.expense_date)}</span>
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
        <span style={{ color: "#8b9ab4", fontSize: 11, fontWeight: 600 }}>Total Auto-Tracked</span>
        <span style={{ color: "#00d4b4", fontSize: 14, fontWeight: 700 }}>{formatCurrency(totalSum)}</span>
      </div>
    </div>
  );
}
