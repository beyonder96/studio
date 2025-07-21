
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useContext, useState, useEffect } from "react";
import { FinanceContext, Goal } from "@/contexts/finance-context";
import { Skeleton } from '../ui/skeleton';

export function GoalsOverview() {
  const { goals, formatCurrency } = useContext(FinanceContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const pendingGoals = goals.filter(g => g.currentAmount < g.targetAmount).slice(0, 3); // Show up to 3 pending goals

  const getProgress = (goal: Goal) => {
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

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
    <Link href="/goals" className="block">
        <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none h-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors">
        <CardHeader>
            <CardTitle>Metas e Desejos</CardTitle>
        </CardHeader>
        <CardContent>
            {!isClient ? renderSkeletons() : pendingGoals.length > 0 ? (
            <div className="space-y-6">
                {pendingGoals.map((goal) => {
                const progress = getProgress(goal);
                return (
                    <div key={goal.id}>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{goal.name}</span>
                        <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                    <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{formatCurrency(goal.currentAmount)}</span>
                        <span className="text-xs text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    </div>
                )
                })}
            </div>
            ) : (
            <div className="text-center text-muted-foreground py-4">
                <p className="text-sm">Nenhuma meta pendente.</p>
                <p className="text-xs">Adicione uma nova meta na página de Metas!</p>
            </div>
            )}
        </CardContent>
        </Card>
    </Link>
  );
}
