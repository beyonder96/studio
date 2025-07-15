import { BalanceCard } from '@/components/dashboard/balance-card';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { ExpensesChart } from '@/components/dashboard/expenses-chart';
import { RecurrencesCard } from '@/components/dashboard/recurrences-card';
import { TransactionsOverview } from '@/components/dashboard/transactions-overview';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';


export default function Home() {
  return (
    <div className="flex flex-col gap-6">
       <Badge variant="outline" className="w-fit gap-2 rounded-full p-2 text-sm font-normal border-pink-500/50 text-pink-600 dark:text-pink-400">
          <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
          <span>2 anos. Próximo aniversário em 347 dias.</span>
        </Badge>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <BalanceCard />
        <SummaryCard type="income" />
        <SummaryCard type="expenses" />
        <RecurrencesCard />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExpensesChart />
        </div>
        <div className="lg:col-span-1">
          <TransactionsOverview />
        </div>
      </div>
    </div>
  );
}
