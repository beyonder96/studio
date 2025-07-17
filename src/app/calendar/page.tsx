
'use client';

import { useState, useMemo, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { FinanceContext } from '@/contexts/finance-context';
import type { Transaction } from '@/components/finance/transactions-table';
import { format, isSameDay, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft, Calendar as CalendarIcon, DollarSign, CalendarCheck } from 'lucide-react';

type CalendarEvent = {
  id: string;
  title: string;
  time?: string;
  type: 'transaction' | 'appointment';
  category: string;
  amount?: number;
  date: Date;
};

const exampleAppointments: Omit<CalendarEvent, 'id' | 'type' | 'date'>[] = [
    { title: "Reunião de Design", time: "10:00", category: "Trabalho" },
    { title: "Consulta Médica", time: "14:00", category: "Saúde" },
    { title: "Almoço com a equipe", time: "12:30", category: "Social" },
];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfToday());
  const { transactions, formatCurrency } = useContext(FinanceContext);

  const allEventsForMonth = useMemo(() => {
    const transactionEvents: CalendarEvent[] = transactions.map((t: Transaction) => ({
      id: `trans-${t.id}`,
      title: t.description,
      type: 'transaction',
      category: t.category,
      amount: t.amount,
      date: new Date(t.date + 'T00:00:00'),
    }));

    const appointmentEvents: CalendarEvent[] = exampleAppointments.map((a, i) => ({
      ...a,
      id: `appt-${i}`,
      type: 'appointment',
      date: startOfToday(), // For simplicity, all appointments are on the same day.
    }));
    
    // In a real app, you would fetch appointments for the current month view
    return [...transactionEvents, ...appointmentEvents];
  }, [transactions]);
  
  const eventsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return allEventsForMonth
        .filter(event => isSameDay(event.date, selectedDate))
        .sort((a,b) => {
            if (a.time && b.time) return a.time.localeCompare(b.time);
            if (a.time) return -1;
            if (b.time) return 1;
            return 0;
        });
  }, [selectedDate, allEventsForMonth]);

  const handleBackClick = () => {
    window.history.back();
  };

  return (
    <div className="flex h-screen w-full flex-col bg-muted/40 p-0">
        <div className="absolute top-6 left-6 z-20">
             <Button variant="ghost" size="icon" className="bg-background/50 hover:bg-muted/80 rounded-full backdrop-blur-sm" onClick={handleBackClick}>
                <ArrowLeft className="h-5 w-5"/>
            </Button>
        </div>
        <main className="flex flex-1 flex-col gap-4 overflow-auto rounded-lg bg-background p-4 sm:p-6">
            <div className="w-full">
                <Card>
                    <CardContent className="p-2 sm:p-4">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="p-0 [&_td]:w-full"
                            classNames={{
                                month: 'space-y-4 w-full',
                                table: 'w-full border-collapse',
                                head_row: 'flex justify-around',
                                row: 'flex w-full mt-2 justify-around',
                                cell: 'text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                                day: cn(
                                    'h-10 w-14 rounded-md',
                                    buttonVariants({ variant: "ghost" })
                                ),
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            }}
                            locale={ptBR}
                            modifiers={{ 
                                events: allEventsForMonth.map(e => e.date)
                            }}
                            modifiersClassNames={{
                                events: "bg-primary/10 rounded-full"
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="flex-1">
                <h2 className="text-xl font-bold mb-4">
                    {selectedDate ? (
                        <>
                        <span className="text-muted-foreground font-normal">Eventos para </span> 
                        {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                        </>
                    ): (
                        "Selecione uma data"
                    )}
                </h2>
                
                {selectedDate ? (
                    eventsForSelectedDay.length > 0 ? (
                    <ul className="space-y-3">
                        {eventsForSelectedDay.map(event => (
                            <li key={event.id}>
                                <Card className="p-4 transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "flex h-12 w-12 items-center justify-center rounded-lg",
                                            event.type === 'transaction' ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-purple-100 dark:bg-purple-900/50'
                                        )}>
                                          {event.type === 'transaction' ? 
                                            <DollarSign className="h-6 w-6 text-blue-500" /> :
                                            <CalendarCheck className="h-6 w-6 text-purple-500" />
                                          }
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{event.title}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Badge variant="secondary" className="font-normal">{event.category}</Badge>
                                                {event.time && (
                                                    <span>• {event.time}</span>
                                                )}
                                            </div>
                                        </div>
                                        {event.type === 'transaction' && event.amount && (
                                            <p className={cn(
                                                'font-mono text-lg font-bold',
                                                event.amount > 0 ? 'text-green-500' : 'text-red-500'
                                            )}>
                                                {formatCurrency(event.amount)}
                                            </p>
                                        )}
                                    </div>
                                </Card>
                            </li>
                        ))}
                    </ul>
                    ) : (
                    <div className="text-center text-muted-foreground py-16 flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-full">
                        <CalendarIcon className="h-12 w-12 mb-4" />
                        <h3 className="text-lg font-medium">Nenhum evento para este dia.</h3>
                        <p className="text-sm">Selecione outra data ou adicione um novo evento.</p>
                    </div>
                    )
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        <p>Selecione um dia no calendário para ver os eventos.</p>
                    </div>
                )}
            </div>
        </main>
    </div>
  );
}
