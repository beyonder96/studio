
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useContext, useState, useEffect } from "react";
import { FinanceContext } from "@/contexts/finance-context";
import { cn } from "@/lib/utils";

export function TasksOverview() {
  const { tasks, toggleTask } = useContext(FinanceContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 4); // Show up to 4 pending tasks

  const handleCheckboxClick = (e: React.MouseEvent<HTMLButtonElement>, taskId: string) => {
    e.preventDefault(); // Impede que o clique no checkbox acione o link do card
    e.stopPropagation();
    toggleTask(taskId);
  }

  return (
    <Link href="/tasks" className="block">
        <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none h-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors">
        <CardHeader>
            <CardTitle>Tarefas Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
            {!isClient ? (
                <div className="text-center text-muted-foreground py-4">
                     <p className="text-sm">Carregando tarefas...</p>
                </div>
            ) : pendingTasks.length > 0 ? (
            <div className="space-y-4">
                {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3">
                    <Checkbox 
                    id={`dashboard-task-${task.id}`} 
                    checked={task.completed} 
                    onClick={(e) => handleCheckboxClick(e, task.id)}
                    />
                    <Label
                    htmlFor={`dashboard-task-${task.id}`}
                    className={cn(
                        "flex-1 text-sm",
                        task.completed ? "text-muted-foreground line-through" : ""
                    )}
                    >
                    {task.text}
                    </Label>
                </div>
                ))}
            </div>
            ) : (
            <div className="text-center text-muted-foreground py-4">
                <p className="text-sm">Nenhuma tarefa pendente.</p>
                <p className="text-xs">Vocês estão em dia!</p>
            </div>
            )}
        </CardContent>
        </Card>
    </Link>
  );
}
