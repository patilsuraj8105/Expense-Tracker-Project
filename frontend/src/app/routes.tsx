import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { BudgetPage } from "./pages/BudgetPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AIInsightsPage } from "./pages/AIInsightsPage";
import { LoginPage } from "./pages/LoginPage";
import { GoalsPage } from "./pages/GoalsPage";
import { CardsPage } from "./pages/CardsPage";
import { BillsPage } from "./pages/BillsPage";
import { SavingsPage } from "./pages/SavingsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "transactions", Component: TransactionsPage },
      { path: "budget", Component: BudgetPage },
      { path: "analytics", Component: AnalyticsPage },
      { path: "ai-insights", Component: AIInsightsPage },
      { path: "goals", Component: GoalsPage },
      { path: "cards", Component: CardsPage },
      { path: "bills", Component: BillsPage },
      { path: "savings", Component: SavingsPage },
    ],
  },
]);
