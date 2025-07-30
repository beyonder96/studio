
'use client';

import { useState, useMemo, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FinanceContext, Appointment } from '@/contexts/finance-context';
import { format, isSameDay, startOfToday, parseISO, endOfToday, addDays, isTomorrow, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, CalendarCheck, PlusCircle, Edit, Trash2, Globe, RefreshCw } from 'lucide-react';
import { AddAppointmentDialog } from '@/components/calendar/add-appointment-dialog';
import { useAuth } from '@/contexts/auth-context';

type CalendarEvent = {
  id: string;
  title: string;
  time?: string;
  type: 'appointment';
  category: string;
  date: Date;
  raw: Appointment;
  isGoogleEvent?: boolean;
};

const getRelativeDate = (date: Date) => {
    const today = startOfToday();
    if (isSameDay(date, today)) return 'Hoje';
    if (isSameDay(date, addDays(today, 1))) return 'Amanhã';
    if (isSameDay(date, addDays(today, -1))) return 'Ontem';
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
};


export default function CalendarPage() {
  const { user } = useAuth();
  const { 
    appointments, 
    addAppointment, 
    updateAppointment, 
    deleteAppointment,
   } = useContext(FinanceContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const allEvents = useMemo(() => {
    return appointments.map((a: Appointment) => ({
      id: a.googleEventId ? `gcal-${a.googleEventId}` : `appt-${a.id}`,
      title: a.title,
      type: 'appointment' as 'appointment',
      category: a.category,
      date: parseISO(a.date + 'T00:00:00'),
      time: a.time,
      raw: a,
      isGoogleEvent: !!a.googleEventId,
    }))
    .sort((a,b) => a.date.getTime() - b.date.getTime());
  }, [appointments]);
  
  const groupedEvents = useMemo(() => {
      const today = startOfToday();
      const futureEvents = allEvents.filter(event => event.date >= today);
      
      return futureEvents.reduce((acc, event) => {
          const dateString = format(event.date, 'yyyy-MM-dd');
          if (!acc[dateString]) {
              acc[dateString] = [];
          }
          acc[dateString].push(event);
          return acc;
      }, {} as Record<string, CalendarEvent[]>);
  }, [allEvents]);
  
  const sortedGroupKeys = Object.keys(groupedEvents).sort();

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
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl h-full">
        <CardContent className="p-4 sm:p-6 h-full flex flex-col">
            <div className="flex items-center justify-between pb-4 sm:pb-6 border-b flex-wrap gap-2">
                <div>
                    <h1 className="text-2xl font-bold">Agenda</h1>
                    <p className="text-muted-foreground">Seus próximos compromissos.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={openAddDialog}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Evento
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pt-4 sm:pt-6">
                 {sortedGroupKeys.length > 0 ? (
                    <div className="space-y-6">
                        {sortedGroupKeys.map(dateKey => (
                            <div key={dateKey}>
                                <h2 className="font-semibold text-lg mb-3 capitalize text-primary">
                                    {getRelativeDate(parseISO(dateKey))}
                                </h2>
                                <div className="space-y-3 border-l-2 border-primary/20 pl-6">
                                    {groupedEvents[dateKey]
                                        .sort((a,b) => (a.time || "23:59").localeCompare(b.time || "23:59"))
                                        .map(event => (
                                        <div key={event.id} className="relative flex items-center gap-4 border p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                             <div className="absolute -left-[35px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-primary ring-4 ring-background"></div>
                                            <div className={cn(
                                                "flex h-10 w-10 items-center justify-center rounded-lg text-lg shrink-0",
                                                !event.isGoogleEvent && 'bg-purple-100 dark:bg-purple-900/50',
                                                event.isGoogleEvent && 'bg-green-100 dark:bg-green-900/50'
                                            )}>
                                            {event.isGoogleEvent ?
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
                                            {!event.isGoogleEvent && (
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(event.raw)}>
                                                    <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteAppointment(event.raw.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-16 flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-full">
                        <CalendarIcon className="h-12 w-12 mb-4" />
                        <h3 className="text-lg font-medium">Nenhum evento futuro.</h3>
                        <p className="text-sm">Adicione um novo evento para começar.</p>
                    </div>
                )}
            </div>
            
            <AddAppointmentDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveAppointment}
                appointment={editingAppointment}
                selectedDate={startOfToday()}
            />
        </CardContent>
    </Card>
  );
}
