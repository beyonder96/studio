
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
import { PlusCircle, Moon, Sun, AlertTriangle, Check, Save, Trash2, Edit, Bell } from 'lucide-react';
import { FinanceContext } from '@/contexts/finance-context';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { EditAccountCardDialog } from '@/components/settings/edit-account-card-dialog';
import { EditCategoryDialog } from '@/components/settings/edit-category-dialog';
import type { Account, Card as CardType } from '@/contexts/finance-context';
import { useFCM } from '@/hooks/use-fcm';
import { useAuth } from '@/contexts/auth-context';

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
  const { user } = useAuth();
  const { permission, requestPermission } = useFCM();
  
  const [isClient, setIsClient] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [isAccountCardDialogOpen, setIsAccountCardDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Account | CardType | null>(null);

  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);
  const [itemToEdit, setItemToEdit] = useState<ItemToEdit>(null);


  // Load theme from localStorage only on the client
  useEffect(() => {
    setIsClient(true);
    const storedTheme = (localStorage.getItem('app-theme') as Theme) || 'light';
    setTheme(storedTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(storedTheme);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    toast({
        title: `Tema alterado para ${newTheme === 'light' ? 'Claro' : 'Escuro'}!`,
    });
  };

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
        <Card>
            <CardContent className="p-4 sm:p-6">
                <div className="space-y-8">
                {/* Appearance Settings */}
                <Card className="bg-transparent border-0 shadow-none">
                    <CardHeader>
                    <CardTitle>Aparência</CardTitle>
                    <CardDescription>Personalize a aparência do aplicativo.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                    <div>
                        <Label className="block mb-2 font-medium">Tema</Label>
                        <div className="flex gap-2">
                        <Button variant={theme === 'light' ? 'secondary' : 'outline'} onClick={() => handleThemeChange('light')}>
                            <Sun className="mr-2 h-4 w-4" /> Claro
                        </Button>
                        <Button variant={theme === 'dark' ? 'secondary' : 'outline'} onClick={() => handleThemeChange('dark')}>
                            <Moon className="mr-2 h-4 w-4" /> Escuro
                        </Button>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                
                {/* Notifications */}
                <Card className="bg-transparent border-0 shadow-none">
                    <CardHeader>
                        <CardTitle>Notificações</CardTitle>
                        <CardDescription>Receba alertas sobre tarefas e datas importantes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {permission === 'granted' ? (
                        <p className="text-sm text-green-600 flex items-center gap-2"><Check className="h-4 w-4" /> As notificações estão ativas para este dispositivo.</p>
                        ) : (
                        <Button onClick={() => requestPermission(user?.uid)} disabled={permission === 'denied' || !user}>
                            <Bell className="mr-2 h-4 w-4" />
                            {permission === 'denied' ? 'Permissão negada nas configurações do navegador' : 'Ativar Notificações'}
                        </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Categories */}
                <Card className="bg-transparent border-0 shadow-none">
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
                 <Card className="bg-transparent border-0 shadow-none">
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
                <Card className="bg-transparent border-0 shadow-none">
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
