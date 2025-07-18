
'use client';

import { useState, useContext, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2 } from 'lucide-react';
import { FinanceContext } from '@/contexts/finance-context';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import Confetti from 'react-confetti';

export default function TasksPage() {
  const { tasks, addTask, toggleTask, deleteTask } = useContext(FinanceContext);
  const [newTaskText, setNewTaskText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    if (typeof window !== 'undefined') {
      handleResize(); // Set initial size
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      addTask(newTaskText.trim());
      setNewTaskText('');
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddTask();
    }
  };
  
  const handleToggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      // If task is about to be completed, show confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
    }
    toggleTask(taskId);
  };


  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <>
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />}
      <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
          <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-6">
              <div>
                  <h1 className="text-3xl font-bold">Tarefas do Casal</h1>
                  <p className="text-muted-foreground">Mantenham tudo organizado e em dia.</p>
              </div>

              <Card className="bg-transparent">
                  <CardHeader>
                  <CardTitle>Adicionar Nova Tarefa</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                  <Input
                      placeholder="O que precisa ser feito?"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={handleKeyDown}
                  />
                  <Button onClick={handleAddTask}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar
                  </Button>
                  </CardContent>
              </Card>

              <Card className="bg-transparent">
                  <CardHeader>
                  <CardTitle>Progresso</CardTitle>
                  <CardDescription>
                      {completedTasks} de {totalTasks} tarefas concluídas.
                  </CardDescription>
                  </CardHeader>
                  <CardContent>
                  <Progress value={progressPercentage} className="h-4"/>
                  </CardContent>
              </Card>
              
              <div className="space-y-3">
                  <AnimatePresence>
                  {tasks.length > 0 ? (
                  tasks.map(task => (
                      <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                          layout
                      >
                          <Card className={cn("p-4 transition-colors bg-transparent", task.completed && "bg-muted/50")}>
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                              <Checkbox
                                  id={`task-${task.id}`}
                                  checked={task.completed}
                                  onCheckedChange={() => handleToggleTask(task.id)}
                                  className="h-5 w-5"
                              />
                              <Label
                                  htmlFor={`task-${task.id}`}
                                  className={cn(
                                  "text-base",
                                  task.completed && "text-muted-foreground line-through"
                                  )}
                              >
                                  {task.text}
                              </Label>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                          </Card>
                      </motion.div>
                  ))
                  ) : (
                  <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                      <h3 className="mt-4 text-lg font-medium">Nenhuma tarefa por aqui!</h3>
                      <p className="mt-1 text-sm">Adicione uma nova tarefa para começar.</p>
                  </div>
                  )}
                  </AnimatePresence>
              </div>
              </div>
          </CardContent>
      </Card>
    </>
  );
}
