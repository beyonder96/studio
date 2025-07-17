
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { DollarSign, CalendarCheck, MoreHorizontal, Landmark, Utensils, Home } from "lucide-react";
import { useContext, useMemo } from "react";
import { FinanceContext } from "@/contexts/finance-context";
import { isSameMonth, startOfMonth, endOfMonth, isWithinInterval, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/components/finance/transactions-table";
import Link from "next/link";


const categoryIcons: { [key: string]: React.ReactNode } = {
  'Salário': <Landmark className="h-5 w-5" />,
  'Alimentação': <Utensils className="h-5 w-5" />,
  'Moradia': <Home className="h-5 w-5" />,
  'Reunião': <CalendarCheck className="h-5 w-5" />,
  'Outros': <MoreHorizontal className="h-5 w-5" />,
};

type CalendarEvent = {
  id: string;
  title: string;
  type: 'transaction' | 'appointment';
  category: string;
  amount?: number;
  date: Date;
  icon: React.ReactNode;
};

const exampleAppointments: Omit<CalendarEvent, 'id' | 'type' | 'icon'| 'date'>[] = [
    { title: "Reunião de Design", category: "Reunião" },
    { title: "Consulta Médica", category: "Outros" },
];

export function MonthOverview() {
  const { transactions, formatCurrency } = useContext(FinanceContext);

  const allEventsForMonth = useMemo(() => {
    const today = new Date();
    const monthInterval = { start: startOfMonth(today), end: endOfMonth(today) };

    const transactionEvents: CalendarEvent[] = transactions
        .map((t: Transaction) => ({
            id: `trans-${t.id}`,
            title: t.description,
            type: 'transaction' as 'transaction',
            category: t.category,
            amount: t.amount,
            date: parseISO(t.date + 'T00:00:00'),
            icon: categoryIcons[t.category] || <DollarSign className="h-5 w-5" />,
        }))
        .filter(e => isWithinInterval(e.date, monthInterval));

    const appointmentEvents: CalendarEvent[] = exampleAppointments.map((a, i) => ({
      ...a,
      id: `appt-${i}`,
      type: 'appointment' as 'appointment',
      date: new Date(today.getFullYear(), today.getMonth(), 15 + i * 5), // Example dates
      icon: categoryIcons[a.category] || <CalendarCheck className="h-5 w-5" />,
    })).filter(e => isWithinInterval(e.date, monthInterval));
    
    return [...transactionEvents, ...appointmentEvents].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 4); // Limit to 4 events
  }, [transactions]);


  return (
    <Link href="/calendar" className="block">
    <Card className="h-full bg-white/10 dark:bg-black/10 border-none shadow-none flex flex-col hover:bg-white/20 dark:hover:bg-black/20 transition-colors">
      <CardHeader>
        <CardTitle>Eventos do Mês</CardTitle>
        <CardDescription>Seus próximos compromissos e transações.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        {allEventsForMonth.length > 0 ? (
            <div className="space-y-4">
            {allEventsForMonth.map((event) => (
                <div key={event.id} className="flex items-center gap-4">
                    <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                        event.type === 'transaction' ? 'bg-primary/20 text-primary' : 'bg-accent/50 text-accent-foreground'
                    )}>
                        {event.icon}
                    </div>
                    <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                            {format(event.date, "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                    </div>
                    {event.type === 'transaction' && event.amount && (
                        <p className={cn(
                            'font-mono text-sm font-medium',
                            event.amount > 0 ? 'text-green-500' : 'text-red-500'
                        )}>
                            {formatCurrency(event.amount)}
                        </p>
                    )}
                </div>
            ))}
            </div>
        ) : (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>Nenhum evento para este mês.</p>
            </div>
        )}
      </CardContent>
    </Card>
    </Link>
  );
}
