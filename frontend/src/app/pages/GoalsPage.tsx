import { useState } from "react";
import { Plus, Target } from "lucide-react";

const initialGoals = [
  { id: 1, icon: "🏠", name: "Home Down Payment", target: 1500000, saved: 420000, deadline: "Dec 2026", color: "#00d4b4" },
  { id: 2, icon: "✈️", name: "Europe Trip", target: 200000, saved: 75000, deadline: "Mar 2026", color: "#818cf8" },
  { id: 3, icon: "🚗", name: "New Car Fund", target: 800000, saved: 560000, deadline: "Jun 2026", color: "#f59e0b" },
  { id: 4, icon: "📚", name: "MBA Fees", target: 500000, saved: 120000, deadline: "Jul 2027", color: "#f472b6" },
  { id: 5, icon: "🏖️", name: "Emergency Fund", target: 300000, saved: 300000, deadline: "Completed", color: "#4ade80" },
];

export function GoalsPage() {
  const [goals] = useState(initialGoals);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Summary */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        {[
          { label: "Total Goal Amount", value: `₹${(totalTarget / 100000).toFixed(1)}L`, color: "#e8eaf0" },
          { label: "Total Saved", value: `₹${(totalSaved / 100000).toFixed(1)}L`, color: "#00d4b4" },
          { label: "Active Goals", value: `${goals.filter((g) => g.deadline !== "Completed").length}`, color: "#818cf8" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ color: "#8b9ab4", fontSize: 11, marginBottom: 6 }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: 26, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span style={{ color: "#e8eaf0", fontSize: 14, fontWeight: 600 }}>Your Financial Goals</span>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "rgba(0,212,180,0.12)", color: "#00d4b4", fontSize: 12, fontWeight: 600, border: "1px solid rgba(0,212,180,0.2)" }}>
          <Plus size={13} /> New Goal
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {goals.map((goal) => {
          const pct = Math.min(Math.round((goal.saved / goal.target) * 100), 100);
          const completed = goal.deadline === "Completed" || pct === 100;
          return (
            <div key={goal.id} className="rounded-2xl p-5" style={{ background: "#111827", border: `1px solid ${completed ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.07)"}` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl flex items-center justify-center" style={{ width: 44, height: 44, background: "#1a2035", fontSize: 22 }}>{goal.icon}</div>
                  <div>
                    <div style={{ color: "#e8eaf0", fontSize: 14, fontWeight: 600 }}>{goal.name}</div>
                    <div style={{ color: "#8b9ab4", fontSize: 11, marginTop: 1 }}>Target: {goal.deadline}</div>
                  </div>
                </div>
                <div className="text-right">
                  {completed && <span className="rounded-full px-2 py-0.5 block mb-1" style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80", fontSize: 9, fontWeight: 600 }}>✓ Completed</span>}
                  <div style={{ color: "#e8eaf0", fontSize: 16, fontWeight: 700 }}>₹{goal.saved.toLocaleString("en-IN")}</div>
                  <div style={{ color: "#8b9ab4", fontSize: 11 }}>of ₹{goal.target.toLocaleString("en-IN")}</div>
                </div>
              </div>
              <div className="rounded-full" style={{ height: 8, background: "rgba(255,255,255,0.07)" }}>
                <div className="rounded-full transition-all" style={{ height: 8, width: `${pct}%`, background: completed ? "#4ade80" : goal.color }} />
              </div>
              <div className="flex justify-between mt-2">
                <span style={{ color: "#8b9ab4", fontSize: 10 }}>{pct}% achieved</span>
                <span style={{ color: completed ? "#4ade80" : goal.color, fontSize: 10 }}>
                  {completed ? "Goal reached! 🎉" : `₹${(goal.target - goal.saved).toLocaleString("en-IN")} remaining`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
