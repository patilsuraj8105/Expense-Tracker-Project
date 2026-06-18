import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { apiFetch } from "../imports/api";

interface AnomalyItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  description: string;
}

export function AnomalyAlerts() {
  const [alerts, setAlerts] = useState<AnomalyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const response = await apiFetch("/expenses");
        if (response.ok) {
          const data = await response.json();
          // Filter dynamically for anomalies in the dataset
          const anomalies = data.filter((item: any) => item.is_anomaly === true);
          setAlerts(anomalies);
        }
      } catch (err) {
        console.error("Error fetching anomalies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnomalies();
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 h-full"
      style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <span style={{ color: "#e8eaf0", fontSize: 13, fontWeight: 600 }}>AI Anomaly Alerts</span>
          <span
            className="rounded-full px-2 py-0.5"
            style={{ background: "rgba(0,212,180,0.12)", color: "#00d4b4", fontSize: 9, fontWeight: 600 }}
          >
            Powered by Expense Tracker AI
          </span>
        </div>
      </div>

      {/* Alert items */}
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[180px]">
        {loading ? (
          <span style={{ color: "#8b9ab4", fontSize: 12, textAlign: "center", padding: "10px 0" }}>
            Scanning database...
          </span>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: 32, height: 32, background: "rgba(0,212,180,0.1)" }}
            >
              <AlertTriangle size={16} color="#00d4b4" />
            </div>
            <span style={{ color: "#8b9ab4", fontSize: 11 }}>No budget anomalies detected.</span>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: "#0d1321", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div
                className="rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ width: 36, height: 36, background: "#1a2035", fontSize: 18 }}
              >
                {getCategoryIcon(alert.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span style={{ color: "#e8eaf0", fontSize: 12, fontWeight: 600 }} className="truncate">
                    {alert.title}
                  </span>
                  <span style={{ color: "#ef4444", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    -{formatCurrency(alert.amount)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span style={{ color: "#8b9ab4", fontSize: 10 }}>{formatDate(alert.expense_date)}</span>
                  <span
                    className="rounded-full px-2 py-0.5"
                    style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", fontSize: 9, fontWeight: 600 }}
                  >
                    Flagged Anomaly
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className="flex items-center justify-center gap-2 rounded-xl py-2.5 w-full mt-auto"
        style={{ background: "rgba(0,212,180,0.1)", color: "#00d4b4", fontSize: 12, fontWeight: 600, border: "1px solid rgba(0,212,180,0.2)" }}
      >
        View All Alerts <ExternalLink size={12} />
      </button>
    </div>
  );
}
