
'use client';

import { useState, useMemo, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { FinanceContext, Appointment } from '@/contexts/finance-context';
import type { Transaction } from '@/components/finance/transactions-table';
import { format, isSameDay, startOfToday, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft, Calendar as CalendarIcon, DollarSign, CalendarCheck, PlusCircle, Edit, Trash2, Globe } from 'lucide-react';
import { AddAppointmentDialog } from '@/components/calendar/add-appointment-dialog';
import { useAuth } from '@/contexts/auth-context';

type CalendarEvent = {
  id: string;
  title: string;
  time?: string;
  type: 'transaction' | 'appointment';
  category: string;
  amount?: number;
  date: Date;
  raw: Transaction | Appointment;
  isGoogleEvent?: boolean;
};

export default function CalendarPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfToday());
  const { 
    transactions, 
    appointments, 
    formatCurrency, 
    addAppointment, 
    updateAppointment, 
    deleteAppointment,
    fetchGoogleCalendarEvents
   } = useContext(FinanceContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (user) {
        const today = new Date();
        const timeMin = startOfMonth(today).toISOString();
        const timeMax = endOfMonth(today).toISOString();
        fetchGoogleCalendarEvents(user.uid, timeMin, timeMax);
    }
  }, [user, fetchGoogleCalendarEvents]);

  const allEventsForMonth = useMemo(() => {
    const transactionEvents: CalendarEvent[] = transactions.map((t: Transaction) => ({
      id: `trans-${t.id}`,
      title: t.description,
      type: 'transaction',
      category: t.category,
      amount: t.amount,
      date: parseISO(t.date + 'T00:00:00'),
      raw: t
    }));

    const appointmentEvents: CalendarEvent[] = appointments.map((a: Appointment) => ({
      id: a.googleEventId ? `gcal-${a.googleEventId}` : `appt-${a.id}`,
      title: a.title,
      type: 'appointment',
      category: a.category,
      date: parseISO(a.date + 'T00:00:00'),
      time: a.time,
      raw: a,
      isGoogleEvent: !!a.googleEventId,
    }));
    
    return [...transactionEvents, ...appointmentEvents];
  }, [transactions, appointments]);
  
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

  const openAddDialog = () => {
    setEditingAppointment(null);
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsDialogOpen(true);
  };

  const handleSaveAppointment = (data: Omit<Appointment, 'id'> & { id?: string }) => {
    if (data.id) {
      updateAppointment(data.id, data);
    } else {
      addAppointment(data);
    }
    setIsDialogOpen(false);
  };

  return (
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
        <CardContent className="p-4 sm:p-6">
            <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between pb-4 sm:pb-6 border-b">
                <div>
                    <h1 className="text-2xl font-bold">Calendário</h1>
                    <p className="text-muted-foreground">Visualize seus compromissos e transações.</p>
                </div>
                <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Evento
                </Button>
            </div>

            <div className="flex flex-1 flex-col md:flex-row gap-4 overflow-auto rounded-lg bg-transparent pt-4 sm:pt-6">
                <div className="w-full md:w-auto md:max-w-sm">
                    <Card className="bg-transparent">
                        <CardContent className="p-0 sm:p-0">
                             <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="p-0"
                                classNames={{
                                    month: 'space-y-4 w-full',
                                    table: 'w-full border-collapse',
                                    head_row: 'grid grid-cols-7',
                                    head_cell: 'text-muted-foreground rounded-md w-full font-normal text-[0.8rem] justify-center flex',
                                    row: 'grid grid-cols-7 w-full mt-2',
                                    cell: 'text-center text-sm p-0 relative focus-within:relative focus-within:z-20 flex justify-center',
                                    day: cn(
                                        'h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-md',
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
                    <Card className="h-full bg-transparent">
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
                            <CardDescription>
                                {eventsForSelectedDay.length > 0 
                                    ? `Você tem ${eventsForSelectedDay.length} evento(s) hoje.`
                                    : `Nenhum evento agendado.`
                                }
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                            {selectedDate ? (
                                eventsForSelectedDay.length > 0 ? (
                                <ul className="space-y-3">
                                    {eventsForSelectedDay.map(event => (
                                        <li key={event.id}>
                                            <div className="flex items-center gap-4 border p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className={cn(
                                                    "flex h-10 w-10 items-center justify-center rounded-lg text-lg",
                                                    event.type === 'transaction' ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-purple-100 dark:bg-purple-900/50',
                                                    event.isGoogleEvent && 'bg-green-100 dark:bg-green-900/50'
                                                )}>
                                                {event.type === 'transaction' ? 
                                                    <DollarSign className="h-5 w-5 text-blue-500" /> :
                                                    event.isGoogleEvent ?
                                                    <Globe className="h-5 w-5 text-green-500" /> :
                                                    <CalendarCheck className="h-5 w-5 text-purple-500" />
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
                                                        'font-mono font-bold',
                                                        event.amount > 0 ? 'text-green-500' : 'text-red-500'
                                                    )}>
                                                        {formatCurrency(event.amount)}
                                                    </p>
                                                )}
                                                {event.type === 'appointment' && !event.isGoogleEvent && (
                                                    <div className="flex items-center gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(event.raw as Appointment)}>
                                                        <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteAppointment(event.raw.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
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
                        </CardContent>
                    </Card>
                </div>
            </div>
            </div>
            <AddAppointmentDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveAppointment}
                appointment={editingAppointment}
                selectedDate={selectedDate}
            />
        </CardContent>
    </Card>
  );
}
