
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { PlusCircle, ShoppingCart, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CreateListDialog } from '@/components/purchases/create-list-dialog';

export type ShoppingListItem = {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
};

export type ShoppingList = {
  id: string;
  name: string;
  items: ShoppingListItem[];
};

const initialShoppingLists: ShoppingList[] = [
    {
        id: 'list1',
        name: 'Supermercado - Mês',
        items: [
            { id: 'item1', name: 'Leite Integral', quantity: 6, checked: true },
            { id: 'item2', name: 'Pão de Forma', quantity: 2, checked: false },
            { id: 'item3', name: 'Dúzia de Ovos', quantity: 2, checked: false },
            { id: 'item4', name: 'Queijo Mussarela (kg)', quantity: 1, checked: true },
            { id: 'item5', name: 'Peito de Frango (kg)', quantity: 3, checked: false },
        ]
    },
    {
        id: 'list2',
        name: 'Farmácia',
        items: [
             { id: 'item6', name: 'Vitamina C', quantity: 1, checked: false },
             { id: 'item7', name: 'Pasta de dente', quantity: 2, checked: true },
             { id: 'item8', name: 'Fio dental', quantity: 3, checked: false },
        ]
    }
];

export default function PurchasesPage() {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>(initialShoppingLists);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const addShoppingList = (newList: Omit<ShoppingList, 'id'>) => {
    setShoppingLists(prev => [...prev, { ...newList, id: crypto.randomUUID() }]);
  };

  const deleteShoppingList = (listId: string) => {
    setShoppingLists(prev => prev.filter(list => list.id !== listId));
  }
  
  const toggleItemChecked = (listId: string, itemId: string) => {
    setShoppingLists(prevLists => 
        prevLists.map(list => {
            if (list.id === listId) {
                return {
                    ...list,
                    items: list.items.map(item => 
                        item.id === itemId ? { ...item, checked: !item.checked } : item
                    )
                };
            }
            return list;
        })
    );
  };
  
  const getProgress = (list: ShoppingList) => {
    if (list.items.length === 0) return 0;
    const checkedItems = list.items.filter(item => item.checked).length;
    return Math.round((checkedItems / list.items.length) * 100);
  }

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Listas de Compras</h1>
            <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Nova Lista
            </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shoppingLists.map(list => (
                <Card key={list.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{list.name}</CardTitle>
                             <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteShoppingList(list.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardDescription>
                            {list.items.filter(i => i.checked).length} de {list.items.length} itens comprados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3">
                        {list.items.slice(0, 5).map(item => (
                             <div key={item.id} className="flex items-center space-x-3">
                                <Checkbox 
                                    id={`${list.id}-${item.id}`} 
                                    checked={item.checked} 
                                    onCheckedChange={() => toggleItemChecked(list.id, item.id)}
                                />
                                <Label
                                    htmlFor={`${list.id}-${item.id}`}
                                    className={`flex-1 text-sm ${
                                    item.checked ? "text-muted-foreground line-through" : ""
                                    }`}
                                >
                                    {item.quantity}x {item.name}
                                </Label>
                            </div>
                        ))}
                        {list.items.length > 5 && (
                            <p className="text-sm text-muted-foreground">+ {list.items.length - 5} outros itens...</p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <div className="w-full">
                           <div className="flex justify-between text-sm text-muted-foreground mb-1">
                               <span>Progresso</span>
                               <span>{getProgress(list)}%</span>
                           </div>
                           <div className="w-full bg-muted rounded-full h-2.5">
                                <div 
                                    className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                                    style={{ width: `${getProgress(list)}%` }}
                                ></div>
                           </div>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
        
        {shoppingLists.length === 0 && (
            <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Nenhuma lista de compras</h3>
                <p className="mt-1 text-sm">Comece criando sua primeira lista.</p>
            </div>
        )}

        <CreateListDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSave={addShoppingList}
        />
    </div>
  );
}
