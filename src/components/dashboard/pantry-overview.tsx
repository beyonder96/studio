
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShoppingBasket, Milk, Beef, Carrot, Fish, MoreHorizontal } from 'lucide-react';
import { useContext } from "react";
import { FinanceContext } from "@/contexts/finance-context";
import { cn } from "@/lib/utils";


export function PantryOverview() {
  const { shoppingLists } = useContext(FinanceContext);
  
  // Get pending items from the first shopping list
  const firstList = shoppingLists[0];
  const itemsToDisplay = firstList ? firstList.items.filter(item => !item.checked).slice(0, 4) : [];

  return (
    <Link href="/purchases" className="block">
        <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none h-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingBasket className="h-5 w-5" />
                    Prioridade de Compra
                </CardTitle>
            </CardHeader>
            <CardContent>
                {itemsToDisplay.length > 0 ? (
                    <div className="space-y-3">
                        {itemsToDisplay.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                               <div className="flex items-center gap-2">
                                    <span>{item.name}</span>
                               </div>
                               <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded-md">{item.quantity}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-4">
                        <p className="text-sm">Nenhum item pendente.</p>
                        <p className="text-xs">Sua lista de compras está em dia!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </Link>
  );
}
