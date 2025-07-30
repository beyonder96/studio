
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { MoreHorizontal, Landmark, Briefcase, Heart, CalendarCheck } from "lucide-react";
import { useContext, useMemo } from "react";
import { FinanceContext } from "@/contexts/finance-context";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/contexts/finance-context";
import Link from "next/link";


const categoryIcons: { [key: string]: React.ReactNode } = {
  // Appointment Icons
  'Trabalho': <Briefcase className="h-5 w-5" />,
  'Saúde': <Heart className="h-5 w-5" />,
  'Social': <CalendarCheck className="h-5 w-5" />,
  'Pessoal': <CalendarCheck className="h-5 w-5" />,
  'Outros': <MoreHorizontal className="h-5 w-5" />,
};

type CalendarEvent = {
  id: string;
  title: string;
  type: 'appointment';
  category: string;
  date: Date;
  icon: React.ReactNode;
};

export function MonthOverview() {
  const { appointments } = useContext(FinanceContext);

  const allEventsForMonth = useMemo(() => {
    const today = new Date();
    const monthInterval = { start: startOfMonth(today), end: endOfMonth(today) };

    const appointmentEvents: CalendarEvent[] = appointments.map((a: Appointment) => ({
      id: `appt-${a.id}`,
      title: a.title,
      type: 'appointment' as 'appointment',
      category: a.category,
      date: parseISO(a.date + 'T00:00:00'),
      icon: categoryIcons[a.category] || <CalendarCheck className="h-5 w-5" />,
    })).filter(e => isWithinInterval(e.date, monthInterval));
    
    return [...appointmentEvents].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 4); // Limit to 4 events
  }, [appointments]);


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
                        'bg-accent/50 text-accent-foreground'
                    )}>
                        {event.icon}
                    </div>
                    <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                            {format(event.date, "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                    </div>
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
