
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Carrot, Milk, Beef } from 'lucide-react';
import { useContext } from "react";
import { FinanceContext, PantryCategory } from "@/contexts/finance-context";
import { cn } from "@/lib/utils";

const categoryIcons: { [key in PantryCategory]: React.ReactNode } = {
  'Laticínios': <Milk className="h-4 w-4" />,
  'Carnes': <Beef className="h-4 w-4" />,
  'Peixes': <Carrot className="h-4 w-4" />, // Placeholder
  'Frutas e Vegetais': <Carrot className="h-4 w-4" />,
  'Outros': <Carrot className="h-4 w-4" />,
};


export function PantryOverview() {
  const { pantryItems } = useContext(FinanceContext);
  const itemsToDisplay = pantryItems.slice(0, 4); // Show up to 4 items

  return (
    <Link href="/pantry" className="block">
        <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none h-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Carrot className="h-5 w-5" />
                    Despensa
                </CardTitle>
            </CardHeader>
            <CardContent>
                {itemsToDisplay.length > 0 ? (
                    <div className="space-y-3">
                        {itemsToDisplay.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                               <div className="flex items-center gap-2">
                                    <div className="text-muted-foreground">
                                        {categoryIcons[item.pantryCategory] || categoryIcons['Outros']}
                                    </div>
                                    <span>{item.name}</span>
                               </div>
                               <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded-md">{item.quantity}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-4">
                        <p className="text-sm">Sua despensa está vazia.</p>
                        <p className="text-xs">Finalize uma compra para adicionar itens.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </Link>
  );
}
