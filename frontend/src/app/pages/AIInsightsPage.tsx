import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, ShieldCheck, Wallet, RefreshCw, CheckCircle, HelpCircle } from "lucide-react";
import { apiFetch } from "../imports/api";

const CATEGORIES = ["Food", "Travel", "Bills", "Shopping", "Health", "Entertainment", "Others"];

const featureNames = ["Category", "Month", "Budget Limit", "Expense Amount"];

export function AIInsightsPage() {
  const [predictionData, setPredictionData] = useState<any>(null);
  const [loadingPred, setLoadingPred] = useState(true);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loadingAnom, setLoadingAnom] = useState(true);

  // Dynamic duplicate charges & subscription states
  const [duplicateCharges, setDuplicateCharges] = useState<any[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [totalSubCost, setTotalSubCost] = useState(0);

  // Training state
  const [trainingResult, setTrainingResult] = useState<any>(null);
  const [training, setTraining] = useState(false);
  const [trainError, setTrainError] = useState("");

  // Simulator state
  const [simCategory, setSimCategory] = useState("Food");
  const [simAmount, setSimAmount] = useState("");
  const [simMonth, setSimMonth] = useState(new Date().getMonth() + 1);
  const [simResult, setSimResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);
  const [simError, setSimError] = useState("");

  const fetchPrediction = async () => {
    try {
      setLoadingPred(true);
      const res = await apiFetch("/budget/predict");
      if (res.ok) {
        const data = await res.json();
        setPredictionData(data);
      }
    } catch (err) {
      console.error("Error fetching budget predictions:", err);
    } finally {
      setLoadingPred(false);
    }
  };

  const fetchAnomalies = async () => {
    try {
      setLoadingAnom(true);
      const res = await apiFetch("/expenses");
      if (res.ok) {
        const data = await res.json();
        
        // 1. Anomalies
        const flagged = data.filter((item: any) => item.is_anomaly === true);
        setAnomalies(flagged);

        // 2. Duplicate detection
        const seen = new Set<string>();
        const duplicates: any[] = [];
        data.forEach((exp: any) => {
          const key = `${exp.title.toLowerCase().trim()}_${exp.amount}_${exp.expense_date}_${exp.category.toLowerCase()}`;
          if (seen.has(key)) {
            duplicates.push(exp);
          } else {
            seen.add(key);
          }
        });
        setDuplicateCharges(duplicates);

        // 3. Subscription detection
        const subKeywords = ["netflix", "spotify", "broadband", "jio", "rent", "gym", "prime video", "icloud", "youtube", "hotstar"];
        const subs: any[] = [];
        let totalCost = 0;
        const seenSubs = new Set<string>();

        data.forEach((exp: any) => {
          const titleLower = exp.title.toLowerCase();
          const matchesKeyword = subKeywords.some(kw => titleLower.includes(kw));

          if (matchesKeyword) {
            // Group by category-specific title
            const key = `${exp.title.toLowerCase().trim()}_${exp.category.toLowerCase()}`;
            if (!seenSubs.has(key)) {
              seenSubs.add(key);
              subs.push(exp);
              totalCost += exp.amount;
            }
          }
        });
        setActiveSubscriptions(subs);
        setTotalSubCost(totalCost);
      }
    } catch (err) {
      console.error("Error fetching anomalies:", err);
    } finally {
      setLoadingAnom(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
    fetchAnomalies();
  }, []);

  const handleRetrain = async () => {
    try {
      setTraining(true);
      setTrainError("");
      setTrainingResult(null);
      const res = await apiFetch("/budget/train-overspend", {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setTrainingResult(data);
        fetchPrediction();
      } else {
        const errData = await res.json();
        setTrainError(errData.detail || "Failed to retrain model. Please ensure you have added expenses first.");
      }
    } catch (err) {
      setTrainError("Network error retraining model.");
    } finally {
      setTraining(false);
    }
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simAmount || isNaN(Number(simAmount))) return;
    try {
      setSimulating(true);
      setSimError("");
      setSimResult(null);
      const now = new Date();
      const res = await apiFetch("/budget/predict-overspend", {
        method: "POST",
        body: JSON.stringify({
          category: simCategory,
          amount: parseFloat(simAmount),
          month: Number(simMonth),
          year: now.getFullYear()
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSimResult(data);
      } else {
        const errData = await res.json();
        setSimError(errData.detail || "Prediction request failed.");
      }
    } catch (err) {
      setSimError("Network error during prediction.");
    } finally {
      setSimulating(false);
    }
  };

  const getMonthName = (m: number) => {
    const d = new Date();
    d.setMonth(m - 1);
    return d.toLocaleDateString("en-IN", { month: "long" });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header card */}
      <div
        className="rounded-2xl p-6 flex items-center gap-5"
        style={{ background: "linear-gradient(135deg,rgba(0,212,180,0.12),rgba(8,145,178,0.08))", border: "1px solid rgba(0,212,180,0.2)" }}
      >
        <div className="rounded-2xl flex items-center justify-center flex-shrink-0" style={{ width: 56, height: 56, background: "linear-gradient(135deg,#00d4b4,#0891b2)" }}>
          <Wallet size={28} color="#fff" />
        </div>
        <div>
          <div style={{ color: "var(--foreground)", fontSize: 18, fontWeight: 700 }}>Expense Tracker AI Engine</div>
          <div style={{ color: "var(--muted-foreground)", fontSize: 12, marginTop: 3 }}>
            Analyzing database history · Model status: Active · Loaded from custom classifier model
          </div>
        </div>
        <div className="ml-auto flex gap-3">
          <div className="text-center rounded-xl px-4 py-2" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div style={{ color: "#ef4444", fontSize: 20, fontWeight: 700 }}>{anomalies.length}</div>
            <div style={{ color: "var(--muted-foreground)", fontSize: 10 }}>Anomalies</div>
          </div>
          <button
            onClick={handleRetrain}
            disabled={training}
            className="flex items-center gap-2 rounded-xl px-4 py-2 cursor-pointer"
            style={{
              background: "linear-gradient(135deg,#00d4b4,#0891b2)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              opacity: training ? 0.7 : 1
            }}
            aria-label="Retrain classifier model"
          >
            <RefreshCw size={14} className={training ? "animate-spin" : ""} />
            {training ? "Retraining Model..." : "Retrain AI Classifier"}
          </button>
        </div>
      </div>

      {/* Model Retraining Result Details */}
      {trainingResult && (
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid rgba(0,212,180,0.3)" }}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} color="#00d4b4" />
            <span style={{ color: "var(--foreground)", fontSize: 13, fontWeight: 600 }}>AI Classifier Retrained Successfully</span>
          </div>
          <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div style={{ color: "var(--muted-foreground)", fontSize: 11 }}>
              Budgets Scanned: <strong style={{ color: "var(--foreground)" }}>{trainingResult.user_budgets}</strong>
            </div>
            <div style={{ color: "var(--muted-foreground)", fontSize: 11 }}>
              Expenses Scanned: <strong style={{ color: "var(--foreground)" }}>{trainingResult.user_expenses}</strong>
            </div>
            <div style={{ color: "var(--muted-foreground)", fontSize: 11 }}>
              Samples Trained: <strong style={{ color: "var(--foreground)" }}>{trainingResult.samples_trained}</strong>
            </div>
          </div>
          {trainingResult.feature_importances && (
            <div>
              <div style={{ color: "var(--muted-foreground)", fontSize: 11, marginBottom: 8 }}>Feature Weights (Classifier Decision Path)</div>
              <div className="flex flex-col gap-2">
                {trainingResult.feature_importances.map((weight: number, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span style={{ color: "var(--muted-foreground)", fontSize: 10, width: 90 }} className="truncate">
                      {featureNames[idx] || `Feature ${idx}`}
                    </span>
                    <div className="flex-1 rounded-full" style={{ height: 6, background: "rgba(255,255,255,0.05)" }}>
                      <div className="rounded-full" style={{ height: 6, width: `${weight * 100}%`, background: "#00d4b4" }} />
                    </div>
                    <span style={{ color: "#00d4b4", fontSize: 10, fontWeight: 600, width: 40, textAlign: "right" }}>
                      {(weight * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {trainError && (
        <div className="rounded-2xl p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: 12 }}>
          {trainError}
        </div>
      )}

      {/* Predictions Overview */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        {[
          {
            label: `Recommended Budget (${predictionData ? getMonthName(predictionData.target_month) : "..."})`,
            value: predictionData ? formatCurrency(predictionData.predicted_budget) : "₹0",
            delta: predictionData ? `Based on ${predictionData.normal_expenses_count} transactions` : "Analyzing history",
            up: false
          },
          {
            label: "Average Monthly Spend",
            value: predictionData ? formatCurrency(predictionData.average_monthly_spending) : "₹0",
            delta: predictionData ? `Excluded ${predictionData.anomalies_excluded_count} anomalies` : "Baseline calculations",
            up: false
          },
          {
            label: "Last Recorded Month Spend",
            value: predictionData ? formatCurrency(predictionData.last_month_spending) : "₹0",
            delta: "Prior month total",
            up: true
          }
        ].map((p, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--muted-foreground)", fontSize: 11, marginBottom: 6 }}>{p.label}</div>
            <div style={{ color: "var(--foreground)", fontSize: 20, fontWeight: 700 }}>{p.value}</div>
            <div className="flex items-center gap-1 mt-1">
              {p.up ? <TrendingUp size={11} color="#ef4444" /> : <TrendingDown size={11} color="#00d4b4" />}
              <span style={{ color: "var(--muted-foreground)", fontSize: 10 }}>{p.delta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        {/* Simulator Form */}
        <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div>
            <span style={{ color: "var(--foreground)", fontSize: 14, fontWeight: 600 }}>Overspend Likelihood Simulator</span>
            <p style={{ color: "var(--muted-foreground)", fontSize: 11, marginTop: 3 }}>
              Enter hypothetical transaction amounts to see if the Random Forest classifier predicts a budget overflow.
            </p>
          </div>

          <form onSubmit={handleSimulate} className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label style={{ color: "var(--muted-foreground)", fontSize: 10, display: "block", marginBottom: 4 }}>Category</label>
                <select
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value)}
                  style={{ width: "100%", height: 36, background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", padding: "0 8px", fontSize: 12 }}
                  aria-label="Simulation Category"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label style={{ color: "var(--muted-foreground)", fontSize: 10, display: "block", marginBottom: 4 }}>Target Month</label>
                <select
                  value={simMonth}
                  onChange={(e) => setSimMonth(Number(e.target.value))}
                  style={{ width: "100%", height: 36, background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", padding: "0 8px", fontSize: 12 }}
                  aria-label="Simulation Month"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{getMonthName(m)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ color: "var(--muted-foreground)", fontSize: 10, display: "block", marginBottom: 4 }}>Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={simAmount}
                onChange={(e) => setSimAmount(e.target.value)}
                style={{ width: "100%", height: 36, background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", padding: "0 12px", fontSize: 12 }}
                required
                aria-label="Simulation Amount"
              />
            </div>

            <button
              type="submit"
              disabled={simulating}
              className="py-2 rounded-lg text-center cursor-pointer"
              style={{
                background: "linear-gradient(135deg,#00d4b4,#0891b2)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                marginTop: 4
              }}
              aria-label="Run overspend simulation"
            >
              {simulating ? "Predicting..." : "Run Simulator"}
            </button>
          </form>

          {simResult && (
            <div
              className="rounded-xl p-4 flex flex-col gap-2"
              style={{
                background: simResult.will_overspend ? "rgba(239,68,68,0.08)" : "rgba(0,212,180,0.08)",
                border: simResult.will_overspend ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(0,212,180,0.2)"
              }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--foreground)", fontSize: 12, fontWeight: 600 }}>Classification Result</span>
                <span
                  className="rounded-full px-2 py-0.5"
                  style={{
                    background: simResult.will_overspend ? "rgba(239,68,68,0.15)" : "rgba(0,212,180,0.15)",
                    color: simResult.will_overspend ? "#ef4444" : "#00d4b4",
                    fontSize: 10,
                    fontWeight: 700
                  }}
                >
                  {simResult.will_overspend ? "Likely Overspend" : "Within Budget"}
                </span>
              </div>
              <div style={{ color: "var(--muted-foreground)", fontSize: 11 }}>
                Model confidence: <strong style={{ color: "var(--foreground)" }}>{(simResult.confidence * 100).toFixed(1)}%</strong>
              </div>
              <div style={{ color: "var(--muted-foreground)", fontSize: 11 }}>
                Monthly Budget: <strong style={{ color: "var(--foreground)" }}>{formatCurrency(simResult.current_budget)}</strong>
              </div>
              <div style={{ color: "var(--muted-foreground)", fontSize: 11 }}>
                Spent before hypothetical: <strong style={{ color: "var(--foreground)" }}>{formatCurrency(simResult.current_spent)}</strong>
              </div>
            </div>
          )}

          {simError && (
            <div className="rounded-xl p-3 text-red-500" style={{ background: "rgba(239,68,68,0.08)", fontSize: 11 }}>
              {simError}
            </div>
          )}
        </div>

        {/* Dynamic Insights feed */}
        <div className="flex flex-col gap-3">
          <span style={{ color: "var(--foreground)", fontSize: 14, fontWeight: 600 }}>Live AI Insights Feed</span>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px]">
            {loadingAnom ? (
              <span style={{ color: "var(--muted-foreground)", fontSize: 12, textAlign: "center", padding: "20px 0" }}>Scanning transactions...</span>
            ) : anomalies.length === 0 ? (
              <div className="rounded-2xl p-5 flex flex-col items-center gap-3 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "40px 20px" }}>
                <div className="rounded-full flex items-center justify-center" style={{ width: 44, height: 44, background: "rgba(74,222,128,0.1)" }}>
                  <ShieldCheck size={24} color="#4ade80" />
                </div>
                <div>
                  <span style={{ color: "var(--foreground)", fontSize: 13, fontWeight: 600, display: "block" }}>No Anomalies Found</span>
                  <p style={{ color: "var(--muted-foreground)", fontSize: 11, marginTop: 4, lineHeight: 1.4 }}>
                    Your spending patterns appear clean. No unusual purchases or outliers were detected by the system.
                  </p>
                </div>
              </div>
            ) : (
              anomalies.map((anom) => (
                <div key={anom.id} className="rounded-2xl p-5 flex items-start gap-4" style={{ background: "var(--card)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ width: 42, height: 42, background: "rgba(239,68,68,0.1)" }}>
                    <AlertTriangle size={20} color="#ef4444" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span style={{ color: "var(--foreground)", fontSize: 13, fontWeight: 600 }}>
                        Unusual {anom.category} Spending
                      </span>
                      <span style={{ color: "var(--muted-foreground)", fontSize: 10, flexShrink: 0 }}>
                        {new Date(anom.expense_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p style={{ color: "var(--muted-foreground)", fontSize: 12, lineHeight: 1.6 }}>
                      Transaction <strong style={{ color: "var(--foreground)" }}>"{anom.title}"</strong> for <strong style={{ color: "#ef4444" }}>-{formatCurrency(anom.amount)}</strong> was flagged as an outlier. {anom.description || ""}
                    </p>
                  </div>
                </div>
              ))
            )}

            {/* Dynamic Subscription Alert */}
            <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ width: 42, height: 42, background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                <Lightbulb size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span style={{ color: "var(--foreground)", fontSize: 13, fontWeight: 600 }}>AI Subscription Alert</span>
                  <span style={{ color: "var(--muted-foreground)", fontSize: 10 }}>Tip</span>
                </div>
                <p style={{ color: "var(--muted-foreground)", fontSize: 12, lineHeight: 1.6 }}>
                  {activeSubscriptions.length > 0 ? (
                    `Identified ${activeSubscriptions.length} recurring subscription services (e.g. ${activeSubscriptions.map(s => s.title).join(", ")}) totalling ${formatCurrency(totalSubCost)}/month. Consider reviewing unused services.`
                  ) : (
                    "No active monthly subscriptions identified in recent transactions. Maintain lean overhead!"
                  )}
                </p>
              </div>
            </div>

            {/* Dynamic Duplicate Charge Alert */}
            <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: "var(--card)", border: duplicateCharges.length > 0 ? "1px solid rgba(239,68,68,0.2)" : "1px solid var(--border)" }}>
              <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ width: 42, height: 42, background: duplicateCharges.length > 0 ? "rgba(239,68,68,0.1)" : "rgba(0,212,180,0.1)", color: duplicateCharges.length > 0 ? "#ef4444" : "#00d4b4" }}>
                <ShieldCheck size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span style={{ color: "var(--foreground)", fontSize: 13, fontWeight: 600 }}>Duplicate Charge Protection</span>
                  <span style={{ color: duplicateCharges.length > 0 ? "#ef4444" : "#00d4b4", fontSize: 10, fontWeight: 700 }}>
                    {duplicateCharges.length > 0 ? "Alert" : "Active"}
                  </span>
                </div>
                <p style={{ color: "var(--muted-foreground)", fontSize: 12, lineHeight: 1.6 }}>
                  {duplicateCharges.length > 0 ? (
                    `Duplicate transaction alert! Found identical charges for: ${duplicateCharges.map(d => `"${d.title}" of ${formatCurrency(d.amount)}`).join(", ")} on the same day. Please review.`
                  ) : (
                    "Duplicate transaction detection model completed checking recent charges. No matching values or double charges found."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
