
'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useContext } from "react";
import { FinanceContext } from "@/contexts/finance-context";

type SummaryCardProps = {
  type: "income" | "expenses";
};

export function SummaryCard({ type }: SummaryCardProps) {
  const { totalIncome, totalExpenses } = useContext(FinanceContext);
  const isIncome = type === "income";

  const title = isIncome ? "Receitas no Mês" : "Despesas no Mês";
  const amount = isIncome ? totalIncome() : totalExpenses();
  const icon = isIncome ? (
    <ArrowUpCircle className="h-5 w-5 text-muted-foreground" />
  ) : (
    <ArrowDownCircle className="h-5 w-5 text-muted-foreground" />
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
            </CardTitle>
            <div className="rounded-full bg-gray-100 p-2">
              {icon}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <span className="block text-3xl font-bold tracking-tight">
          {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </CardContent>
    </Card>
  );
}
