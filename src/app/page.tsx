
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
import { Loader2, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { WeatherOverview } from '@/components/dashboard/weather-overview';
import { CommandInput } from '@/components/dashboard/command-input';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { BalanceCard } from '@/components/dashboard/balance-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type Theme = 'light' | 'dark';

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
  const { 
    accounts, 
    addAppointment,
    isSensitiveDataVisible,
    toggleSensitiveDataVisibility,
   } = useContext(FinanceContext);
  const { toast } = useToast();

  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [selectedDateForAppointment, setSelectedDateForAppointment] = useState<Date | undefined>();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const storedTheme = (localStorage.getItem('app-theme') as Theme) || 'light';
    setTheme(storedTheme);
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
            <CommandInput />

            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {accounts.map((account) => (
                  <CarouselItem key={account.id}>
                    <BalanceCard account={account} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            
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
