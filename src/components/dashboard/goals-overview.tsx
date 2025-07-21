
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useContext, useState, useEffect } from "react";
import { FinanceContext, Goal } from "@/contexts/finance-context";
import { Skeleton } from '../ui/skeleton';
import { AddGoalProgressDialog } from '../goals/add-goal-progress-dialog';
import { Button } from '../ui/button';

export function GoalsOverview() {
  const { goals, formatCurrency, addGoalProgress } = useContext(FinanceContext);
  const [isClient, setIsClient] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDialogOpen(true);
  };
  
  const handleSaveProgress = (amount: number, accountId: string) => {
    if(selectedGoal) {
        addGoalProgress(selectedGoal.id, amount, accountId);
    }
    setIsDialogOpen(false);
    setSelectedGoal(null);
  }

  const pendingGoals = goals.filter(g => !g.completed && g.currentAmount < g.targetAmount).slice(0, 3);

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
    <>
        <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none h-full flex flex-col">
            <CardHeader>
                <Link href="/goals" className="block">
                    <CardTitle className="hover:text-primary transition-colors">Metas e Desejos</CardTitle>
                </Link>
            </CardHeader>
            <CardContent className="flex-grow">
                {!isClient ? renderSkeletons() : pendingGoals.length > 0 ? (
                <div className="space-y-6">
                    {pendingGoals.map((goal) => {
                    const progress = getProgress(goal);
                    return (
                        <div key={goal.id} className="cursor-pointer group" onClick={() => handleGoalClick(goal)}>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium group-hover:text-primary transition-colors">{goal.name}</span>
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
                <div className="text-center text-muted-foreground py-4 h-full flex flex-col justify-center items-center">
                    <p className="text-sm">Nenhuma meta pendente.</p>
                     <Button asChild variant="link" size="sm">
                        <Link href="/goals">Adicione uma nova meta!</Link>
                    </Button>
                </div>
                )}
            </CardContent>
        </Card>
        {selectedGoal && (
            <AddGoalProgressDialog 
                isOpen={isDialogOpen}
                onClose={() => { setIsDialogOpen(false); setSelectedGoal(null); }}
                onSave={handleSaveProgress}
                goal={selectedGoal}
            />
        )}
    </>
  );
}
