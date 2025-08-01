
'use client';

import { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FinanceContext, Account } from '@/contexts/finance-context';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Banknote } from 'lucide-react';
import { EditAccountCardDialog } from '@/components/settings/edit-account-card-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/contexts/auth-context';

export default function VouchersPage() {
  const { 
    accounts, 
    addAccount,
    updateAccount,
    deleteAccount,
    formatCurrency,
  } = useContext(FinanceContext);
  const { user } = useAuth();
  
  const [isAccountCardDialogOpen, setIsAccountCardDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Account | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Account | null>(null);

  const vouchers = accounts.filter(acc => acc.type === 'voucher');

  const openAddDialog = () => {
    setEditingItem(null);
    setIsAccountCardDialogOpen(true);
  }

  const openEditDialog = (item: Account) => {
    setEditingItem(item);
    setIsAccountCardDialogOpen(true);
  }

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    deleteAccount(itemToDelete.id);
    setItemToDelete(null);
  };
  
  const handleSaveAccountCard = (data: ({ type: 'account' } & Partial<Account>)) => {
    if (editingItem) { // Editing existing item
        if (data.name && data.balance !== undefined && data.accountType) {
            updateAccount(editingItem.id, { name: data.name, balance: data.balance, type: data.accountType });
        }
    } else { // Adding new item
        if (data.name && data.balance !== undefined && data.accountType) {
            addAccount({ name: data.name, balance: data.balance, type: data.accountType });
        }
    }
    setIsAccountCardDialogOpen(false);
  };
  
  return (
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl h-full">
        <CardContent className="p-4 sm:p-6 h-full flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 sm:pb-6">
                <div>
                    <h1 className="text-2xl font-bold">Vales</h1>
                    <p className="text-muted-foreground">Gerencie seus vales-refeição, alimentação, etc.</p>
                </div>
                <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Vale
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto pt-4 sm:pt-6">
                 {vouchers.length > 0 ? (
                    <ul className="space-y-4">
                        {vouchers.map(voucher => (
                        <li key={voucher.id} className="flex items-center justify-between p-4 rounded-lg border bg-background/30">
                            <div className="flex items-center gap-4">
                                <Banknote className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="font-medium">{voucher.name}</p>
                                    <p className="text-sm text-muted-foreground">Saldo: {formatCurrency(voucher.balance)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => openEditDialog(voucher)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => setItemToDelete(voucher)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center text-muted-foreground">
                        <Banknote className="h-12 w-12 mb-4" />
                        <h3 className="text-lg font-medium">Nenhum vale cadastrado.</h3>
                        <p className="text-sm">Adicione seu primeiro vale para começar a usá-lo.</p>
                    </div>
                )}
            </div>
        </CardContent>

         <EditAccountCardDialog 
            isOpen={isAccountCardDialogOpen}
            onClose={() => setIsAccountCardDialogOpen(false)}
            onSave={handleSaveAccountCard}
            item={editingItem}
            allowedTypes={['account']}
        />

         <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir vale?</AlertDialogTitle>
                    <AlertDialogDescription>
                       Tem certeza que deseja excluir o vale "{itemToDelete?.name}"? Todas as transações associadas também serão excluídas.
                        <br/><br/>
                        Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                        Sim, excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </Card>
  );
}
