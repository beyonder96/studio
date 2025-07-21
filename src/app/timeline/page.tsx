
'use client';

import { useContext, useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FinanceContext, Memory } from '@/contexts/finance-context';
import { useAuth } from '@/contexts/auth-context';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';
import { format, parseISO, isValid, getYear, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Heart,
  Cake,
  Gift,
  CalendarCheck,
  Star,
  GalleryVerticalEnd,
  PartyPopper,
  Flag,
  Plus,
  Camera,
} from 'lucide-react';
import { AddMemoryDialog } from '@/components/timeline/add-memory-dialog';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

type TimelineEvent = {
  date: Date;
  title: string;
  description: string;
  type: 'relationship' | 'birthday' | 'wish' | 'appointment' | 'anniversary' | 'memory';
  icon: React.ReactNode;
  isFuture: boolean;
  imageUrl?: string;
};

type ProfileData = {
    names?: string;
    sinceDate?: string;
    birthday1?: string;
    birthday2?: string;
}

export default function TimelinePage() {
  const { user } = useAuth();
  const { wishes, appointments, memories, addMemory } = useContext(FinanceContext);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [isMemoryDialogOpen, setIsMemoryDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const db = getDatabase(firebaseApp);
      const profileRef = ref(db, `users/${user.uid}/profile`);
      const unsubscribe = onValue(profileRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setProfileData(data);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);
  
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];
    const today = startOfToday();
    const [name1, name2] = (profileData.names || 'Pessoa 1 & Pessoa 2').split(' & ');

    // 1. Relationship Start
    if (profileData.sinceDate && isValid(parseISO(profileData.sinceDate))) {
      const date = parseISO(profileData.sinceDate);
      events.push({
        date,
        title: 'O Início de Tudo',
        description: 'Onde a nossa jornada começou.',
        type: 'relationship',
        icon: <Heart className="h-5 w-5" />,
        isFuture: false,
      });
    }

    // 2. Anniversaries (Past and next one)
    if (profileData.sinceDate && isValid(parseISO(profileData.sinceDate))) {
        const since = parseISO(profileData.sinceDate);
        const currentYear = getYear(today);
        const startYear = getYear(since);
        
        for (let year = startYear + 1; year < currentYear; year++) {
            const anniversaryDate = new Date(year, since.getMonth(), since.getDate());
             if (anniversaryDate < today) {
                events.push({
                    date: anniversaryDate,
                    title: `Aniversário de ${year - startYear} Ano${year - startYear > 1 ? 's' : ''}`,
                    description: 'Mais um ano de amor e companheirismo.',
                    type: 'anniversary',
                    icon: <PartyPopper className="h-5 w-5" />,
                    isFuture: false,
                });
             }
        }
        
        let nextAnniversary = new Date(currentYear, since.getMonth(), since.getDate());
        if(nextAnniversary < today) {
            nextAnniversary.setFullYear(currentYear + 1);
        }
         events.push({
            date: nextAnniversary,
            title: `Próximo Aniversário de Namoro`,
            description: `Comemorando ${getYear(nextAnniversary) - startYear} anos juntos.`,
            type: 'anniversary',
            icon: <PartyPopper className="h-5 w-5" />,
            isFuture: true,
        });
    }

    // 3. Birthdays
    const addBirthdayEvents = (isoDate?: string, name?: string) => {
        if (!isoDate || !isValid(parseISO(isoDate)) || !name) return;
        const birthDate = parseISO(isoDate);
        const currentYear = getYear(today);
        
        let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
        if(nextBirthday < today) {
            nextBirthday.setFullYear(currentYear + 1);
        }
        events.push({
            date: nextBirthday,
            title: `Aniversário de ${name}`,
            description: 'Um dia especial para celebrar!',
            type: 'birthday',
            icon: <Cake className="h-5 w-5" />,
            isFuture: true,
        });
    };
    addBirthdayEvents(profileData.birthday1, name1);
    addBirthdayEvents(profileData.birthday2, name2);


    // 4. Purchased Wishes
    wishes.filter(w => w.purchased).forEach(wish => {
      const mockPurchaseDate = new Date(today.getFullYear(), Math.random() * 12, Math.random() * 28);
      events.push({
        date: mockPurchaseDate,
        title: 'Desejo Realizado!',
        description: `Conquistamos: ${wish.name}.`,
        type: 'wish',
        icon: <Star className="h-5 w-5" />,
        isFuture: false,
      });
    });

    // 5. Appointments
    appointments.forEach(appointment => {
      const date = parseISO(appointment.date + 'T00:00:00');
      events.push({
        date,
        title: `Compromisso: ${appointment.title}`,
        description: appointment.notes || `Categoria: ${appointment.category}`,
        type: 'appointment',
        icon: <CalendarCheck className="h-5 w-5" />,
        isFuture: date >= today,
      });
    });

    // 6. Custom Memories
    memories.forEach(memory => {
        const date = parseISO(memory.date);
        events.push({
            date,
            title: memory.title,
            description: memory.description,
            type: 'memory',
            icon: <Camera className="h-5 w-5" />,
            isFuture: date >= today,
            imageUrl: memory.imageUrl
        });
    });
    
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [profileData, wishes, appointments, memories]);
  
  const getEventTypeStyles = (type: TimelineEvent['type'], isFuture: boolean) => {
    const futureStyles = isFuture ? 'border-primary/50 bg-primary/5 text-primary' : 'bg-muted';
    const baseIcon = `h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-background ${futureStyles}`;
    switch(type) {
      case 'relationship': return cn(baseIcon, 'bg-rose-500/20 text-rose-500');
      case 'anniversary': return cn(baseIcon, isFuture ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-500');
      case 'birthday': return cn(baseIcon, isFuture ? 'bg-primary/20 text-primary' : 'bg-pink-500/20 text-pink-500');
      case 'wish': return cn(baseIcon, 'bg-yellow-500/20 text-yellow-500');
      case 'appointment': return cn(baseIcon, isFuture ? 'bg-primary/20 text-primary' : 'bg-cyan-500/20 text-cyan-500');
      case 'memory': return cn(baseIcon, isFuture ? 'bg-primary/20 text-primary' : 'bg-green-500/20 text-green-500');
      default: return cn(baseIcon, 'bg-gray-500/20 text-gray-500');
    }
  };

  const handleSaveMemory = (data: Omit<Memory, 'id'>) => {
      addMemory(data);
      setIsMemoryDialogOpen(false);
  }

  return (
    <>
        <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
        <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Linha do Tempo</h1>
                        <p className="text-muted-foreground">A história e o futuro da jornada de vocês.</p>
                    </div>
                    <Button onClick={() => setIsMemoryDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Memória
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute left-5 sm:left-1/2 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
                    
                    <div className="space-y-12">
                    {timelineEvents.map((event, index) => (
                        <div key={index} className="relative flex items-center">
                            <div className={cn(
                                "absolute left-5 sm:left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full",
                                event.isFuture ? 'bg-primary' : 'bg-border'
                            )}></div>

                            <div className={cn(
                            "flex items-center gap-4 w-full",
                            index % 2 === 0 ? "sm:flex-row-reverse" : "sm:flex-row"
                            )}>
                                <div className="hidden sm:block w-1/2"></div>
                                <div className="w-full sm:w-1/2">
                                    <Card className={cn(
                                        "bg-transparent flex flex-col p-0",
                                        event.isFuture && 'border-dashed'
                                    )}>
                                        {event.imageUrl && (
                                            <div className="relative w-full h-40">
                                                <Image src={event.imageUrl} alt={event.title} layout="fill" objectFit="cover" className="rounded-t-lg"/>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4 p-4">
                                            <div className={cn("hidden sm:flex self-start", getEventTypeStyles(event.type, event.isFuture))}>
                                                {event.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold">{event.title}</p>
                                                        <p className="text-sm text-muted-foreground">{event.description}</p>
                                                    </div>
                                                    <Badge variant={event.isFuture ? 'default' : 'secondary'} className="whitespace-nowrap ml-2">
                                                    {format(event.date, "dd MMM yyyy", { locale: ptBR })}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    ))}
                    {timelineEvents.length === 0 && (
                        <div className="text-center text-muted-foreground py-16">
                            <GalleryVerticalEnd className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">Sua linha do tempo está sendo construída.</h3>
                            <p className="mt-1 text-sm">Adicione memórias e outros eventos para começar.</p>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </CardContent>
        </Card>
        <AddMemoryDialog
            isOpen={isMemoryDialogOpen}
            onClose={() => setIsMemoryDialogOpen(false)}
            onSave={handleSaveMemory}
        />
    </>
  );
}
