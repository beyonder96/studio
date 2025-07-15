
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
  participants?: string[];
  color: string;
  type: 'recurring' | 'appointment';
};

// Map categories to colors for consistent styling
const categoryColors: { [key: string]: string } = {
  Moradia: 'bg-blue-200/70 border-blue-400',
  Salário: 'bg-green-200/70 border-green-400',
  // Add more mappings as needed
};
const defaultColor = 'bg-gray-200/70 border-gray-400';

const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

// Example appointments
const exampleAppointments: Omit<CalendarEvent, 'id' | 'type' | 'color'>[] = [
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
         // Create a date object from the transaction's date string
        const transactionDate = parse(t.date, 'yyyy-MM-dd', new Date());
        
        // Let's assume recurring transactions are all-day events for simplicity
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), transactionDate.getDate());
        const endDate = new Date(startDate);

        return {
          id: `trans-${t.id}`,
          title: t.description,
          start: startDate,
          end: endDate,
          color: categoryColors[t.category] || defaultColor,
          type: 'recurring',
        };
      });
  }, [transactions, currentDate]);

  const appointments: CalendarEvent[] = useMemo(() => {
    return exampleAppointments.map((appt, index) => ({
      ...appt,
      id: `appt-${index}`,
      color: 'bg-purple-200/70 border-purple-400',
      type: 'appointment',
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

  const renderEvent = (event: CalendarEvent, day: Date) => {
    if (!isSameDay(event.start, day)) return null;
    
    if(event.type === 'recurring') {
        return (
            <div key={event.id} className={cn("absolute left-2 right-2 p-1 rounded-lg text-xs", event.color)}>
                {event.title}
            </div>
        )
    }

    const startHour = getHours(event.start);
    const startMinute = getMinutes(event.start);
    const endHour = getHours(event.end);
    const endMinute = getMinutes(event.end);

    const top = ((startHour - 8) * 60 + startMinute) / (10 * 60) * 100;
    const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / (10 * 60) * 100;
    
    if (top < 0 || top > 100) return null;


    return (
        <div 
            key={event.id}
            className={cn("absolute left-2 right-2 p-2 rounded-lg text-xs flex flex-col justify-between overflow-hidden", event.color)}
            style={{ top: `${top}%`, height: `${height}%`}}
        >
            <div>
                <p className="font-bold">{event.title}</p>
                <p className="text-gray-600">{format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}</p>
            </div>
            {event.participants && event.participants.length > 0 && (
                <div className="flex -space-x-2">
                    {event.participants.map((p, i) => (
                         <Avatar key={i} className="h-5 w-5 border-2 border-white">
                            <AvatarImage src={p} data-ai-hint="person face" />
                            <AvatarFallback>P</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
            )}
        </div>
    );
  };


  return (
    <div className="flex h-screen flex-col bg-background text-foreground font-sans">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between border-b p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">
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
           <div className="h-16 flex-shrink-0 border-b"></div>
           <div className="flex-1 relative">
            {hours.map(hour => (
              <div key={hour} className="relative h-[calc(100%/10)]">
                 <span className="absolute -top-2 right-2">{hour}:00</span>
              </div>
            ))}
           </div>
        </div>

        {/* Week View */}
        <div className="flex flex-1 flex-col">
            {/* Day Headers */}
            <div className="grid grid-cols-7 h-16 flex-shrink-0">
                {weekDays.map(day => (
                    <div key={day.toString()} className="flex flex-col items-center justify-center border-b border-l">
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
                ))}
            </div>
             {/* Event Grid */}
            <div className="grid flex-1 grid-cols-7 overflow-y-auto">
                {weekDays.map(day => (
                    <div key={day.toString()} className="relative border-l">
                         {/* Hour lines */}
                        {hours.map(hour => (
                            <div key={`${day.toString()}-${hour}`} className="h-[calc(100%/10)] border-b"></div>
                        ))}
                         {/* Events for this day */}
                        {allEvents.map(event => renderEvent(event, day))}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

