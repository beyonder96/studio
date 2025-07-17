
'use client';

import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { UserNav } from '@/components/user-nav';
import { DashboardHeader } from '@/components/logo';
import { TransactionsOverview } from '@/components/dashboard/transactions-overview';
import { GoalsOverview } from '@/components/dashboard/goals-overview';
import { TasksOverview } from '@/components/dashboard/tasks-overview';
import { CopilotCard } from '@/components/dashboard/copilot-card';
import { MonthOverview } from '@/components/dashboard/month-overview';
import { useContext } from 'react';
import { FinanceContext } from '@/contexts/finance-context';

export default function Home() {
  const { transactions } = useContext(FinanceContext);
  const eventDates = transactions.map(t => new Date(t.date + 'T00:00:00'));

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <DashboardHeader />
                <UserNav />
              </div>
              <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none">
                <Calendar
                  mode="single"
                  selected={new Date()}
                  className="p-0 [&_td]:w-full"
                   classNames={{
                      head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                      cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full",
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground rounded-full",
                      day_range_middle: "aria-selected:bg-accent/50 aria-selected:text-accent-foreground",
                  }}
                  modifiers={{ 
                      events: eventDates
                  }}
                  modifiersClassNames={{
                      events: "bg-primary/20 rounded-full"
                  }}
                />
              </Card>
              <GoalsOverview />
              <TasksOverview />
            </div>

            {/* Middle Column */}
            <div className="lg:col-span-1 flex flex-col gap-6">
               <h2 className="text-2xl font-bold">Painel Financeiro</h2>
               <CopilotCard />
               <TransactionsOverview />
            </div>

            {/* Right Column */}
             <div className="lg:col-span-1 flex flex-col gap-6">
                <h2 className="text-2xl font-bold">Eventos do Mês</h2>
                <MonthOverview />
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
