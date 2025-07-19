
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HeartHandshake } from 'lucide-react';
import { differenceInYears, addYears, differenceInDays } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';

const getSinceText = (isoDate?: string): { years: number, days: number } => {
    if (!isoDate) return { years: 0, days: 0 };
    const startDate = new Date(isoDate);
    const now = new Date();
    
    const totalDays = differenceInDays(now, startDate);
    if (totalDays < 0) return { years: 0, days: 0 };

    const years = differenceInYears(now, startDate);
    const dateAfterYears = addYears(startDate, years);
    const days = differenceInDays(now, dateAfterYears);

    return { years, days };
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

  const { years, days } = getSinceText(sinceDate);

  return (
    <Link href="/profile" className="block">
        <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none h-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <HeartHandshake className="h-5 w-5" />
                Nossa Jornada
            </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
            {sinceDate ? (
                <div>
                    <p className="text-4xl font-bold">{years}<span className="text-2xl font-normal text-muted-foreground"> anos</span></p>
                    <p className="text-4xl font-bold">{days}<span className="text-2xl font-normal text-muted-foreground"> dias</span></p>
                    <p className="text-sm text-muted-foreground mt-2">juntos!</p>
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
