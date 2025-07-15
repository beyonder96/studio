
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  AccordionItem,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateListDialog } from '@/components/purchases/create-list-dialog';
import { 
    Plus, 
    Sparkles, 
    ShoppingCart, 
    Users, 
    MoreHorizontal, 
    ListPlus, 
    Search,
    Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  shared: boolean;
};

const initialShoppingLists: ShoppingList[] = [
    {
        id: 'list1',
        name: 'Mercado',
        shared: true,
        items: [
            { id: 'item1', name: 'Leite Integral', quantity: 6, checked: false },
            { id: 'item2', name: 'Pão de Forma', quantity: 2, checked: false },
            { id: 'item3', name: 'Dúzia de Ovos', quantity: 2, checked: false },
            { id: 'item4', name: 'Queijo Mussarela (kg)', quantity: 1, checked: false },
            { id: 'item5', name: 'Peito de Frango (kg)', quantity: 3, checked: false },
        ]
    },
    {
        id: 'list2',
        name: 'Farmácia',
        shared: false,
        items: [
             { id: 'item6', name: 'Vitamina C', quantity: 1, checked: false },
             { id: 'item7', name: 'Pasta de dente', quantity: 2, checked: true },
             { id: 'item8', name: 'Fio dental', quantity: 3, checked: false },
        ]
    }
];

export default function PurchasesPage() {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>(initialShoppingLists);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(initialShoppingLists[0] || null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const addShoppingList = (newList: Omit<ShoppingList, 'id'>) => {
    const listToAdd = { ...newList, id: crypto.randomUUID() };
    setShoppingLists(prev => [...prev, listToAdd]);
    setSelectedList(listToAdd); // Select the new list
  };

  const deleteShoppingList = (listId: string) => {
    setShoppingLists(prev => {
        const remainingLists = prev.filter(list => list.id !== listId);
        if (selectedList?.id === listId) {
            setSelectedList(remainingLists[0] || null);
        }
        return remainingLists;
    });
  }
  
  const toggleItemChecked = (listId: string, itemId: string) => {
    const newLists = shoppingLists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map(item => 
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        };
      }
      return list;
    });
    setShoppingLists(newLists);
    
    // Update selectedList if it's the one being changed
    if (selectedList && selectedList.id === listId) {
        setSelectedList(newLists.find(l => l.id === listId) || null);
    }
  };
  
  const getProgress = (list: ShoppingList) => {
    if (list.items.length === 0) return 0;
    const checkedItems = list.items.filter(item => item.checked).length;
    return Math.round((checkedItems / list.items.length) * 100);
  }
  
  const getCheckedCount = (list: ShoppingList) => {
      return list.items.filter(item => item.checked).length;
  }

  return (
    <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">Listas de Compras</h1>
                <p className="text-muted-foreground">Organize suas compras com a ajuda da IA</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Nova Lista
            </Button>
        </div>
        
        {/* AI Assistant */}
         <Accordion type="single" collapsible>
            <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className="bg-muted hover:no-underline rounded-lg p-4 font-normal text-base">
                     <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-primary"/>
                        <div>
                            <p className="font-semibold">Assistente IA de Compras</p>
                            <p className="text-sm text-muted-foreground text-left">Peça receitas ou sugestões de itens</p>
                        </div>
                     </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-muted rounded-b-lg -mt-2">
                    Em breve você poderá pedir receitas e criar listas a partir delas!
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        {/* My Lists Section */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <ShoppingCart className="h-5 w-5"/>
                    Suas Listas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {shoppingLists.map(list => (
                    <div
                        key={list.id}
                        onClick={() => setSelectedList(list)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedList?.id === list.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                    >
                        <div>
                            <p className="font-semibold">{list.name}</p>
                            <p className={`text-sm ${selectedList?.id === list.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{list.items.length} itens</p>
                        </div>
                        <div className="flex items-center gap-2">
                           {list.shared && <Users className="h-5 w-5" />}
                           <Button variant="ghost" size="icon" className={`hover:bg-black/10 ${selectedList?.id === list.id ? 'text-primary-foreground' : ''}`}>
                             <MoreHorizontal className="h-5 w-5" />
                           </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>

        {/* Selected List Details */}
        {selectedList ? (
            <Card className="bg-muted">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold">{selectedList.name}</h2>
                        {selectedList.shared && <Badge variant="secondary" className="font-normal"><Users className="mr-1.5 h-3 w-3"/>Compartilhada</Badge>}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Button variant="ghost" size="icon" className="border rounded-full bg-background"><ListPlus className="h-5 w-5"/></Button>
                        <Button variant="outline" className="bg-background"><Plus className="mr-2 h-4 w-4"/> Adicionar Item</Button>
                    </div>
                </CardHeader>
                <CardContent>
                     <p className="text-sm text-muted-foreground mb-4">
                        {getCheckedCount(selectedList)} de {selectedList.items.length} itens concluídos ({getProgress(selectedList)}%)
                     </p>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input placeholder="Buscar itens..." className="pl-9 bg-background"/>
                    </div>

                    <Tabs defaultValue="all">
                        <TabsList className="grid w-full grid-cols-3 bg-background">
                            <TabsTrigger value="all">Todos</TabsTrigger>
                            <TabsTrigger value="pending">Pendentes</TabsTrigger>
                            <TabsTrigger value="completed">Concluídos</TabsTrigger>
                        </TabsList>
                        
                        <div className="mt-4 space-y-3">
                           {selectedList.items.map(item => (
                               <div key={item.id} className="flex items-center space-x-3 p-3 bg-background rounded-lg">
                                    <Checkbox 
                                        id={`${selectedList.id}-${item.id}`} 
                                        checked={item.checked} 
                                        onCheckedChange={() => toggleItemChecked(selectedList.id, item.id)}
                                    />
                                    <Label
                                        htmlFor={`${selectedList.id}-${item.id}`}
                                        className={`flex-1 text-sm ${
                                        item.checked ? "text-muted-foreground line-through" : ""
                                        }`}
                                    >
                                        {item.quantity}x {item.name}
                                    </Label>
                                     <Button variant="ghost" size="icon" onClick={() => {}} className="text-muted-foreground">
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                               </div>
                           ))}
                        </div>

                    </Tabs>
                </CardContent>
            </Card>
        ) : (
             <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Nenhuma lista selecionada</h3>
                <p className="mt-1 text-sm">Selecione uma lista acima ou crie uma nova.</p>
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

