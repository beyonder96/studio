
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useContext, useState, useEffect } from "react";
import { FinanceContext } from "@/contexts/finance-context";
import { Skeleton } from '../ui/skeleton';

// A simple hashing function to create a pseudo-random but stable progress for a given wish name
const getStableProgress = (wishName: string) => {
    let hash = 0;
    for (let i = 0; i < wishName.length; i++) {
        const char = wishName.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Ensure the result is a positive number between 10 and 90
    return (Math.abs(hash) % 81) + 10;
};


export function GoalsOverview() {
  const { wishes, formatCurrency } = useContext(FinanceContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const pendingWishes = wishes.filter(w => !w.purchased).slice(0, 3); // Show up to 3 pending wishes

  const renderSkeletons = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i}>
          <div className="flex justify-between mb-1">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-1/5" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <Link href="/wishes" className="block">
        <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none h-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors">
        <CardHeader>
            <CardTitle>Metas e Desejos</CardTitle>
        </CardHeader>
        <CardContent>
            {!isClient ? renderSkeletons() : pendingWishes.length > 0 ? (
            <div className="space-y-6">
                {pendingWishes.map((wish) => {
                const progress = getStableProgress(wish.name);
                const currentAmount = (wish.price * progress) / 100;
                return (
                    <div key={wish.id}>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{wish.name}</span>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                    <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{formatCurrency(currentAmount)}</span>
                        <span className="text-xs text-muted-foreground">{formatCurrency(wish.price)}</span>
                    </div>
                    </div>
                )
                })}
            </div>
            ) : (
            <div className="text-center text-muted-foreground py-4">
                <p className="text-sm">Nenhum desejo pendente.</p>
                <p className="text-xs">Adicione um novo desejo na página de Desejos!</p>
            </div>
            )}
        </CardContent>
        </Card>
    </Link>
  );
}
