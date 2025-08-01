
'use client';

import { useState, useContext, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { FinanceContext, Account } from '@/contexts/finance-context';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { EditAccountDialog } from '@/components/accounts/edit-account-dialog';
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
import { getDatabase, ref, onValue } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';
import { BankLogo } from '@/components/accounts/bank-logo';

const AccountDisplayCard = ({ account }: { account: Account }) => {
  const { formatCurrency, isSensitiveDataVisible } = useContext(FinanceContext);
  return (
    <div className="relative w-full aspect-[1.586] rounded-xl bg-black/20 dark:bg-white/20 backdrop-blur-lg shadow-2xl p-6 text-white overflow-hidden">
      <div className="absolute top-0 left-0 w-48 h-48 bg-blue-500/30 rounded-full -translate-x-1/2 -translate-y-1/4"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full translate-x-1/2 translate-y-1/4"></div>
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <p className="text-2xl font-mono tracking-widest">{account.name}</p>
          <h3 className="text-sm uppercase">{account.holder}</h3>
        </div>
        <div className="flex justify-between items-end">
          <p className="text-3xl font-semibold">{formatCurrency(account.balance, isSensitiveDataVisible)}</p>
          <BankLogo bankName={account.bankName} className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

export default function AccountsPage() {
  const { 
    accounts,
    deleteAccount,
    addAccount,
    updateAccount,
  } = useContext(FinanceContext);
  const router = useRouter();
  const { user } = useAuth();
  const [api, setApi] = useState<CarouselApi>();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Account | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Account | null>(null);
  const [coupleNames, setCoupleNames] = useState<string[]>([]);
  
  const bankAccounts = useMemo(() => accounts.filter(acc => acc.type === 'checking' || acc.type === 'savings'), [accounts]);
  
  useEffect(() => {
    if (user) {
      const db = getDatabase(firebaseApp);
      const namesRef = ref(db, `users/${user.uid}/profile/names`);
      const unsubscribe = onValue(namesRef, (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data === 'string') {
          setCoupleNames(data.split(' & ').map((name: string) => name.trim()));
        } else {
          setCoupleNames([user.displayName || 'Pessoa 1', 'Pessoa 2']);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (!api) return;
    setCurrentItemIndex(api.selectedScrollSnap());
    const onSelect = () => {
      setCurrentItemIndex(api.selectedScrollSnap());
    };
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const selectedItem = useMemo(() => bankAccounts[currentItemIndex], [bankAccounts, currentItemIndex]);

  const openAddDialog = () => {
    setEditingItem(null);
    setIsAccountDialogOpen(true);
  };

  const openEditDialog = (item: Account) => {
    setEditingItem(item);
    setIsAccountDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteAccount(itemToDelete.id);
      setItemToDelete(null);
    }
  };
  
  const handleSaveAccount = (data: Omit<Account, 'id'>) => { 
    if (editingItem) {
      updateAccount(editingItem.id, data);
    } else {
      addAccount(data);
    }
    setEditingItem(null);
    setIsAccountDialogOpen(false);
  };
  
  if (bankAccounts.length === 0) {
      return (
        <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl h-full">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center">
                 <BankLogo bankName="other" className="h-12 w-12 mb-4 text-primary" />
                <h2 className="text-2xl font-bold">Nenhuma Conta Bancária</h2>
                <p className="text-muted-foreground mt-2">Adicione sua primeira conta para começar.</p>
                <Button className="mt-6" onClick={() => setIsAccountDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Adicionar Conta
                </Button>
            </CardContent>
            {isAccountDialogOpen &&
                <EditAccountDialog 
                    isOpen={isAccountDialogOpen}
                    onClose={() => setIsAccountDialogOpen(false)}
                    onSave={handleSaveAccount}
                    item={editingItem}
                    coupleNames={coupleNames}
                />
            }
        </Card>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
          <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4"/>
              Adicionar Conta
          </Button>
      </div>

      <Carousel setApi={setApi} className="w-full max-w-md mx-auto">
        <CarouselContent>
          {bankAccounts.map((item) => (
            <CarouselItem key={item.id}>
              <AccountDisplayCard account={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      <AnimatePresence mode="wait">
        {selectedItem && (
            <motion.div
                key={selectedItem ? selectedItem.id : 'empty'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{selectedItem.name}</CardTitle>
                                <CardDescription>
                                    Titular: {selectedItem.holder}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => openEditDialog(selectedItem)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                 <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => setItemToDelete(selectedItem)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <p className="text-center text-muted-foreground">O histórico de transações desta conta pode ser visto na página de Finanças.</p>
                    </CardContent>
                </Card>
            </motion.div>
        )}
      </AnimatePresence>
      
      {isAccountDialogOpen &&
        <EditAccountDialog 
            isOpen={isAccountDialogOpen}
            onClose={() => setIsAccountDialogOpen(false)}
            onSave={handleSaveAccount}
            item={editingItem}
            coupleNames={coupleNames}
        />
      }

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
                <AlertDialogDescription>
                    Tem certeza que deseja excluir a conta "{(itemToDelete)?.name}"? 
                    <br/><br/>
                    Esta ação não pode ser desfeita.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                    Sim, excluir
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
