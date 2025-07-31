
'use client';

import { useState, useContext, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Edit, CheckCircle2, Target, MoreVertical, Star, Trophy } from 'lucide-react';
import { FinanceContext, Goal } from '@/contexts/finance-context';
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

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, formatCurrency, toggleGoalCompleted } = useContext(FinanceContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
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
    setIsDialogOpen(true);
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setIsDialogOpen(true);
  };

  const handleSaveGoal = (data: Omit<Goal, 'id' | 'completed'>) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, data);
    } else {
      addGoal(data);
    }
    setIsDialogOpen(false);
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
  
  const getProgressPercentage = (goal: Goal) => {
    if (goal.completed) return 100;
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;
    return (goal.currentAmount / goal.targetAmount) * 100;
  }
  
  const pendingGoals = useMemo(() => goals.filter(g => !g.completed), [goals]);
  const completedGoals = useMemo(() => goals.filter(g => g.completed), [goals]);

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
                    <Card key={goal.id} className="flex flex-col card-hover-effect bg-transparent">
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
                              <DropdownMenuItem onClick={() => openEditDialog(goal)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleCompleted(goal)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Marcar como concluída
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => setGoalToDelete(goal)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 flex-grow flex flex-col">
                        <CardTitle className="text-lg mb-2">{goal.name}</CardTitle>
                        <div className="flex-grow space-y-2">
                            <Progress value={getProgressPercentage(goal)} />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{formatCurrency(goal.currentAmount)}</span>
                              <span className="font-semibold">{formatCurrency(goal.targetAmount)}</span>
                            </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                         <Badge variant="secondary" className="font-normal w-full justify-center">
                            {Math.round(getProgressPercentage(goal))}% completo
                          </Badge>
                      </CardFooter>
                    </Card>
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
              isOpen={isDialogOpen}
              onClose={() => { setIsDialogOpen(false); setEditingGoal(null); }}
              onSave={handleSaveGoal}
              goal={editingGoal}
            />
            
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
