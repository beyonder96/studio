
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
import { useContext, useEffect, useState } from "react";
import { FinanceContext } from "@/contexts/finance-context";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";


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
  const { transactions, formatCurrency, isSensitiveDataVisible } = useContext(FinanceContext);
  const { loading: authLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Sort transactions by date descending and take the first 5
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const renderSkeletons = () => (
    <div className="space-y-1">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4 rounded-full" />
            <Skeleton className="h-3 w-1/2 rounded-full" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );

  return (
    <Card className="h-full bg-white/10 dark:bg-black/10 border-none shadow-none flex-grow">
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {!isClient || authLoading ? renderSkeletons() : (
            <div className="space-y-1">
            {recentTransactions.length > 0 ? recentTransactions.map((transaction) => (
                <Link key={transaction.id} href={`/finance?edit=${transaction.id}`} className="block rounded-lg -mx-2 px-2 py-3 hover:bg-white/20 dark:hover:bg-black/20" scroll={false}>
                    <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/20 text-primary">
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
                    {isSensitiveDataVisible ? (
                    <p
                        className={cn(
                            'font-mono text-sm font-medium',
                            transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                        )}
                    >
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount, true)}
                    </p>
                    ) : (
                    <Skeleton className="h-6 w-24 rounded-full" />
                    )}
                    </div>
                </Link>
            )) : (
                    <div className="text-center text-muted-foreground py-8">
                        Nenhuma transação recente.
                    </div>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
