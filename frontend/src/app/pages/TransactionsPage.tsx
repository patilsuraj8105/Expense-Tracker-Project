import { useState, useEffect } from "react";
import { Search, Plus, Calendar, Download, Trash2 } from "lucide-react";
import { apiFetch, API_URL } from "../imports/api";
import { CategoryIcon } from "../imports/category_icons";

interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  expense_date: string;
  is_anomaly: boolean;
}

const categories = ["All", "Food", "Travel", "Bills", "Shopping", "Health", "Entertainment", "Others"];

const catColors: Record<string, { bg: string; color: string }> = {
  Food: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
  Travel: { bg: "rgba(99,102,241,0.15)", color: "#818cf8" },
  Bills: { bg: "rgba(8,145,178,0.15)", color: "#22d3ee" },
  Utilities: { bg: "rgba(8,145,178,0.15)", color: "#22d3ee" },
  Shopping: { bg: "rgba(236,72,153,0.15)", color: "#f472b6" },
  Health: { bg: "rgba(34,197,94,0.15)", color: "#4ade80" },
  Entertainment: { bg: "rgba(168,85,247,0.15)", color: "#c084fc" },
  Others: { bg: "rgba(255,255,255,0.08)", color: "#8b9ab4" },
};

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<ExpenseItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [dateVal, setDateVal] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");

  const fetchExpenses = async () => {
    // Skip fetch if date range is invalid
    if (startDate && endDate && startDate > endDate) return;

    try {
      setLoading(true);
      
      const params = [];
      if (activeCategory !== "All") params.push(`category=${activeCategory}`);
      if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
      
      const isValidYear = (d: string) => {
        const yr = parseInt(d.split("-")[0], 10);
        return yr >= 1000 && yr <= 9999;
      };

      if (startDate && isValidYear(startDate)) params.push(`start_date=${startDate}`);
      if (endDate && isValidYear(endDate)) params.push(`end_date=${endDate}`);
      
      const query = params.length > 0 ? `?${params.join("&")}` : "";
      const response = await apiFetch(`/expenses${query}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error("Error loading expenses:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [activeCategory, startDate, endDate, search]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || isNaN(Number(amount))) return;
    try {
      const response = await apiFetch("/expenses", {
        method: "POST",
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          category,
          expense_date: dateVal,
          description
        })
      });
      if (response.ok) {
        setIsAddOpen(false);
        setTitle("");
        setAmount("");
        setDescription("");
        fetchExpenses();
      }
    } catch (err) {
      console.error("Error creating expense:", err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const response = await apiFetch(`/expenses/${id}`, {
        method: "DELETE"
      });
      if (response.status === 204 || response.ok) {
        fetchExpenses();
      }
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = [];
      
      const isValidYear = (d: string) => {
        const yr = parseInt(d.split("-")[0], 10);
        return yr >= 1000 && yr <= 9999;
      };

      if (startDate && isValidYear(startDate)) params.push(`start_date=${startDate}`);
      if (endDate && isValidYear(endDate)) params.push(`end_date=${endDate}`);
      if (activeCategory !== "All") params.push(`category=${encodeURIComponent(activeCategory)}`);
      if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
      const query = params.length > 0 ? `?${params.join("&")}` : "";

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/export/excel${query}`, {
        method: "GET",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `expenses_export_${startDate || "all"}_to_${endDate || "all"}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        const errorText = await response.text().catch(() => "Unknown error");
        alert(`Failed to export Excel (${response.status}): ${errorText}`);
      }
    } catch (err) {
      console.error("Error downloading excel:", err);
      alert("An error occurred while exporting the file. Make sure the backend server is running.");
    } finally {
      setExporting(false);
    }
  };

  const filtered = transactions;

  const totalSpent = filtered.reduce((s, t) => s + t.amount, 0);

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

// Overview stats placeholder

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Overview */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="rounded-xl flex items-center justify-center" style={{ width: 44, height: 44, background: "rgba(239,68,68,0.15)", fontSize: 22 }}>📉</div>
          <div>
            <div style={{ color: "#8b9ab4", fontSize: 11 }}>Total Spent (Filtered)</div>
            <div style={{ color: "#ef4444", fontSize: 24, fontWeight: 700 }}>{formatCurrency(totalSpent)}</div>
          </div>
        </div>
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="rounded-xl flex items-center justify-center" style={{ width: 44, height: 44, background: "rgba(0,212,180,0.15)", fontSize: 22 }}>💼</div>
          <div>
            <div style={{ color: "#8b9ab4", fontSize: 11 }}>Total Transactions</div>
            <div style={{ color: "#00d4b4", fontSize: 24, fontWeight: 700 }}>{filtered.length} items</div>
          </div>
        </div>
      </div>

      {/* Controls and Transactions Table */}
      <div className="flex-1 w-full flex flex-col gap-4">
          
          {/* Control bar: Search + Date Pickers + Export */}
          <div className="flex gap-3 items-center justify-between flex-wrap p-4 rounded-xl" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Search */}
            <div className="flex items-center gap-2 px-3 rounded-lg flex-1 min-w-[200px]" style={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.06)", height: 36 }}>
              <Search size={14} color="#8b9ab4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title..."
                style={{ background: "transparent", border: "none", outline: "none", color: "#e8eaf0", fontSize: 12, width: "100%" }}
              />
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} color="#8b9ab4" />
                <span style={{ color: "#8b9ab4", fontSize: 11, fontWeight: 600 }}>From</span>
              </div>
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-filter-input"
                style={{
                  background: "#1a2035",
                  border: startDate && endDate && startDate > endDate ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.08)",
                  color: "#e8eaf0",
                  padding: "6px 10px",
                  borderRadius: 10,
                  fontSize: 11,
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  minWidth: 130,
                }}
                onFocus={(e) => { if (!(startDate && endDate && startDate > endDate)) e.currentTarget.style.borderColor = "rgba(0,212,180,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,212,180,0.1)"; }}
                onBlur={(e) => { if (!(startDate && endDate && startDate > endDate)) e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
              />
              <span style={{ color: "#4b5563", fontSize: 11, fontWeight: 500 }}>→</span>
              <div className="flex items-center gap-1.5">
                <span style={{ color: "#8b9ab4", fontSize: 11, fontWeight: 600 }}>To</span>
              </div>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-filter-input"
                style={{
                  background: "#1a2035",
                  border: startDate && endDate && startDate > endDate ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.08)",
                  color: "#e8eaf0",
                  padding: "6px 10px",
                  borderRadius: 10,
                  fontSize: 11,
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  minWidth: 130,
                }}
                onFocus={(e) => { if (!(startDate && endDate && startDate > endDate)) e.currentTarget.style.borderColor = "rgba(0,212,180,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,212,180,0.1)"; }}
                onBlur={(e) => { if (!(startDate && endDate && startDate > endDate)) e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
              />
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all"
                  style={{
                    color: "#8b9ab4",
                    fontSize: 10,
                    fontWeight: 500,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#8b9ab4"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  ✕ Clear
                </button>
              )}
              {startDate && endDate && startDate > endDate && (
                <span style={{ color: "#ef4444", fontSize: 10, fontWeight: 500, whiteSpace: "nowrap" }}>
                  ⚠ From date must be before To date
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                style={{ background: "rgba(0,212,180,0.12)", color: "#00d4b4", fontSize: 12, fontWeight: 600, border: "1px solid rgba(0,212,180,0.2)" }}
              >
                <Download size={13} /> {exporting ? "Exporting..." : "Export Excel"}
              </button>
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all active:scale-98"
                style={{ background: "linear-gradient(135deg,#00d4b4,#0891b2)", color: "#fff", fontSize: 12, fontWeight: 600 }}
              >
                <Plus size={13} /> Add Expense
              </button>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className="px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  background: activeCategory === c ? "rgba(0,212,180,0.15)" : "#111827",
                  color: activeCategory === c ? "#00d4b4" : "#8b9ab4",
                  border: `1px solid ${activeCategory === c ? "rgba(0,212,180,0.3)" : "rgba(255,255,255,0.07)"}`
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="grid px-5 py-3" style={{ gridTemplateColumns: "40px 1fr 100px 140px 100px 50px", color: "#8b9ab4", fontSize: 11, fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div></div>
              <div>Name</div>
              <div>Category</div>
              <div>Date</div>
              <div className="text-right">Amount</div>
              <div></div>
            </div>

            {loading ? (
              <div className="p-10 text-center" style={{ color: "#8b9ab4", fontSize: 12 }}>Loading transaction history...</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center" style={{ color: "#8b9ab4", fontSize: 12 }}>No expenses found matching the active filters.</div>
            ) : (
              filtered.map((tx) => {
                const cat = catColors[tx.category] ?? { bg: "rgba(255,255,255,0.08)", color: "#8b9ab4" };
                return (
                  <div key={tx.id} className="grid items-center px-5 py-3" style={{ gridTemplateColumns: "40px 1fr 100px 140px 100px 50px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="rounded-lg flex items-center justify-center" style={{ width: 32, height: 32, background: "var(--secondary)", fontSize: 16 }}>
                      <CategoryIcon category={tx.category} size={15} color={cat.color} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span style={{ color: "var(--foreground)", fontSize: 13, fontWeight: 500 }} className="truncate">{tx.title}</span>
                      {tx.is_anomaly && <span style={{ color: "#ef4444", fontSize: 9 }} className="font-semibold">⚠️ AI Flagged Anomaly</span>}
                    </div>
                    <span className="rounded-full px-2 py-0.5 text-center w-fit" style={{ background: cat.bg, color: cat.color, fontSize: 9, fontWeight: 600 }}>
                      {tx.category}
                    </span>
                    <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{formatDate(tx.expense_date)}</span>
                    <span className="text-right" style={{ color: "#ef4444", fontSize: 13, fontWeight: 600 }}>
                      -{formatCurrency(tx.amount)}
                    </span>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeleteExpense(tx.id)}
                        className="cursor-pointer p-1 rounded-lg hover:bg-rgba(239,68,68,0.1) hover:text-[#ef4444] transition-all"
                        style={{ color: "var(--muted-foreground)" }}
                        aria-label="Delete expense"
                        title="Delete expense"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      {/* Add Expense Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4 shadow-2xl" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: "#e8eaf0", fontSize: 16, fontWeight: 700 }}>Add New Expense</h3>
            <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label style={{ color: "#8b9ab4", fontSize: 11, fontWeight: 600 }}>Title / Merchant</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Starbucks"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.06)", color: "#e8eaf0", fontSize: 12, padding: "8px 12px", borderRadius: 8 }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ color: "#8b9ab4", fontSize: 11, fontWeight: 600 }}>Amount (₹)</label>
                <input
                  required
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.06)", color: "#e8eaf0", fontSize: 12, padding: "8px 12px", borderRadius: 8 }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ color: "#8b9ab4", fontSize: 11, fontWeight: 600 }}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.06)", color: "#e8eaf0", fontSize: 12, padding: "8px 12px", borderRadius: 8 }}
                >
                  <option>Food</option>
                  <option>Travel</option>
                  <option>Bills</option>
                  <option>Shopping</option>
                  <option>Health</option>
                  <option>Entertainment</option>
                  <option>Others</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ color: "#8b9ab4", fontSize: 11, fontWeight: 600 }}>Date</label>
                <input
                  required
                  type="date"
                  value={dateVal}
                  onChange={(e) => setDateVal(e.target.value)}
                  style={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.06)", color: "#e8eaf0", fontSize: 12, padding: "8px 12px", borderRadius: 8 }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ color: "#8b9ab4", fontSize: 11, fontWeight: 600 }}>Description</label>
                <textarea
                  placeholder="Additional description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.06)", color: "#e8eaf0", fontSize: 12, padding: "8px 12px", borderRadius: 8, height: 60, resize: "none" }}
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-lg cursor-pointer"
                  style={{ color: "#8b9ab4", background: "none", border: "none", fontSize: 12 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg cursor-pointer"
                  style={{ background: "linear-gradient(135deg,#00d4b4,#0891b2)", color: "#fff", fontSize: 12, fontWeight: 600 }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
