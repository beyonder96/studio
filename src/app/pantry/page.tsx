
'use client';

import { useContext, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinanceContext, PantryCategory, PantryItem as PantryItemType } from '@/contexts/finance-context';
import { Apple, Beef, Carrot, ChevronsRight, Fish, Milk, MoreHorizontal, Plus, Minus, Package, Soup, GlassWater, SparklesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddPantryItemDialog } from '@/components/pantry/add-pantry-item-dialog';

const categoryIcons: { [key: string]: React.ReactNode } = {
  'Laticínios': <Milk className="h-6 w-6 text-muted-foreground" />,
  'Carnes': <Beef className="h-6 w-6 text-muted-foreground" />,
  'Peixes': <Fish className="h-6 w-6 text-muted-foreground" />,
  'Frutas e Vegetais': <Carrot className="h-6 w-6 text-muted-foreground" />,
  'Grãos e Cereais': <Package className="h-6 w-6 text-muted-foreground" />,
  'Enlatados e Conservas': <Soup className="h-6 w-6 text-muted-foreground" />,
  'Bebidas': <GlassWater className="h-6 w-6 text-muted-foreground" />,
  'Higiene e Limpeza': <SparklesIcon className="h-6 w-6 text-muted-foreground" />,
  'Outros': <MoreHorizontal className="h-6 w-6 text-muted-foreground" />,
};

const getIconForCategory = (categoryName: string): React.ReactNode => {
    return categoryIcons[categoryName] || <MoreHorizontal className="h-6 w-6 text-muted-foreground" />;
}

export default function PantryPage() {
  const { pantryItems, updatePantryItemQuantity, pantryCategories, addItemToPantry } = useContext(FinanceContext);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);

  const categorizedItems = pantryItems.reduce((acc, item) => {
    const category = item.pantryCategory || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, PantryItemType[]>);
  
  const sortedCategories = Object.keys(categorizedItems).sort((a, b) => {
    // Keep 'Outros' at the end
    if (a === 'Outros') return 1;
    if (b === 'Outros') return -1;
    return a.localeCompare(b);
  });

  const hasItems = pantryItems.length > 0;

  const handleSaveItem = (data: { name: string; quantity: number; category: string; }) => {
    addItemToPantry(data.name, data.quantity, data.category);
    setIsAddItemDialogOpen(false);
  };

  return (
    <>
        <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Despensa</h1>
                        <p className="text-muted-foreground">O que você tem guardado em casa.</p>
                    </div>
                    <Button onClick={() => setIsAddItemDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Item
                    </Button>
                </div>

                {hasItems ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sortedCategories.map((category) => (
                        <Card key={category} className="bg-transparent">
                        <CardHeader className="flex flex-row items-center gap-4">
                            {getIconForCategory(category)}
                            <CardTitle>{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                            {categorizedItems[category].map((item) => (
                                <li key={item.id} className="flex items-center justify-between">
                                <span>{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updatePantryItemQuantity(item.id, item.quantity - 1)}>
                                    <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="font-mono text-sm font-semibold bg-muted px-3 py-1 rounded-md">{item.quantity}</span>
                                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updatePantryItemQuantity(item.id, item.quantity + 1)}>
                                    <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
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
                        <p className="mt-1 text-sm">Adicione itens manualmente ou finalize uma lista de compras.</p>
                    </div>
                )}
                </div>
            </CardContent>
        </Card>
        <AddPantryItemDialog
            isOpen={isAddItemDialogOpen}
            onClose={() => setIsAddItemDialogOpen(false)}
            onSave={handleSaveItem}
            categories={pantryCategories}
        />
    </>
  );
}
