
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SetPriceDialog } from '@/components/purchases/set-price-dialog';
import { AddItemDialog } from '@/components/purchases/add-item-dialog';
import { EditItemDialog } from '@/components/purchases/edit-item-dialog';
import { 
    Plus, 
    ShoppingCart, 
    Users, 
    MoreHorizontal, 
    Search,
    Trash2,
    DollarSign,
    Pencil,
    Save
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


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
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [itemToPrice, setItemToPrice] = useState<ShoppingListItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<ShoppingListItem | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [listToDelete, setListToDelete] = useState<ShoppingList | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');


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
    
    const updatedList = newLists.find(l => l.id === selectedList.id) || null;
    setSelectedList(updatedList);
    
    setItemToPrice(null);
    setIsPriceDialogOpen(false);
  };
  
  const handleCheckboxChange = (item: ShoppingListItem) => {
    if (item.checked) {
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
      setItemToPrice(item);
      setIsPriceDialogOpen(true);
    }
  };
  
  const handleDeleteItem = (itemId: string) => {
    if (!selectedList) return;
    const newLists = shoppingLists.map(list => {
        if (list.id === selectedList.id) {
            return {
                ...list,
                items: list.items.filter(item => item.id !== itemId)
            };
        }
        return list;
    });
    setShoppingLists(newLists);
    setSelectedList(newLists.find(l => l.id === selectedList.id) || null);
  };
  
  const handleEditItem = (item: ShoppingListItem) => {
    setItemToEdit(item);
    setIsEditItemDialogOpen(true);
  };

  const handleUpdateItem = (itemId: string, name: string, quantity: number) => {
     if (!selectedList) return;
     const newLists = shoppingLists.map(list => {
        if (list.id === selectedList.id) {
            return {
                ...list,
                items: list.items.map(i => 
                    i.id === itemId ? { ...i, name, quantity } : i
                )
            };
        }
        return list;
    });
    setShoppingLists(newLists);
    setSelectedList(newLists.find(l => l.id === selectedList.id) || null);
    setIsEditItemDialogOpen(false);
    setItemToEdit(null);
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
    
    let items = selectedList.items;

    if (activeTab === 'pending') {
      items = items.filter(item => !item.checked);
    } else if (activeTab === 'completed') {
      items = items.filter(item => item.checked);
    }

    if (searchTerm) {
        items = items.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return items;
  }, [selectedList, activeTab, searchTerm]);
  
  const totalCost = useMemo(() => {
    if (!selectedList) return 0;
    return selectedList.items.reduce((total, item) => {
      return item.checked && item.price ? total + item.price : total;
    }, 0);
  }, [shoppingLists, selectedList]);
    
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

  const handleCreateListSave = () => {
    if (!newListName.trim()) return;
    const newList: ShoppingList = {
        id: crypto.randomUUID(),
        name: newListName.trim(),
        shared: false,
        items: []
    };
    setShoppingLists(prev => [newList, ...prev]);
    setSelectedList(newList);
    setNewListName('');
    setIsCreatingList(false);
  };

  const handleCreateListCancel = () => {
    setNewListName('');
    setIsCreatingList(false);
  };

  const handleDeleteList = () => {
    if (!listToDelete) return;

    const newLists = shoppingLists.filter(list => list.id !== listToDelete.id);
    setShoppingLists(newLists);

    if (selectedList?.id === listToDelete.id) {
        setSelectedList(newLists[0] || null);
    }

    setListToDelete(null);
  }

  const handleStartRenameList = (list: ShoppingList) => {
    setEditingListId(list.id);
    setEditingListName(list.name);
  };

  const handleRenameList = () => {
    if (!editingListId || !editingListName.trim()) {
      setEditingListId(null);
      return;
    };
    const newLists = shoppingLists.map(list => 
      list.id === editingListId ? { ...list, name: editingListName.trim() } : list
    );
    setShoppingLists(newLists);
    const updatedList = newLists.find(l => l.id === editingListId) || null;
    setSelectedList(updatedList);
    setEditingListId(null);
  };


  useEffect(() => {
    if (!selectedList && shoppingLists.length > 0) {
      setSelectedList(shoppingLists[0]);
    }
    if (shoppingLists.length === 0) {
      setSelectedList(null);
    }
  }, [shoppingLists, selectedList]);

  return (
    <div className="flex flex-col gap-6">
        <div>
            <h1 className="text-3xl font-bold">Listas de Compras</h1>
            <p className="text-muted-foreground">Organize suas compras com a ajuda da IA</p>
        </div>
        
        {isCreatingList ? (
             <Card>
                <CardHeader>
                    <CardTitle>Criar Nova Lista</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                    <Input 
                        placeholder="Dê um nome para a sua lista..."
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateListSave()}
                        autoFocus
                    />
                    <Button onClick={handleCreateListSave}><Save className="h-4 w-4" /></Button>
                    <Button variant="ghost" onClick={handleCreateListCancel}><Trash2 className="h-4 w-4" /></Button>
                </CardContent>
            </Card>
        ) : (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ShoppingCart className="h-5 w-5"/>
                        Suas Listas
                    </CardTitle>
                     <Button variant="ghost" size="icon" onClick={() => setIsCreatingList(true)}>
                        <Plus className="h-5 w-5" />
                        <span className="sr-only">Adicionar Lista</span>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                    {shoppingLists.length === 0 && !isCreatingList && (
                         <div className="text-center text-muted-foreground py-4">
                            <p>Nenhuma lista ainda. <Button variant="link" className="p-0 h-auto" onClick={() => setIsCreatingList(true)}>Crie uma nova!</Button></p>
                         </div>
                    )}
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
                                {editingListId === list.id ? (
                                    <Input
                                        value={editingListName}
                                        onChange={(e) => setEditingListName(e.target.value)}
                                        onBlur={handleRenameList}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRenameList()}
                                        className={cn('h-8', selectedList?.id === list.id ? 'bg-primary-foreground/10 text-primary-foreground border-primary-foreground/50' : '')}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                  <p className="font-semibold">{list.name}</p>
                                )}
                                <p className={`text-sm ${selectedList?.id === list.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{list.items.length} itens</p>
                            </div>
                            <div className="flex items-center gap-2">
                               {list.shared && <Users className="h-5 w-5" />}
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className={`hover:bg-black/10 ${selectedList?.id === list.id ? 'text-primary-foreground' : ''}`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreHorizontal className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenuItem onClick={() => handleStartRenameList(list)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Renomear
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={() => setListToDelete(list)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Excluir Lista
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                               </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}
        
        
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
                        <Button onClick={() => setIsAddItemDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4"/> Adicionar Item
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                     <p className="text-sm text-muted-foreground mb-4">
                        {getCheckedCount(selectedList)} de {selectedList.items.length} itens concluídos ({getProgress(selectedList)}%)
                     </p>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input 
                            placeholder="Buscar itens..." 
                            className="pl-9 bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
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
                                    <div className="flex items-center gap-1">
                                        {item.checked && item.price !== undefined && (
                                            <Badge variant="secondary" className="font-mono">
                                            {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </Badge>
                                        )}
                                        <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)} className="h-7 w-7 text-muted-foreground">
                                            <Pencil className="h-4 w-4"/>
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="h-7 w-7 text-muted-foreground">
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
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
        
        {itemToEdit && (
            <EditItemDialog
                isOpen={isEditItemDialogOpen}
                onClose={() => { setItemToEdit(null); setIsEditItemDialogOpen(false); }}
                onUpdateItem={handleUpdateItem}
                item={itemToEdit}
            />
        )}
        
        <AddItemDialog
            isOpen={isAddItemDialogOpen}
            onClose={() => setIsAddItemDialogOpen(false)}
            onAddItem={handleAddItemToList}
        />
        
        <AlertDialog open={!!listToDelete} onOpenChange={(open) => !open && setListToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá excluir permanentemente a lista de compras
                        <span className="font-semibold"> "{listToDelete?.name}"</span> e todos os seus itens.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setListToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteList} className="bg-destructive hover:bg-destructive/90">
                        Sim, excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>


    </div>
  );
}
