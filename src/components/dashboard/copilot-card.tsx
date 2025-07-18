
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { useContext, useMemo } from "react";
import { FinanceContext } from "@/contexts/finance-context";
import Link from "next/link";

export function CopilotCard() {
  const { pantryItems } = useContext(FinanceContext);

  const copilotInsight = useMemo(() => {
    const lowStockItem = pantryItems.find(item => item.quantity <= 2);

    if (lowStockItem) {
      return {
        text: `Você tem pouco ${lowStockItem.name.toLowerCase()} na despensa. Que tal adicionar na sua lista de compras?`,
        link: '/purchases',
        buttonText: 'Ir para Compras'
      };
    }

    return {
      text: "Você gastou 15% a mais em restaurantes este mês. Que tal tentar cozinhar em casa para economizar?",
      link: '/finance',
      buttonText: 'Ver Insights'
    };
  }, [pantryItems]);

  return (
    <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <CardTitle className="text-base font-semibold text-primary">
            Copiloto Financeiro
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-foreground/80">
          {copilotInsight.text}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full bg-transparent border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
          <Link href={copilotInsight.link}>
            {copilotInsight.buttonText} <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
