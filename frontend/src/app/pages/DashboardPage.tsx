import { BudgetCard } from "../components/BudgetCard";
import { ExpenseTrend } from "../components/ExpenseTrend";
import { AnomalyAlerts } from "../components/AnomalyAlerts";
import { SMSTransactions } from "../components/SMSTransactions";
import { StatCards } from "../components/StatCards";

export function DashboardPage() {
  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="flex gap-5" style={{ minHeight: 260 }}>
        <div style={{ width: 260, flexShrink: 0 }}>
          <BudgetCard />
        </div>
        <ExpenseTrend />
      </div>
      <div className="flex gap-5" style={{ minHeight: 300 }}>
        <div style={{ width: 340, flexShrink: 0 }}>
          <AnomalyAlerts />
        </div>
        <SMSTransactions />
      </div>
      <StatCards />
    </div>
  );
}
