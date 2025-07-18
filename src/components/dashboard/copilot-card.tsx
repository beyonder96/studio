
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { useContext, useMemo, useState, useEffect } from "react";
import { FinanceContext } from "@/contexts/finance-context";
import Link from "next/link";

type Insight = {
  text: string;
  link: string;
  buttonText: string;
};

export function CopilotCard() {
  const { pantryItems, tasks, wishes } = useContext(FinanceContext);
  const [currentInsight, setCurrentInsight] = useState<Insight | null>(null);

  useEffect(() => {
    const potentialInsights: Insight[] = [];

    // Pantry Insight
    const lowStockItem = pantryItems.find(item => item.quantity <= 2);
    if (lowStockItem) {
      potentialInsights.push({
        text: `Você tem pouco ${lowStockItem.name.toLowerCase()} na despensa. Que tal adicionar na sua lista de compras?`,
        link: '/purchases',
        buttonText: 'Ir para Compras'
      });
    }

    // Tasks Insight
    const pendingTask = tasks.find(task => !task.completed);
    if (pendingTask) {
        potentialInsights.push({
            text: `Não se esqueça da sua tarefa pendente: "${pendingTask.text}".`,
            link: '/tasks',
            buttonText: 'Ver Tarefas'
        });
    }

    // Wishes Insight
    const nextWish = wishes.find(wish => !wish.purchased);
    if (nextWish) {
        potentialInsights.push({
            text: `Continuem economizando para a próxima meta de vocês: ${nextWish.name}!`,
            link: '/wishes',
            buttonText: 'Ver Desejos'
        });
    }
    
    // Default Financial Insight
    potentialInsights.push({
      text: "Você gastou 15% a mais em restaurantes este mês. Que tal tentar cozinhar em casa para economizar?",
      link: '/finance',
      buttonText: 'Ver Finanças'
    });
    
    // Choose one insight randomly to display
    const randomIndex = Math.floor(Math.random() * potentialInsights.length);
    setCurrentInsight(potentialInsights[randomIndex]);

  }, [pantryItems, tasks, wishes]);

  if (!currentInsight) {
    return (
        <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="text-base font-semibold text-primary">
                    Copilot
                </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-foreground/80">
                    Analisando seus dados...
                </p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <CardTitle className="text-base font-semibold text-primary">
            Copilot
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-foreground/80">
          {currentInsight.text}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full bg-transparent border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
          <Link href={currentInsight.link}>
            {currentInsight.buttonText} <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
