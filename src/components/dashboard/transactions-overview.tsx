
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Car,
  Utensils,
  Home,
  HeartPulse,
  MoreHorizontal,
  Wallet,
  Landmark,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { useContext } from "react";
import { FinanceContext } from "@/contexts/finance-context";
import Link from "next/link";

const categoryIcons: { [key: string]: React.ReactNode } = {
  'Alimentação': <Utensils className="h-5 w-5" />,
  'Transporte': <Car className="h-5 w-5" />,
  'Moradia': <Home className="h-5 w-5" />,
  'Saúde': <HeartPulse className="h-5 w-5" />,
  'Salário': <Landmark className="h-5 w-5" />,
  'Investimentos': <Wallet className="h-5 w-5" />,
  'Outros': <MoreHorizontal className="h-5 w-5" />,
};

const getIconForCategory = (category: string) => {
    return categoryIcons[category] || <MoreHorizontal className="h-5 w-5" />;
}


export function TransactionsOverview() {
  const { transactions } = useContext(FinanceContext);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
        <CardDescription>
          Suas últimas 5 movimentações.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {recentTransactions.map((transaction) => (
            <Link href="/finance" key={transaction.id} className="block rounded-lg -mx-2 px-2 py-2 hover:bg-muted">
                <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                    {getIconForCategory(transaction.category)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-medium">
                        {transaction.description}
                        {transaction.totalInstallments && ` (${transaction.currentInstallment}/${transaction.totalInstallments})`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {transaction.category}
                    </p>
                </div>
                <Badge
                    variant={transaction.type === "income" ? "default" : "secondary"}
                    className={
                    transaction.type === 'income'
                        ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50 font-semibold'
                        : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50 font-semibold'
                    }
                >
                    {transaction.amount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    })}
                </Badge>
                </div>
            </Link>
          ))}
           {recentTransactions.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    Nenhuma transação recente.
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
