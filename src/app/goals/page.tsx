
'use client';

import { useState, useContext, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Edit, CheckCircle2, Target, MoreVertical, Star, Trophy, ListChecks, ChevronDown, ChevronUp } from 'lucide-react';
import { FinanceContext, Goal, Milestone } from '@/contexts/finance-context';
import { AddGoalDialog } from '@/components/goals/add-goal-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import Confetti from 'react-confetti';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { AddGoalProgressDialog } from '@/components/goals/add-goal-progress-dialog';
import Loading from '../finance/loading';

const GoalCard = ({ goal, onEdit, onToggleCompleted, onDelete, onToggleMilestone, onAddProgress }: { 
    goal: Goal,
    onEdit: (g: Goal) => void,
    onToggleCompleted: (g: Goal) => void,
    onDelete: (g: Goal) => void,
    onToggleMilestone: (goalId: string, milestoneId: string) => void;
    onAddProgress: (g: Goal) => void;
}) => {
    const { formatCurrency } = useContext(FinanceContext);
    const [isChecklistOpen, setIsChecklistOpen] = useState(false);

    const getProgressPercentage = (g: Goal) => {
        if (g.completed) return 100;
        if (!g.targetAmount || g.targetAmount === 0) return 0;
        return (g.currentAmount / g.targetAmount) * 100;
    };
    
    const getMilestoneProgress = (g: Goal) => {
        if (!g.milestones || g.milestones.length === 0) return { percent: 0, text: 'Nenhuma etapa' };
        const completed = g.milestones.filter(m => m.completed).length;
        const total = g.milestones.length;
        return {
            percent: (completed / total) * 100,
            text: `${completed} de ${total} etapas`
        };
    }

    const progress = getProgressPercentage(goal);
    const milestoneProgress = getMilestoneProgress(goal);

    return (
        <Card className="flex flex-col card-hover-effect bg-transparent">
            <CardHeader className="relative p-0">
                <Image
                    src={goal.imageUrl || "https://placehold.co/600x400.png"}
                    alt={goal.name}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover rounded-t-lg"
                    data-ai-hint="travel goal"
                />
                <div className="absolute top-2 right-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(goal)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleCompleted(goal)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Marcar como concluída
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(goal)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col">
                <CardTitle className="text-lg mb-2">{goal.name}</CardTitle>
                <div className="flex-grow space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-muted-foreground">Progresso Financeiro</span>
                             <Badge variant="secondary" className="font-normal">
                                {Math.round(progress)}%
                            </Badge>
                        </div>
                        <Progress value={progress} />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                            <span>{formatCurrency(goal.currentAmount)}</span>
                            <span className="font-semibold">{formatCurrency(goal.targetAmount)}</span>
                        </div>
                    </div>
                     {goal.milestones && goal.milestones.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-muted-foreground">Checklist</span>
                                <Badge variant="outline" className="font-normal">
                                    {milestoneProgress.text}
                                </Badge>
                            </div>
                            <Progress value={milestoneProgress.percent} className="h-2" />
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-2">
                 <Button variant="outline" onClick={() => onAddProgress(goal)}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Adicionar Progresso
                </Button>
                {goal.milestones && goal.milestones.length > 0 && (
                    <Collapsible open={isChecklistOpen} onOpenChange={setIsChecklistOpen}>
                        <CollapsibleTrigger asChild>
                             <Button variant="ghost" className="w-full">
                                <ListChecks className="mr-2 h-4 w-4" />
                                Ver Checklist
                                {isChecklistOpen ? <ChevronUp className="ml-2 h-4 w-4"/> : <ChevronDown className="ml-2 h-4 w-4"/>}
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-4 space-y-2">
                           {goal.milestones.map((milestone) => (
                               <div key={milestone.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                   <div className="flex items-center gap-3">
                                       <Checkbox id={`ms-${milestone.id}`} checked={milestone.completed} onCheckedChange={() => onToggleMilestone(goal.id, milestone.id)}/>
                                       <Label htmlFor={`ms-${milestone.id}`} className={cn(milestone.completed && 'line-through text-muted-foreground')}>{milestone.name}</Label>
                                   </div>
                                   {milestone.cost > 0 && <Badge variant="outline">{formatCurrency(milestone.cost)}</Badge>}
                               </div>
                           ))}
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </CardFooter>
        </Card>
    )
}


export default function GoalsPage() {
  const { isLoading, goals, addGoal, updateGoal, deleteGoal, formatCurrency, toggleGoalCompleted, toggleMilestoneCompleted, addGoalProgress } = useContext(FinanceContext);
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [isAddProgressDialogOpen, setIsAddProgressDialogOpen] = useState(false);

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [goalForProgress, setGoalForProgress] = useState<Goal | null>(null);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const openAddDialog = () => {
    setEditingGoal(null);
    setIsAddGoalDialogOpen(true);
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setIsAddGoalDialogOpen(true);
  };

  const handleSaveGoal = (data: Omit<Goal, 'id' | 'completed'>, milestones: Omit<Milestone, 'id' | 'completed'>[]) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, data, milestones);
    } else {
      addGoal(data, milestones);
    }
    setIsAddGoalDialogOpen(false);
    setEditingGoal(null);
  };

  const handleDelete = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete.id);
      setGoalToDelete(null);
    }
  };
  
  const handleToggleCompleted = (goal: Goal) => {
    if (!goal.completed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
    }
    toggleGoalCompleted(goal.id);
  }
  
  const handleAddProgress = (goal: Goal) => {
      setGoalForProgress(goal);
      setIsAddProgressDialogOpen(true);
  }

  const handleSaveProgress = (amount: number, accountId: string) => {
    if (goalForProgress) {
        addGoalProgress(goalForProgress.id, amount, accountId);
    }
    setGoalForProgress(null);
    setIsAddProgressDialogOpen(false);
  };
  
  const pendingGoals = useMemo(() => goals.filter(g => !g.completed).sort((a,b) => b.targetAmount - a.targetAmount), [goals]);
  const completedGoals = useMemo(() => goals.filter(g => g.completed).sort((a,b) => b.targetAmount - a.targetAmount), [goals]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}
      <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Metas do Casal</h1>
                <p className="text-muted-foreground">Planejem e acompanhem o progresso dos seus grandes objetivos.</p>
              </div>
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Meta
              </Button>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Metas Atuais
              </h2>
              {pendingGoals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingGoals.map(goal => (
                    <GoalCard 
                        key={goal.id} 
                        goal={goal}
                        onEdit={openEditDialog}
                        onToggleCompleted={handleToggleCompleted}
                        onDelete={setGoalToDelete}
                        onToggleMilestone={toggleMilestoneCompleted}
                        onAddProgress={handleAddProgress}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                  <h3 className="mt-4 text-lg font-medium">Nenhuma meta definida.</h3>
                  <p className="mt-1 text-sm">Adicione um novo objetivo que vocês gostariam de alcançar!</p>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Metas Concluídas
              </h2>
              {completedGoals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedGoals.map(goal => (
                     <Card key={goal.id} className="relative bg-transparent overflow-hidden">
                          <Image
                              src={goal.imageUrl || "https://placehold.co/600x400.png"}
                              alt={goal.name}
                              width={600}
                              height={400}
                              className="w-full h-48 object-cover rounded-lg brightness-50"
                              data-ai-hint="celebration achievement"
                          />
                          <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                              <div>
                                  <h3 className="text-lg font-bold">{goal.name}</h3>
                                  <p className="font-mono text-sm">{formatCurrency(goal.targetAmount)}</p>
                              </div>
                              <Badge variant="secondary" className="w-fit bg-green-500/80 text-white border-0">
                                  Concluído!
                              </Badge>
                          </div>
                          <div className="absolute top-2 right-2">
                              <Button variant="ghost" size="icon" onClick={() => setGoalToDelete(goal)} className="text-white hover:bg-black/50 hover:text-white">
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                      </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                  <h3 className="mt-4 text-lg font-medium">Nenhuma meta concluída ainda.</h3>
                  <p className="mt-1 text-sm">Quando finalizarem uma meta, ela aparecerá aqui.</p>
                </div>
              )}
            </div>

            <AddGoalDialog
              isOpen={isAddGoalDialogOpen}
              onClose={() => { setIsAddGoalDialogOpen(false); setEditingGoal(null); }}
              onSave={handleSaveGoal}
              goal={editingGoal}
            />

            {goalForProgress && (
                <AddGoalProgressDialog 
                    isOpen={isAddProgressDialogOpen}
                    onClose={() => setIsAddProgressDialogOpen(false)}
                    onSave={handleSaveProgress}
                    goal={goalForProgress}
                />
            )}
            
            <AlertDialog open={!!goalToDelete} onOpenChange={(open) => !open ? setGoalToDelete(null) : null}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso irá excluir permanentemente a meta
                    <span className="font-semibold"> "{goalToDelete?.name}"</span>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setGoalToDelete(null)}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Sim, excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
