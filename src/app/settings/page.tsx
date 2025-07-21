
'use client';

import { useContext, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PlusCircle, Moon, Sun, AlertTriangle, Check, Save, Trash2, Edit } from 'lucide-react';
import { FinanceContext } from '@/contexts/finance-context';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { EditAccountCardDialog } from '@/components/settings/edit-account-card-dialog';
import { EditCategoryDialog } from '@/components/settings/edit-category-dialog';
import type { Account, Card as CardType } from '@/contexts/finance-context';


const pastelColors = [
  { name: 'Amarelo', value: '45 95% 55%' },
  { name: 'Verde', value: '145 63% 49%' },
  { name: 'Azul', value: '210 89% 64%' },
  { name: 'Rosa', value: '340 82% 76%' },
  { name: 'Roxo', value: '260 82% 76%' },
  { name: 'Laranja', value: '25 95% 65%' },
];

type Theme = 'light' | 'dark';
type ItemToDelete = { type: 'account' | 'card'; id: string; name: string } | { type: 'pantryCategory' | 'incomeCategory' | 'expenseCategory'; name: string };
type ItemToEdit = { type: 'pantryCategory' | 'incomeCategory' | 'expenseCategory'; name: string } | null;

export default function SettingsPage() {
  const { 
    accounts,
    cards,
    pantryCategories,
    addPantryCategory,
    deletePantryCategory,
    updatePantryCategory,
    resetAllData,
    incomeCategories,
    expenseCategories,
    addAccount,
    addCard,
    updateAccount,
    updateCard,
    deleteAccount,
    deleteCard,
    updateIncomeCategory,
    updateExpenseCategory,
  } = useContext(FinanceContext);
  const { toast } = useToast();
  
  const [isClient, setIsClient] = useState(false);
  const [savedTheme, setSavedTheme] = useState<Theme>('light');
  const [savedColor, setSavedColor] = useState<string>(pastelColors[2].value);
  
  const [tempTheme, setTempTheme] = useState<Theme>('light');
  const [tempColor, setTempColor] = useState<string>(pastelColors[2].value);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [isAccountCardDialogOpen, setIsAccountCardDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Account | CardType | null>(null);

  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);
  const [itemToEdit, setItemToEdit] = useState<ItemToEdit>(null);


  // Load theme and color from localStorage only on the client
  useEffect(() => {
    setIsClient(true);
    const storedTheme = (localStorage.getItem('app-theme') as Theme) || 'light';
    const storedColor = localStorage.getItem('app-color') || pastelColors[2].value;

    setSavedTheme(storedTheme);
    setTempTheme(storedTheme);
    
    setSavedColor(storedColor);
    setTempColor(storedColor);
  }, []);

  // Apply visual changes immediately based on temporary selections
  useEffect(() => {
    if (isClient) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(tempTheme);
    }
  }, [tempTheme, isClient]);

  useEffect(() => {
    if (isClient) {
      document.documentElement.style.setProperty('--primary', `hsl(${tempColor})`);
      const [h, s, l] = tempColor.split(' ').map(v => parseInt(v.replace('%', '')));
      document.documentElement.style.setProperty('--accent', `hsl(${h} ${s}% ${l + (l < 50 ? 15 : -15)}% / 0.2)`);
      document.documentElement.style.setProperty('--ring', `hsl(${tempColor})`);
    }
  }, [tempColor, isClient]);
  
  const handleSaveAppearance = () => {
    localStorage.setItem('app-theme', tempTheme);
    localStorage.setItem('app-color', tempColor);
    
    setSavedTheme(tempTheme);
    setSavedColor(tempColor);
    
    toast({
        title: 'Aparência Salva!',
        description: 'Seu novo tema e cor de destaque foram salvos.',
    });
  };

  const isAppearanceDirty = tempTheme !== savedTheme || tempColor !== savedColor;


  const handleAddCategory = () => {
    if(newCategoryName.trim()) {
        addPantryCategory(newCategoryName.trim());
        setNewCategoryName('');
    }
  }
  
  const handleDeleteConfirm = () => {
    if(!itemToDelete) return;
    if(itemToDelete.type === 'pantryCategory') {
        deletePantryCategory(itemToDelete.name);
    } else if (itemToDelete.type === 'account') {
        deleteAccount(itemToDelete.id);
    } else if (itemToDelete.type === 'card') {
        deleteCard(itemToDelete.id);
    } else if (itemToDelete.type === 'incomeCategory' || itemToDelete.type === 'expenseCategory') {
      toast({ variant: 'destructive', title: 'Ação não permitida', description: 'Não é possível excluir categorias padrão.' });
    }
    setItemToDelete(null);
  }

  const openAddDialog = () => {
    setEditingItem(null);
    setIsAccountCardDialogOpen(true);
  }

  const openEditDialog = (item: Account | CardType) => {
    setEditingItem(item);
    setIsAccountCardDialogOpen(true);
  }

  const handleSaveAccountCard = (data: ({ type: 'account' | 'card' } & Partial<Account> & Partial<CardType>)) => {
    if (editingItem) { // Editing existing item
        if (data.type === 'account' && data.name && data.balance !== undefined) {
            updateAccount(editingItem.id, { name: data.name, balance: data.balance });
        } else if (data.type === 'card' && data.name && data.limit !== undefined && data.dueDay !== undefined) {
            updateCard(editingItem.id, { name: data.name, limit: data.limit, dueDay: data.dueDay });
        }
    } else { // Adding new item
        if (data.type === 'account' && data.name && data.balance !== undefined) {
            addAccount({ name: data.name, balance: data.balance, type: 'checking' });
        } else if (data.type === 'card' && data.name && data.limit !== undefined && data.dueDay !== undefined) {
            addCard({ name: data.name, limit: data.limit, dueDay: data.dueDay });
        }
    }
    setIsAccountCardDialogOpen(false);
  };
  
  const handleSaveCategory = (oldName: string, newName: string) => {
    if (!itemToEdit) return;
    
    switch (itemToEdit.type) {
      case 'pantryCategory':
        updatePantryCategory(oldName, newName);
        break;
      case 'incomeCategory':
        updateIncomeCategory(oldName, newName);
        break;
      case 'expenseCategory':
        updateExpenseCategory(oldName, newName);
        break;
    }
    setItemToEdit(null);
  }

  return (
    <>
        <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
            <CardContent className="p-4 sm:p-6">
                <div className="space-y-8">
                {/* Appearance Settings */}
                <Card className="bg-transparent">
                    <CardHeader>
                    <CardTitle>Aparência</CardTitle>
                    <CardDescription>Personalize a aparência do aplicativo.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                    <div>
                        <Label className="block mb-2 font-medium">Tema</Label>
                        <div className="flex gap-2">
                        <Button variant={tempTheme === 'light' ? 'default' : 'outline'} onClick={() => setTempTheme('light')}>
                            <Sun className="mr-2 h-4 w-4" /> Claro
                        </Button>
                        <Button variant={tempTheme === 'dark' ? 'default' : 'outline'} onClick={() => setTempTheme('dark')}>
                            <Moon className="mr-2 h-4 w-4" /> Escuro
                        </Button>
                        </div>
                    </div>
                    <div>
                        <Label className="block mb-2 font-medium">Cor de Destaque</Label>
                        <div className="flex flex-wrap gap-3">
                        {isClient && pastelColors.map(color => (
                            <Button
                            key={color.name}
                            variant="outline"
                            size="icon"
                            className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${tempColor === color.value ? 'border-ring' : 'border-transparent'}`}
                            onClick={() => setTempColor(color.value)}
                            style={{ backgroundColor: `hsl(${color.value})` }}
                            aria-label={`Selecionar cor ${color.name}`}
                            >
                            {tempColor === color.value && <Check className="h-5 w-5 text-primary-foreground" />}
                            </Button>
                        ))}
                        </div>
                    </div>
                    </CardContent>
                     {isAppearanceDirty && (
                        <CardFooter>
                            <Button onClick={handleSaveAppearance}>
                                <Save className="mr-2 h-4 w-4" />
                                Salvar Alterações de Aparência
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                {/* Categories */}
                <Card className="bg-transparent">
                    <CardHeader>
                        <CardTitle>Categorias de Transação</CardTitle>
                        <CardDescription>Gerencie as categorias de suas receitas e despesas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold mb-2">Receitas</h3>
                                <ul className="space-y-2">
                                    {incomeCategories.map(cat => (
                                        <li key={cat} className="flex items-center justify-between p-3 rounded-lg border">
                                            <p>{cat}</p>
                                            <div className="flex items-center gap-1">
                                                <Button variant="outline" size="icon" onClick={() => setItemToEdit({ type: 'incomeCategory', name: cat })}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => setItemToDelete({ type: 'incomeCategory', name: cat })} disabled><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                             <div>
                                <h3 className="font-semibold mb-2">Despesas</h3>
                                <ul className="space-y-2">
                                    {expenseCategories.map(cat => (
                                        <li key={cat} className="flex items-center justify-between p-3 rounded-lg border">
                                            <p>{cat}</p>
                                            <div className="flex items-center gap-1">
                                                <Button variant="outline" size="icon" onClick={() => setItemToEdit({ type: 'expenseCategory', name: cat })}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => setItemToDelete({ type: 'expenseCategory', name: cat })} disabled><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                     <CardFooter>
                        <Button variant="outline" className="w-full" disabled>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Categoria de Transação
                        </Button>
                    </CardFooter>
                </Card>
                
                {/* Pantry Categories */}
                 <Card className="bg-transparent">
                    <CardHeader>
                        <CardTitle>Categorias da Despensa</CardTitle>
                        <CardDescription>Gerencie as categorias dos itens da sua despensa.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {pantryCategories.map(category => (
                                <li key={category} className="flex items-center justify-between p-3 rounded-lg border">
                                    <p>{category}</p>
                                    <div className="flex items-center gap-1">
                                        <Button variant="outline" size="icon" onClick={() => setItemToEdit({ type: 'pantryCategory', name: category })}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => setItemToDelete({ type: 'pantryCategory', name: category })}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                     <CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                        <Input
                            placeholder="Nome da nova categoria"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                        />
                        <Button onClick={handleAddCategory} className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar
                        </Button>
                    </CardFooter>
                </Card>


                {/* Accounts & Cards */}
                <Card className="bg-transparent">
                    <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                        <CardTitle>Contas e Cartões</CardTitle>
                        <CardDescription>Gerencie suas contas e cartões de crédito.</CardDescription>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <ul className="space-y-4">
                        {accounts.map(account => (
                        <li key={account.id} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                            <p className="font-medium">{account.name}</p>
                            <p className="text-sm text-muted-foreground">Saldo: {account.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </div>
                            <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => openEditDialog(account)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => setItemToDelete({ type: 'account', id: account.id, name: account.name })}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </li>
                        ))}
                        {cards.map(card => (
                        <li key={card.id} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                            <p className="font-medium">{card.name}</p>
                            <p className="text-sm text-muted-foreground">Limite: {card.limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} | Vencimento: dia {card.dueDay}</p>
                            </div>
                            <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => openEditDialog(card)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => setItemToDelete({ type: 'card', id: card.id, name: card.name })}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </li>
                        ))}
                    </ul>
                    </CardContent>
                    <CardFooter>
                    <Button variant="outline" className="w-full" onClick={openAddDialog}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Conta ou Cartão
                    </Button>
                    </CardFooter>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50 bg-transparent">
                    <CardHeader>
                    <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                    <CardDescription>Ações nesta área são permanentes e não podem ser desfeitas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Limpar Todos os Dados
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                            <AlertDialogDescription>
                            Esta ação é irreversível. Todos os dados do aplicativo (transações, contas, listas, desejos, etc.) serão permanentemente excluídos. Suas personalizações de aparência e categorias padrão serão mantidas.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={resetAllData}
                            >
                            Sim, apagar tudo
                            </AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    </CardContent>
                </Card>
                </div>
            </CardContent>
        </Card>
         <EditAccountCardDialog 
            isOpen={isAccountCardDialogOpen}
            onClose={() => setIsAccountCardDialogOpen(false)}
            onSave={handleSaveAccountCard}
            item={editingItem}
        />
        <EditCategoryDialog
            isOpen={!!itemToEdit}
            onClose={() => setItemToEdit(null)}
            onSave={handleSaveCategory}
            category={itemToEdit}
        />
         <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir {itemToDelete?.type.includes('Category') ? 'categoria' : (itemToDelete?.type === 'account' ? 'conta' : 'cartão')}?</AlertDialogTitle>
                    <AlertDialogDescription>
                       {itemToDelete?.type === 'pantryCategory' && `Tem certeza que deseja excluir a categoria "${itemToDelete.name}"? Itens nesta categoria serão movidos para "Outros".`}
                       {(itemToDelete?.type === 'incomeCategory' || itemToDelete?.type === 'expenseCategory') && `Categorias padrão não podem ser excluídas.`}
                       {itemToDelete?.type === 'account' && `Tem certeza que deseja excluir a conta "${itemToDelete.name}"? Todas as transações associadas também serão excluídas.`}
                       {itemToDelete?.type === 'card' && `Tem certeza que deseja excluir o cartão "${itemToDelete.name}"? Todas as transações associadas também serão excluídas.`}
                        <br/><br/>
                        Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90" disabled={itemToDelete?.type === 'incomeCategory' || itemToDelete?.type === 'expenseCategory'}>
                        Sim, excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
