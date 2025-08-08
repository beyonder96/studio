
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
import { FinanceContext, Account } from '@/contexts/finance-context';
import { AddAppointmentDialog } from '@/components/calendar/add-appointment-dialog';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, Moon, Sun, HeartPulse } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { CommandInput } from '@/components/dashboard/command-input';

type Theme = 'light' | 'dark';

const DateDisplay = () => {
  const [clientReady, setClientReady] = useState(false);
  useEffect(() => {
    setClientReady(true);
  }, []);

  if (!clientReady) {
    return (
      <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-lg p-6 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
      </Card>
    )
  }

  const today = new Date();
  
  return (
      <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">Hoje é</p>
          <p className="capitalize text-2xl font-bold text-foreground">
              {format(today, "eeee, dd 'de' MMMM", { locale: ptBR })}
          </p>
      </Card>
  );
};

const HealthCard = () => {
    return (
        <Link href="/health" className="block">
            <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none h-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors">
                <CardContent className="p-6 flex items-center justify-center h-full">
                    <div className="text-center">
                        <HeartPulse className="mx-auto h-10 w-10 text-primary mb-2" />
                        <h3 className="font-semibold text-lg">Minha Saúde</h3>
                        <p className="text-xs text-muted-foreground">Contatos de emergência e informações.</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}


export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { 
    addAppointment,
    isSensitiveDataVisible,
    toggleSensitiveDataVisibility,
   } = useContext(FinanceContext);
  const { toast } = useToast();

  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [selectedDateForAppointment, setSelectedDateForAppointment] = useState<Date | undefined>();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // This effect runs once on component mount to set the theme from localStorage
    const storedTheme = (localStorage.getItem('app-theme') as Theme) || 'light';
    setTheme(storedTheme);
    // The theme is applied globally in layout.tsx
  }, []);
  
  const handleThemeChange = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    toast({
        title: `Tema alterado para ${newTheme === 'light' ? 'Claro' : 'Escuro'}!`,
    });
  };
  
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);
  
  const handleSaveAppointment = (data: Omit<Appointment, 'id'>) => {
    addAppointment(data);
    setIsAppointmentDialogOpen(false);
  };
  
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex items-center justify-between pb-6">
            <DashboardHeader />
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleSensitiveDataVisibility}>
                    {isSensitiveDataVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </Button>
                  <Button variant="ghost" size="icon" onClick={handleThemeChange}>
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
                <UserNav />
            </div>
        </div>

        <div className="pb-6">
            <CommandInput />
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Left Column */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <TransactionsOverview />
          </div>

          {/* Middle Column */}
          <div className="flex flex-col gap-6 lg:col-span-1">
             <JourneyCard />
             <GoalsOverview />
             <ShoppingListOverview />
             <DateDisplay />
          </div>

          {/* Right Column */}
           <div className="flex flex-col gap-6 lg:col-span-1">
              <CopilotCard />
              <TasksOverview />
              <MonthOverview />
              <HealthCard />
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
