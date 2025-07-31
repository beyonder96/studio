
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HeartHandshake } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';

const getTotalDays = (isoDate?: string): number => {
    if (!isoDate) return 0;

    // Split the date string to handle it as UTC and avoid timezone issues
    const [year, month, day] = isoDate.split('T')[0].split('-').map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, day));
    const now = new Date();
    // Also get the current date in UTC
    const nowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (startDate > nowUTC) return 0;
    
    // Use differenceInDays for a more robust calculation across timezones and DST
    const totalDays = differenceInDays(nowUTC, startDate);
    
    return totalDays;
}

export function JourneyCard() {
  const { user } = useAuth();
  const [sinceDate, setSinceDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) {
        const db = getDatabase(firebaseApp);
        const sinceDateRef = ref(db, `users/${user.uid}/profile/sinceDate`);
        const unsubscribe = onValue(sinceDateRef, (snapshot) => {
            const date = snapshot.val();
            if (date) {
                setSinceDate(date);
            }
        });
        return () => unsubscribe();
    }
  }, [user]);

  const totalDays = getTotalDays(sinceDate);

  return (
    <Link href="/profile" className="block">
        <Card className="bg-white/10 dark:bg-black/10 shadow-none h-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <HeartHandshake className="h-5 w-5" />
                Nossa Jornada
            </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
            {sinceDate ? (
                <div>
                    <p className="text-6xl font-bold">{totalDays.toLocaleString('pt-BR')}</p>
                    <p className="text-xl text-muted-foreground mt-1">dias juntos!</p>
                </div>
            ) : (
            <div className="text-center text-muted-foreground py-4">
                <p className="text-sm">Defina a data de início do relacionamento no seu perfil para começar a contar.</p>
            </div>
            )}
        </CardContent>
        </Card>
    </Link>
  );
}
