
'use client';

import { useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinanceContext, PantryCategory } from '@/contexts/finance-context';
import { Apple, Beef, Carrot, ChevronsRight, Fish, Milk, MoreHorizontal } from 'lucide-react';

const categoryIcons: { [key in PantryCategory]: React.ReactNode } = {
  'Laticínios': <Milk className="h-6 w-6 text-muted-foreground" />,
  'Carnes': <Beef className="h-6 w-6 text-muted-foreground" />,
  'Peixes': <Fish className="h-6 w-6 text-muted-foreground" />,
  'Frutas e Vegetais': <Carrot className="h-6 w-6 text-muted-foreground" />,
  'Outros': <MoreHorizontal className="h-6 w-6 text-muted-foreground" />,
};

export default function PantryPage() {
  const { pantryItems } = useContext(FinanceContext);

  const categorizedItems = pantryItems.reduce((acc, item) => {
    const category = item.pantryCategory || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<PantryCategory, typeof pantryItems>);

  const hasItems = pantryItems.length > 0;

  return (
    <div className="flex flex-col gap-6">
       <div>
            <h1 className="text-3xl font-bold">Despensa</h1>
            <p className="text-muted-foreground">O que você tem guardado em casa.</p>
        </div>

      {hasItems ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(categorizedItems) as PantryCategory[]).map((category) => (
            <Card key={category}>
              <CardHeader className="flex flex-row items-center gap-4">
                {categoryIcons[category]}
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {categorizedItems[category].map((item) => (
                    <li key={item.id} className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <span className="font-mono text-sm font-semibold bg-muted px-2 py-1 rounded-md">{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
            <ChevronsRight className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Sua despensa está vazia</h3>
            <p className="mt-1 text-sm">Finalize uma lista de compras para adicionar itens aqui automaticamente.</p>
        </div>
      )}
    </div>
  );
}
