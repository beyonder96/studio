
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Textarea } from '@/components/ui/textarea';
import { SetPriceDialog } from '@/components/purchases/set-price-dialog';
import { AddItemDialog } from '@/components/purchases/add-item-dialog';
import { 
    Plus, 
    Sparkles, 
    ShoppingCart, 
    Users, 
    MoreHorizontal, 
    ListPlus, 
    Search,
    Trash2,
    DollarSign,
    Pencil,
    Save
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { generateShoppingList } from '@/ai/flows/generate-shopping-list-flow';


export type ShoppingListItem = {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
  price?: number;
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
            { id: 'item1', name: 'Leite Integral', quantity: 6, checked: false, price: 30.00 },
            { id: 'item2', name: 'Pão de Forma', quantity: 2, checked: true, price: 15.50 },
            { id: 'item3', name: 'Dúzia de Ovos', quantity: 2, checked: false },
            { id: 'item4', name: 'Queijo Mussarela (kg)', quantity: 1, checked: true, price: 45.00 },
            { id: 'item5', name: 'Peito de Frango (kg)', quantity: 3, checked: false },
        ]
    },
    {
        id: 'list2',
        name: 'Farmácia',
        shared: false,
        items: [
             { id: 'item6', name: 'Vitamina C', quantity: 1, checked: false },
             { id: 'item7', name: 'Pasta de dente', quantity: 2, checked: true, price: 8.90 },
             { id: 'item8', name: 'Fio dental', quantity: 3, checked: false },
        ]
    }
];

export default function PurchasesPage() {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>(initialShoppingLists);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(initialShoppingLists[0] || null);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [itemToPrice, setItemToPrice] = useState<ShoppingListItem | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // State for the new list form
  const [newListName, setNewListName] = useState('');
  const [newListItems, setNewListItems] = useState<Omit<ShoppingListItem, 'id' | 'checked' | 'price'>[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  
  const addShoppingList = (newList: Omit<ShoppingList, 'id'>) => {
    const listToAdd = { ...newList, id: crypto.randomUUID() };
    setShoppingLists(prev => [...prev, listToAdd]);
    setSelectedList(listToAdd);
    // Reset form
    setNewListName('');
    setNewListItems([]);
    setPastedText('');
  };
  
  const handleSetPrice = (itemId: string, price: number) => {
    if (!selectedList) return;

    const newLists = shoppingLists.map(list => {
      if (list.id === selectedList.id) {
        return {
          ...list,
          items: list.items.map(item => 
            item.id === itemId ? { ...item, price: price, checked: true } : item
          )
        };
      }
      return list;
    });
    setShoppingLists(newLists);
    
    // Update selectedList state
    const updatedList = newLists.find(l => l.id === selectedList.id) || null;
    setSelectedList(updatedList);
    
    setItemToPrice(null);
    setIsPriceDialogOpen(false);
  };
  
  const handleCheckboxChange = (item: ShoppingListItem) => {
    if (item.checked) {
      // Uncheck and clear price
      const newLists = shoppingLists.map(list => {
          if (list.id === selectedList?.id) {
              return {
                  ...list,
                  items: list.items.map(i => 
                      i.id === item.id ? { ...i, checked: false, price: undefined } : i
                  )
              };
          }
          return list;
      });
      setShoppingLists(newLists);
      setSelectedList(newLists.find(l => l.id === selectedList?.id) || null);
    } else {
      // Open price dialog to check
      setItemToPrice(item);
      setIsPriceDialogOpen(true);
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
  
  const filteredItems = useMemo(() => {
    if (!selectedList) return [];
    if (activeTab === 'pending') {
      return selectedList.items.filter(item => !item.checked);
    }
    if (activeTab === 'completed') {
      return selectedList.items.filter(item => item.checked);
    }
    return selectedList.items;
  }, [selectedList, activeTab]);
  
  const totalCost = useMemo(() => {
    if (!selectedList) return 0;
    return selectedList.items.reduce((total, item) => {
      return item.checked && item.price ? total + item.price : total;
    }, 0);
  }, [shoppingLists, selectedList]);
  
  // --- New List Logic ---
  const handleGenerateListFromText = async () => {
    if (!pastedText) return;
    setIsGenerating(true);
    try {
      const result = await generateShoppingList({ text: pastedText });
      if (result && result.items) {
        setNewListItems(result.items.map(item => ({name: item.name, quantity: item.quantity})));
      }
    } catch (error) {
      console.error('Error generating shopping list:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSaveNewList = () => {
    if (!newListName || newListItems.length === 0) return;
    addShoppingList({
      name: newListName,
      items: newListItems.map(item => ({...item, id: crypto.randomUUID(), checked: false })),
      shared: false, // Default to not shared
    });
  };
  
  const handleAddItemToList = (name: string, quantity: number) => {
    if (!selectedList) return;

    const newItem: ShoppingListItem = {
        id: crypto.randomUUID(),
        name,
        quantity,
        checked: false,
    };

    const newLists = shoppingLists.map(list => {
        if (list.id === selectedList.id) {
            return {
                ...list,
                items: [...list.items, newItem],
            };
        }
        return list;
    });

    setShoppingLists(newLists);
    setSelectedList(newLists.find(l => l.id === selectedList.id) || null);
    setIsAddItemDialogOpen(false);
  };


  return (
    <div className="flex flex-col gap-6">
        <div>
            <h1 className="text-3xl font-bold">Listas de Compras</h1>
            <p className="text-muted-foreground">Organize suas compras com a ajuda da IA</p>
        </div>
        
         <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
                <AccordionTrigger className="bg-muted hover:no-underline rounded-lg p-4 font-normal text-base [&[data-state=closed]>div>div>svg]:rotate-90">
                     <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            <Plus className="h-5 w-5 text-primary transition-transform duration-300"/>
                            <div>
                                <p className="font-semibold">Criar Nova Lista</p>
                                <p className="text-sm text-muted-foreground text-left">Adicione uma nova lista de compras</p>
                            </div>
                        </div>
                     </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-muted rounded-b-lg -mt-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="list-name">Nome da Lista</Label>
                            <Input
                                id="list-name"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                placeholder="Ex: Supermercado do Mês"
                            />
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="pasted-text">Cole sua lista aqui para a IA organizar</Label>
                            <Textarea
                                id="pasted-text"
                                value={pastedText}
                                onChange={(e) => setPastedText(e.target.value)}
                                placeholder="Ex: 2L de leite, 1 dúzia de ovos, pão de forma"
                                rows={3}
                            />
                            <Button onClick={handleGenerateListFromText} disabled={isGenerating || !pastedText} className="w-full">
                                <Sparkles className="mr-2 h-4 w-4" />
                                {isGenerating ? 'Gerando...' : 'Gerar Itens com IA'}
                            </Button>
                        </div>
                        
                        <div className="space-y-3">
                            <Label>Itens</Label>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 rounded-md bg-background p-3">
                               {newListItems.length > 0 ? (
                                newListItems.map((item, index) => (
                                    <div key={index} className="flex items-center text-sm">
                                        <p><span className="font-semibold">{item.quantity}x</span> {item.name}</p>
                                    </div>
                                ))
                               ) : (
                                <p className="text-sm text-muted-foreground text-center py-2">Os itens gerados pela IA aparecerão aqui.</p>
                               )}
                            </div>
                        </div>
                        <Button onClick={handleSaveNewList} disabled={!newListName || newListItems.length === 0} className="w-full">
                           <Save className="mr-2 h-4 w-4" />
                           Salvar Nova Lista
                        </Button>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

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
                        className={cn(
                            'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                            selectedList?.id === list.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                        )}
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
        
        {totalCost > 0 && (
            <Card>
                <CardHeader className="flex-row items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <DollarSign className="h-6 w-6 text-primary" />
                        <div>
                            <CardTitle className="text-base">Total da Compra</CardTitle>
                            <CardDescription>Valor total dos itens marcados</CardDescription>
                        </div>
                    </div>
                     <p className="text-2xl font-bold text-primary">
                        {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </CardHeader>
            </Card>
        )}


        {selectedList ? (
            <Card className="bg-muted">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold">{selectedList.name}</h2>
                        {selectedList.shared && <Badge variant="secondary" className="font-normal"><Users className="mr-1.5 h-3 w-3"/>Compartilhada</Badge>}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Button onClick={() => setIsAddItemDialogOpen(true)} variant="ghost" size="icon" className="border rounded-full bg-background"><ListPlus className="h-5 w-5"/></Button>
                        <Button onClick={() => setIsAddItemDialogOpen(true)} variant="outline" className="bg-background"><Plus className="mr-2 h-4 w-4"/> Adicionar Item</Button>
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

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3 bg-background">
                            <TabsTrigger value="all">Todos</TabsTrigger>
                            <TabsTrigger value="pending">Pendentes</TabsTrigger>
                            <TabsTrigger value="completed">Concluídos</TabsTrigger>
                        </TabsList>
                        
                        <div className="mt-4 space-y-3">
                           {filteredItems.map(item => (
                               <div key={item.id} className="flex items-center space-x-3 p-3 bg-background rounded-lg">
                                    <Checkbox 
                                        id={`${selectedList.id}-${item.id}`} 
                                        checked={item.checked} 
                                        onCheckedChange={() => handleCheckboxChange(item)}
                                    />
                                    <Label
                                        htmlFor={`${selectedList.id}-${item.id}`}
                                        className={cn('flex-1 text-sm', item.checked && "text-muted-foreground line-through")}
                                    >
                                        {item.quantity}x {item.name}
                                    </Label>
                                    {item.checked && item.price !== undefined && (
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="font-mono">
                                          {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </Badge>
                                        <Button variant="ghost" size="icon" onClick={() => { setItemToPrice(item); setIsPriceDialogOpen(true); }} className="h-7 w-7 text-muted-foreground">
                                            <Pencil className="h-4 w-4"/>
                                        </Button>
                                      </div>
                                    )}
                                     <Button variant="ghost" size="icon" onClick={() => {}} className="h-7 w-7 text-muted-foreground">
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                               </div>
                           ))}
                           {filteredItems.length === 0 && (
                             <div className="text-center text-muted-foreground py-8">
                                <p>Nenhum item nesta categoria.</p>
                             </div>
                           )}
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
        
        {itemToPrice && (
            <SetPriceDialog
                isOpen={isPriceDialogOpen}
                onClose={() => { setItemToPrice(null); setIsPriceDialogOpen(false); }}
                onSetPrice={handleSetPrice}
                item={itemToPrice}
            />
        )}
        
        <AddItemDialog
            isOpen={isAddItemDialogOpen}
            onClose={() => setIsAddItemDialogOpen(false)}
            onAddItem={handleAddItemToList}
        />

    </div>
  );
}
