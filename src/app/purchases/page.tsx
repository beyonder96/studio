
'use client';

import { useState, useMemo, useEffect, useContext, useCallback } from 'react';
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
    Save,
    Eraser,
    CheckCircle2
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
import { useToast } from '@/hooks/use-toast';
import { FinanceContext, ShoppingList, ShoppingListItem } from '@/contexts/finance-context';


export default function PurchasesPage() {
  const { 
    shoppingLists,
    setSelectedListId,
    selectedList,
    handleSetPrice,
    handleCheckboxChange,
    handleDeleteItem,
    handleUpdateItem,
    handleClearCompletedItems,
    handleAddItemToList,
    handleCreateListSave,
    handleDeleteList,
    handleRenameList,
    handleFinishList,
    addItemsToPantry,
   } = useContext(FinanceContext);
   const { toast } = useToast();

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
  const [listToClear, setListToClear] = useState<ShoppingList | null>(null);
  const [listToFinish, setListToFinish] = useState<ShoppingList | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');

  const onSetPrice = useCallback((itemId: string, price: number) => {
    handleSetPrice(itemId, price);
    setItemToPrice(null);
    setIsPriceDialogOpen(false);
  }, [handleSetPrice]);
  
  const onCheckboxChange = useCallback((item: ShoppingListItem) => {
    if (item.checked) {
      handleCheckboxChange(item);
    } else {
      setItemToPrice(item);
      setIsPriceDialogOpen(true);
    }
  }, [handleCheckboxChange]);

  const onDeleteItem = useCallback((itemId: string) => {
    handleDeleteItem(itemId);
  }, [handleDeleteItem]);
  
  const onEditItem = useCallback((item: ShoppingListItem) => {
    setItemToEdit(item);
    setIsEditItemDialogOpen(true);
  }, []);

  const onUpdateItem = useCallback((itemId: string, name: string, quantity: number) => {
    handleUpdateItem(itemId, name, quantity);
    setIsEditItemDialogOpen(false);
    setItemToEdit(null);
  }, [handleUpdateItem]);
  
  const onClearCompletedItems = useCallback(() => {
    if (!listToClear) return;
    handleClearCompletedItems(listToClear.id);
    setListToClear(null);
  }, [listToClear, handleClearCompletedItems]);

  const getProgress = useMemo(() => (list: ShoppingList | null) => {
    if (!list || list.items.length === 0) return 0;
    const checkedItems = list.items.filter(item => item.checked).length;
    return Math.round((checkedItems / list.items.length) * 100);
  }, []);
  
  const getCheckedCount = useMemo(() => (list: ShoppingList | null) => {
      if (!list || !list.items) return 0;
      return list.items.filter(item => item.checked).length;
  }, []);
  
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
  }, [selectedList]);
    
  const onAddItem = useCallback((name: string, quantity: number) => {
    handleAddItemToList(name, quantity);
    setIsAddItemDialogOpen(false);
  }, [handleAddItemToList]);

  const onCreateListSave = useCallback(() => {
    handleCreateListSave(newListName, (newList) => {
      setNewListName('');
      setIsCreatingList(false);
      setSelectedListId(newList.id);
    });
  }, [newListName, handleCreateListSave, setSelectedListId]);

  const handleCreateListCancel = () => {
    setNewListName('');
    setIsCreatingList(false);
  };

  const onDeleteList = useCallback(() => {
    if (!listToDelete) return;
    handleDeleteList(listToDelete.id);
    setListToDelete(null);
  }, [listToDelete, handleDeleteList]);

  const onStartRenameList = (list: ShoppingList) => {
    setEditingListId(list.id);
    setEditingListName(list.name);
  };

  const onRenameList = useCallback(() => {
    if (!editingListId) return;
    handleRenameList(editingListId, editingListName, () => {
      setEditingListId(null);
    });
  }, [editingListId, editingListName, handleRenameList]);
  
  const onFinishList = useCallback(() => {
    if (!listToFinish) return;

    const itemsToAdd = listToFinish.items.filter(item => item.checked);
    addItemsToPantry(itemsToAdd);

    handleFinishList(listToFinish.id);
    setListToFinish(null);

    toast({
        title: 'Despensa Atualizada!',
        description: `${itemsToAdd.length} itens foram adicionados à sua despensa.`
    })
  }, [listToFinish, addItemsToPantry, handleFinishList, toast]);

  return (
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
        <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-1 flex flex-col gap-6">
                {isCreatingList ? (
                    <Card className="bg-transparent">
                        <CardHeader>
                            <CardTitle>Criar Nova Lista</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-2">
                            <Input 
                                placeholder="Dê um nome para a sua lista..."
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onCreateListSave()}
                                autoFocus
                            />
                            <Button onClick={onCreateListSave}><Save className="h-4 w-4" /></Button>
                            <Button variant="ghost" onClick={handleCreateListCancel}><Trash2 className="h-4 w-4" /></Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-transparent">
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
                                    onClick={() => setSelectedListId(list.id)}
                                    className={cn(
                                        'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                                        selectedList?.id === list.id ? 'bg-primary/10' : 'hover:bg-muted'
                                    )}
                                >
                                    <div className="flex-1 overflow-hidden">
                                        {editingListId === list.id ? (
                                            <Input
                                                value={editingListName}
                                                onChange={(e) => setEditingListName(e.target.value)}
                                                onBlur={onRenameList}
                                                onKeyDown={(e) => e.key === 'Enter' && onRenameList()}
                                                className={cn('h-8', selectedList?.id === list.id ? 'bg-primary/10 text-primary-foreground border-primary-foreground/50' : '')}
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                        <p className="font-semibold truncate">{list.name}</p>
                                        )}
                                        <p className={`text-sm ${selectedList?.id === list.id ? 'text-primary/80' : 'text-muted-foreground'}`}>{list.items.length} itens</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                    {list.shared && <Users className={cn("h-5 w-5", selectedList?.id === list.id ? 'text-primary/90' : 'text-muted-foreground')} />}
                                    <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className={cn('h-8 w-8', selectedList?.id === list.id ? 'text-primary/90 hover:bg-primary/20' : 'text-muted-foreground hover:bg-muted')}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenuItem onClick={() => onStartRenameList(list)}>
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
                    <Card className="bg-transparent">
                        <CardHeader className="flex-row items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <DollarSign className="h-6 w-6 text-primary" />
                                <div>
                                    <CardTitle className="text-base">Total da Compra</CardTitle>
                                    <CardDescription>Valor dos itens marcados</CardDescription>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-primary">
                                {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </CardHeader>
                    </Card>
                )}
            </div>

            <div className="lg:col-span-2">
                {selectedList ? (
                    <Card className="bg-transparent">
                        <CardHeader>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-bold">{selectedList.name}</h2>
                                    {selectedList.shared && <Badge variant="secondary" className="font-normal"><Users className="mr-1.5 h-3 w-3"/>Compartilhada</Badge>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setListToClear(selectedList)} disabled={getCheckedCount(selectedList) === 0}>
                                        <Eraser className="mr-2 h-4 w-4"/> Limpar
                                    </Button>
                                    <Button size="sm" onClick={() => setIsAddItemDialogOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4"/> Adicionar Item
                                    </Button>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                {getCheckedCount(selectedList)} de {selectedList.items.length} itens concluídos ({getProgress(selectedList)}%)
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input 
                                    placeholder="Buscar itens..." 
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="all">Todos</TabsTrigger>
                                    <TabsTrigger value="pending">Pendentes</TabsTrigger>
                                    <TabsTrigger value="completed">Concluídos</TabsTrigger>
                                </TabsList>
                                
                                <div className="mt-4 space-y-3">
                                {filteredItems.map(item => (
                                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-background rounded-lg border">
                                            <Checkbox 
                                                id={`${selectedList.id}-${item.id}`} 
                                                checked={item.checked} 
                                                onCheckedChange={() => onCheckboxChange(item)}
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
                                                <Button variant="outline" size="icon" onClick={() => onEditItem(item)} className="h-7 w-7 text-muted-foreground">
                                                    <Pencil className="h-4 w-4"/>
                                                </Button>
                                                <Button variant="outline" size="icon" onClick={() => onDeleteItem(item.id)} className="h-7 w-7 text-destructive/70 hover:text-destructive">
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                    </div>
                                ))}
                                {filteredItems.length === 0 && (
                                    <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg mt-4">
                                        <p className="font-medium">Nenhum item encontrado.</p>
                                        <p className="text-sm">Tente limpar sua busca ou mudar de aba.</p>
                                    </div>
                                )}
                                </div>
                            </Tabs>
                        </CardContent>
                        <CardHeader>
                            <Button 
                                onClick={() => setListToFinish(selectedList)}
                                disabled={getCheckedCount(selectedList) === 0}
                                className="w-full"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Finalizar Compra ({getCheckedCount(selectedList)} Itens)
                            </Button>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg h-full flex flex-col items-center justify-center">
                        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">Nenhuma lista selecionada</h3>
                        <p className="mt-1 text-sm">Selecione uma lista na barra lateral ou crie uma nova.</p>
                    </div>
                )}
            </div>

                
                {itemToPrice && (
                    <SetPriceDialog
                        isOpen={isPriceDialogOpen}
                        onClose={() => { setItemToPrice(null); setIsPriceDialogOpen(false); }}
                        onSetPrice={onSetPrice}
                        item={itemToPrice}
                    />
                )}
                
                {itemToEdit && (
                    <EditItemDialog
                        isOpen={isEditItemDialogOpen}
                        onClose={() => { setItemToEdit(null); setIsEditItemDialogOpen(false); }}
                        onUpdateItem={onUpdateItem}
                        item={itemToEdit}
                    />
                )}
                
                <AddItemDialog
                    isOpen={isAddItemDialogOpen}
                    onClose={() => setIsAddItemDialogOpen(false)}
                    onAddItem={onAddItem}
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
                            <AlertDialogAction onClick={onDeleteList} className="bg-destructive hover:bg-destructive/90">
                                Sim, excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog open={!!listToClear} onOpenChange={(open) => !open && setListToClear(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Limpar itens concluídos?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação removerá todos os itens marcados como concluídos da lista 
                                <span className="font-semibold"> "{listToClear?.name}"</span>.
                                Os itens pendentes permanecerão.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setListToClear(null)}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={onClearCompletedItems}>
                                Sim, limpar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog open={!!listToFinish} onOpenChange={(open) => !open && setListToFinish(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Finalizar compra e atualizar despensa?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Os <span className="font-semibold">{listToFinish ? getCheckedCount(listToFinish) : 0}</span> itens marcados serão movidos para a sua despensa e removidos desta lista.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setListToFinish(null)}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={onFinishList}>
                                Sim, finalizar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>


            </div>
        </CardContent>
    </Card>
  );
}
