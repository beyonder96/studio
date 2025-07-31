
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { UserNav } from '@/components/user-nav';
import { DashboardHeader } from '@/components/dashboard/logo';
import { TransactionsOverview } from '@/components/dashboard/transactions-overview';
import { GoalsOverview } from '@/components/dashboard/goals-overview';
import { TasksOverview } from '@/components/dashboard/tasks-overview';
import { CopilotCard } from '@/components/dashboard/copilot-card';
import { MonthOverview } from '@/components/dashboard/month-overview';
import { ShoppingListOverview } from '@/components/dashboard/shopping-list-overview';
import { JourneyCard } from '@/components/dashboard/journey-card';
import { useContext, useState, useEffect, useMemo } from 'react';
import { FinanceContext, Appointment } from '@/contexts/finance-context';
import { AddAppointmentDialog } from '@/components/calendar/add-appointment-dialog';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { WeatherOverview } from '@/components/dashboard/weather-overview';
import { CommandInput } from '@/components/dashboard/command-input';
import { CardHeader, CardTitle } from '@/components/ui/card';


const DateDisplay = () => {
  const [clientReady, setClientReady] = useState(false);
  useEffect(() => {
    setClientReady(true);
  }, []);

  if (!clientReady) {
    return (
      <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-lg text-center p-6">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </Card>
    )
  }

  const today = new Date();
  
  return (
      <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-lg text-center p-6">
          <p className="text-sm text-muted-foreground">Hoje é</p>
          <p className="text-2xl font-bold text-foreground capitalize">
              {format(today, "eeee, dd 'de' MMMM", { locale: ptBR })}
          </p>
      </Card>
  );
};


export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { transactions, appointments, addAppointment, totalIncome, totalExpenses, formatCurrency } = useContext(FinanceContext);

  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [selectedDateForAppointment, setSelectedDateForAppointment] = useState<Date | undefined>();
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, ensuring `new Date()` doesn't cause a hydration mismatch.
    setClientReady(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);
  
  const today = clientReady ? new Date() : undefined;
  
  const eventDates = useMemo(() => {
      const allEvents = [...transactions, ...appointments];
      return allEvents.map(event => new Date(event.date + 'T00:00:00'));
  }, [transactions, appointments]);


  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDateForAppointment(date);
    setIsAppointmentDialogOpen(true);
  };
  
  const handleSaveAppointment = (data: Omit<Appointment, 'id'>) => {
    addAppointment(data);
    setIsAppointmentDialogOpen(false);
  };
  
  const monthlyIncome = totalIncome();
  const monthlyExpenses = totalExpenses();
  
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <DashboardHeader />
              <UserNav />
            </div>
            <CommandInput />
             <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receitas no Mês</CardTitle>
                    <ArrowUpCircle className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">
                        {formatCurrency(monthlyIncome)}
                    </div>
                </CardContent>
            </Card>
             <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Despesas no Mês</CardTitle>
                    <ArrowDownCircle className="h-5 w-5 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                        {formatCurrency(monthlyExpenses)}
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Balanço Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatCurrency(monthlyIncome + monthlyExpenses)}
                    </div>
                </CardContent>
            </Card>
            <TransactionsOverview />
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-1 flex flex-col gap-6">
             <JourneyCard />
             <GoalsOverview />
             <ShoppingListOverview />
             <DateDisplay />
             <WeatherOverview />
          </div>

          {/* Right Column */}
           <div className="lg:col-span-1 flex flex-col gap-6">
              <TasksOverview />
              <MonthOverview />
              <CopilotCard />
          </div>

        </div>
      </div>

      <AddAppointmentDialog
        isOpen={isAppointmentDialogOpen}
        onClose={() => setIsAppointmentDialogOpen(false)}
        onSave={handleSaveAppointment}
        appointment={null}
        selectedDate={selectedDateForAppointment}
      />
    </>
  );
}
