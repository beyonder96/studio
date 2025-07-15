import { BalanceCard } from '@/components/dashboard/balance-card';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { ExpensesChart } from '@/components/dashboard/expenses-chart';
import { CopilotCard } from '@/components/dashboard/copilot-card';
import { TransactionsOverview } from '@/components/dashboard/transactions-overview';
import { GoalsOverview } from '@/components/dashboard/goals-overview';
import { TasksOverview } from '@/components/dashboard/tasks-overview';

export default function Home() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <BalanceCard />
          <SummaryCard type="income" />
          <SummaryCard type="expenses" />
          <CopilotCard />
        </div>
      </div>
      <div className="lg:col-span-8">
        <ExpensesChart />
      </div>
      <div className="lg:col-span-4">
        <TransactionsOverview />
      </div>
      <div className="lg:col-span-6">
        <GoalsOverview />
      </div>
      <div className="lg:col-span-6">
        <TasksOverview />
      </div>
    </div>
  );
}
