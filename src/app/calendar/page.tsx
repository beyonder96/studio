
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
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type CalendarEvent = {
  id: string;
  title: string;
  time?: string;
  type: 'transaction' | 'appointment';
  category: string;
  amount?: number;
};

const exampleAppointments: Omit<CalendarEvent, 'id'| 'type'>[] = [
    { title: "Reunião de Design", time: "10:00", category: "Trabalho" },
    { title: "Consulta Médica", time: "14:00", category: "Saúde" },
    { title: "Almoço com a equipe", time: "12:30", category: "Social" },
];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfToday());
  const { transactions, formatCurrency } = useContext(FinanceContext);

  const allEventsForMonth = useMemo(() => {
    const transactionEvents: (CalendarEvent & { date: Date })[] = transactions.map((t: Transaction) => ({
      id: `trans-${t.id}`,
      title: t.description,
      type: 'transaction',
      category: t.category,
      amount: t.amount,
      date: new Date(t.date + 'T00:00:00'),
    }));

    const appointmentEvents: (CalendarEvent & { date: Date })[] = exampleAppointments.map((a, i) => ({
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
    return allEventsForMonth.filter(event => isSameDay(event.date, selectedDate));
  }, [selectedDate, allEventsForMonth]);

  const handleBackClick = () => {
    window.history.back();
  };

  return (
    <div className="flex h-screen w-full flex-col bg-muted/40 p-0 sm:p-4 md:p-6">
        <div className="absolute top-4 left-4 z-20">
             <Button variant="ghost" size="icon" className="bg-background hover:bg-muted rounded-full" onClick={handleBackClick}>
                <ArrowLeft className="h-5 w-5"/>
            </Button>
        </div>
        <main className="flex flex-1 flex-col-reverse gap-4 rounded-lg bg-background p-4 md:flex-row md:gap-8 md:p-6">
            <div className="flex items-center justify-center">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    locale={ptBR}
                    modifiers={{ 
                        events: allEventsForMonth.map(e => e.date)
                    }}
                    modifiersClassNames={{
                        events: "bg-primary/20 rounded-full"
                    }}
                />
            </div>
            <div className="flex-1">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>
                            {selectedDate ? (
                                <>
                                <span className="text-muted-foreground font-normal">Eventos para </span> 
                                {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                                </>
                            ): (
                                "Selecione uma data"
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                       {selectedDate ? (
                         eventsForSelectedDay.length > 0 ? (
                            <ul className="space-y-4">
                                {eventsForSelectedDay.map(event => (
                                    <li key={event.id} className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-muted text-sm">
                                            {event.time ? (
                                                <>
                                                    <span className="font-bold">{event.time.split(':')[0]}</span>
                                                    <span>{event.time.split(':')[1]}</span>
                                                </>
                                            ) : (
                                                 <span className="text-xs font-semibold">Dia Todo</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{event.title}</p>
                                            <Badge variant="secondary" className="font-normal">{event.category}</Badge>
                                        </div>
                                        {event.type === 'transaction' && event.amount && (
                                            <p className={cn(
                                                'font-mono text-sm',
                                                event.amount > 0 ? 'text-green-500' : 'text-red-500'
                                            )}>
                                                {formatCurrency(event.amount)}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                         ) : (
                            <div className="text-center text-muted-foreground py-16">
                                <p>Nenhum evento para este dia.</p>
                            </div>
                         )
                       ) : (
                         <div className="text-center text-muted-foreground py-16">
                            <p>Selecione um dia no calendário para ver os eventos.</p>
                        </div>
                       )}
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
