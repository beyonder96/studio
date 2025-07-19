
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useContext, useState, useEffect } from "react";
import { FinanceContext } from "@/contexts/finance-context";
import { ShoppingBasket } from 'lucide-react';

export function ShoppingListOverview() {
  const { shoppingLists } = useContext(FinanceContext);
  const listsToDisplay = shoppingLists.slice(0, 3); // Show up to 3 lists
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getProgress = (list: { items: { checked: boolean }[] }) => {
    if (!list || list.items.length === 0) return 0;
    const checkedItems = list.items.filter(item => item.checked).length;
    return Math.round((checkedItems / list.items.length) * 100);
  };

  return (
    <Link href="/purchases" className="block">
        <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none h-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingBasket className="h-5 w-5" />
                    Listas de Compras
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!isClient ? (
                    <div className="text-center text-muted-foreground py-4">
                        <p className="text-sm">Carregando listas...</p>
                    </div>
                ) : listsToDisplay.length > 0 ? (
                    <div className="space-y-4">
                        {listsToDisplay.map((list) => {
                            const progress = getProgress(list);
                            const checkedCount = list.items.filter(i => i.checked).length;
                            return (
                                <div key={list.id}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">{list.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {checkedCount}/{list.items.length}
                                        </span>
                                    </div>
                                    <Progress value={progress} />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-4">
                        <p className="text-sm">Nenhuma lista de compras.</p>
                        <p className="text-xs">Crie uma na página de Compras!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </Link>
  );
}
