
'use client';

import React, { useState, useMemo, useContext } from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  parse,
  getHours,
  getMinutes,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { FinanceContext } from '@/contexts/finance-context';
import type { Transaction } from '@/components/finance/transactions-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  participants?: string[];
  color: string;
  type: 'recurring' | 'appointment';
};

// Map categories to colors for consistent styling
const categoryColors: { [key: string]: string } = {
  Moradia: 'bg-blue-200/70 border-blue-400 text-blue-800',
  Salário: 'bg-green-200/70 border-green-400 text-green-800',
  Alimentação: 'bg-yellow-200/70 border-yellow-400 text-yellow-800',
};
const defaultColor = 'bg-gray-200/70 border-gray-400 text-gray-800';
const appointmentColor = 'bg-purple-200/70 border-purple-400 text-purple-800';

// Example appointments
const exampleAppointments: Omit<CalendarEvent, 'id' | 'type' | 'color' | 'allDay'>[] = [
    { title: "Reunião de Design", start: new Date(new Date().setHours(10, 0, 0, 0)), end: new Date(new Date().setHours(11, 30, 0, 0)), participants: ["https://placehold.co/32x32.png", "https://placehold.co/32x32.png"] },
    { title: "Consulta Médica", start: new Date(new Date().setDate(new Date().getDate() + 1)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(14, 0, 0, 0)), participants: [] },
    { title: "Almoço com a equipe", start: new Date(new Date().setDate(new Date().getDate() - 1)), end: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(13, 0, 0, 0)), participants: ["https://placehold.co/32x32.png", "https://placehold.co/32x32.png", "https://placehold.co/32x32.png"] },
];


export function FullCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('Semana'); // Mês, Semana, Dia
  const { transactions } = useContext(FinanceContext);

  const weekStartsOn = 1; // Monday

  const recurringEvents: CalendarEvent[] = useMemo(() => {
    return transactions
      .filter((t: Transaction) => t.isRecurring && t.frequency === 'monthly')
      .map((t: Transaction): CalendarEvent => {
        const transactionDate = parse(t.date, 'yyyy-MM-dd', new Date());
        const dayInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), transactionDate.getDate());
        
        return {
          id: `trans-${t.id}`,
          title: t.description,
          start: dayInCurrentMonth,
          end: dayInCurrentMonth,
          allDay: true,
          color: categoryColors[t.category] || defaultColor,
          type: 'recurring',
        };
      });
  }, [transactions, currentDate]);

  const appointments: CalendarEvent[] = useMemo(() => {
    return exampleAppointments.map((appt, index) => ({
      ...appt,
      id: `appt-${index}`,
      color: appointmentColor,
      type: 'appointment',
      allDay: false,
    }));
  }, []);

  const allEvents = [...recurringEvents, ...appointments];

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [currentDate, weekStartsOn]);

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handlePrevWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };
  
  const handleToday = () => {
      setCurrentDate(new Date());
  }

  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

  const renderTimedEvent = (event: CalendarEvent, day: Date) => {
    if (!isSameDay(event.start, day) || event.allDay) return null;
    
    const startHour = getHours(event.start);
    const startMinute = getMinutes(event.start);
    const endHour = getHours(event.end);
    const endMinute = getMinutes(event.end);

    const totalMinutesInView = 10 * 60; // 8 AM to 6 PM (10 hours)
    const top = ((startHour - 8) * 60 + startMinute) / totalMinutesInView * 100;
    const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / totalMinutesInView * 100;
    
    if (top < 0 || top >= 100) return null;

    return (
        <div 
            key={event.id}
            className={cn("absolute left-2 right-2 p-2 rounded-lg flex flex-col justify-between overflow-hidden", event.color)}
            style={{ top: `${top}%`, height: `${height}%`, minHeight: '30px' }}
        >
            <div>
                <p className="font-bold text-sm leading-tight">{event.title}</p>
                <p className="text-xs opacity-80">{format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}</p>
            </div>
            {event.participants && event.participants.length > 0 && (
                <div className="flex -space-x-2 mt-1">
                    {event.participants.map((p, i) => (
                         <Avatar key={i} className="h-5 w-5 border-2 border-white dark:border-gray-800">
                            <AvatarImage src={p} data-ai-hint="person face" />
                            <AvatarFallback>P</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
            )}
        </div>
    );
  };
  
  const renderAllDayEvent = (event: CalendarEvent, day: Date) => {
     if (!isSameDay(event.start, day) || !event.allDay) return null;
     
      return (
            <div key={event.id} className={cn("mx-1 p-1 rounded-md text-xs truncate", event.color)}>
                {event.title}
            </div>
        )
  }


  return (
    <div className="flex h-screen flex-col bg-background text-foreground font-sans">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between border-b p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h1>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="h-8 px-3" onClick={handleToday}>Hoje</Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 rounded-lg bg-muted p-1">
             <Button variant={view === 'Mês' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('Mês')}>Mês</Button>
             <Button variant={view === 'Semana' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('Semana')}>Semana</Button>
             <Button variant={view === 'Dia' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('Dia')}>Dia</Button>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Criar Evento
          </Button>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Timeline */}
        <div className="flex w-16 flex-col text-xs text-muted-foreground">
           {/* Placeholder for day headers */}
           <div className="h-[76px] flex-shrink-0 border-b"></div>
           <div className="flex-1 relative">
            {hours.map(hour => (
              <div key={hour} className="relative h-[10%]">
                 <span className="absolute -top-2 right-2">{hour}:00</span>
              </div>
            ))}
           </div>
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 flex-1">
            {weekDays.map(day => (
                <div key={day.toString()} className="flex flex-col border-l">
                    {/* Day Header */}
                    <div className="flex flex-col items-center justify-center border-b h-14">
                        <p className="text-sm uppercase text-muted-foreground">
                            {format(day, 'E', { locale: ptBR })}
                        </p>
                        <p className={cn(
                            "text-2xl font-bold",
                            isToday(day) && 'text-primary'
                        )}>
                            {format(day, 'd')}
                        </p>
                    </div>
                    {/* All-day events area */}
                    <div className="h-5 border-b py-0.5 space-y-0.5">
                       {allEvents.map(event => renderAllDayEvent(event, day))}
                    </div>
                     {/* Timed events area */}
                    <div className="relative flex-1">
                         {/* Hour lines */}
                        {hours.map(hour => (
                            <div key={`${day.toString()}-${hour}`} className="h-[10%] border-b"></div>
                        ))}
                         {/* Events for this day */}
                        {allEvents.map(event => renderTimedEvent(event, day))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
