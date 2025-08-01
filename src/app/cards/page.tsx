
'use client';

import { useState, useContext, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { FinanceContext, Transaction, Card as CardType, Account } from '@/contexts/finance-context';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { addDays, format, setDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionsTable } from '@/components/finance/transactions-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Info, CalendarClock, ShoppingBag, Edit, Trash2, CreditCard, Banknote, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
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
import { getDatabase, ref, onValue } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';
import { CardBrandLogo, VoucherBrandLogo } from '@/components/cards/card-brand-logo';
import { PayBillDialog } from '@/components/cards/pay-bill-dialog';

type DisplayableItem = CardType | Account;

const GlassCard = ({ card }: { card: CardType }) => {
  return (
    <div className="relative w-full aspect-[1.586] rounded-xl bg-black/20 dark:bg-white/20 backdrop-blur-lg shadow-2xl p-6 text-white overflow-hidden">
      <div className="absolute top-0 left-0 w-48 h-48 bg-primary/40 rounded-full -translate-x-1/2 -translate-y-1/4"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-fuchsia-500/30 rounded-full translate-x-1/2 translate-y-1/4"></div>
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
            <h3 className="text-sm uppercase">{card.holder}</h3>
            <p className="text-2xl font-mono tracking-widest">{card.name}</p>
        </div>
        <div className="flex justify-between items-end">
          <p className="text-sm uppercase">Crédito</p>
          <CardBrandLogo brand={card.brand} className="h-8" />
        </div>
      </div>
    </div>
  );
};

const VoucherCard = ({ voucher }: { voucher: Account }) => {
    const { formatCurrency } = useContext(FinanceContext);
    return (
        <div className="relative w-full aspect-[1.586] rounded-xl bg-black/20 dark:bg-white/20 backdrop-blur-lg shadow-2xl p-6 text-white overflow-hidden">
            <div className="absolute top-0 left-0 w-48 h-48 bg-green-500/30 rounded-full -translate-x-1/2 -translate-y-1/4"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full translate-x-1/2 translate-y-1/4"></div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                    <p className="text-2xl font-mono tracking-widest">{voucher.name}</p>
                    <h3 className="text-sm uppercase">{voucher.holder}</h3>
                </div>
                <div className="flex justify-between items-end">
                    <p className="text-3xl font-semibold">{formatCurrency(voucher.balance)}</p>
                    <VoucherBrandLogo brand={voucher.brand} className="h-8" />
                </div>
            </div>
        </div>
    )
}

export default function CardsPage() {
  const { 
    cards, 
    accounts,
    transactions, 
    deleteTransaction, 
    addCard,
    updateCard,
    deleteCard,
    addAccount,
    updateAccount,
    deleteAccount,
    handlePayCardBill,
    formatCurrency
 } = useContext(FinanceContext);
  const router = useRouter();
  const { user } = useAuth();
  const [api, setApi] = useState<CarouselApi>();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const [isAccountCardDialogOpen, setIsAccountCardDialogOpen] = useState(false);
  const [isPayBillDialogOpen, setIsPayBillDialogOpen] = useState(false);
  const [cardToPay, setCardToPay] = useState<CardType | null>(null);
  const [editingItem, setEditingItem] = useState<Account | CardType | null>(null);
  const [itemToDelete, setItemToDelete] = useState<DisplayableItem | null>(null);
  const [coupleNames, setCoupleNames] = useState<string[]>([]);
  
  const vouchers = useMemo(() => accounts.filter(acc => acc.type === 'voucher'), [accounts]);
  
  const displayableItems = useMemo(() => {
    const allItems: DisplayableItem[] = [...cards, ...vouchers];
    return allItems;
  }, [cards, vouchers]);

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

  const selectedItem = useMemo(() => displayableItems[currentItemIndex], [displayableItems, currentItemIndex]);
  const isSelectedCard = selectedItem && 'limit' in selectedItem;
  const isSelectedVoucher = selectedItem && 'balance' in selectedItem;

  const cardTransactions = useMemo(() => {
    if (!selectedItem || !isSelectedCard) return [];
    return transactions.filter(t => t.account === selectedItem.name);
  }, [selectedItem, transactions, isSelectedCard]);
  
  const handleEditTransaction = (transaction: Transaction) => {
    router.push(`/finance?edit=${transaction.id}`);
  }

  const getCardInfo = (dueDay: number) => {
    const today = new Date();
    const invoiceClosingDate = setDate(today, dueDay - 10);
    const bestPurchaseDate = addDays(invoiceClosingDate, 1);
    const dueDate = setDate(today, dueDay);

    return {
      bestPurchaseDate: format(bestPurchaseDate, "dd 'de' MMMM", { locale: ptBR }),
      dueDate: format(dueDate, "dd 'de' MMMM", { locale: ptBR }),
    };
  };
  
  const cardInfo = (selectedItem && isSelectedCard) ? getCardInfo(selectedItem.dueDay) : null;

  const openAddDialog = (type: 'card' | 'account') => {
    const newItem = type === 'card' 
        ? { type: 'card', name: '', limit: 1000, dueDay: 10, holder: coupleNames[0] || '', brand: 'visa' as const }
        : { type: 'account', name: '', balance: 0, accountType: 'voucher' as const };
    setEditingItem(newItem as any);
    setIsAccountCardDialogOpen(true);
  }

  const openEditDialog = (item: DisplayableItem) => {
    setEditingItem(item);
    setIsAccountCardDialogOpen(true);
  }

  const openPayBillDialog = (card: CardType) => {
    setCardToPay(card);
    setIsPayBillDialogOpen(true);
  }

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    if ('balance' in itemToDelete) { // It's an Account (Voucher)
        deleteAccount(itemToDelete.id);
    } else { // It's a Card
        deleteCard(itemToDelete.id);
    }
    setItemToDelete(null);
  };
  
  const handleSaveAccountCard = (data: any) => { // Using `any` due to discriminated union complexity
    if (data.type === 'card') {
      const cardData = { name: data.name, limit: data.limit, dueDay: data.dueDay, holder: data.holder, brand: data.brand };
      if (editingItem && 'limit' in editingItem) {
        updateCard(editingItem.id, cardData);
      } else {
        addCard(cardData);
      }
    } else if (data.type === 'account') {
      const accountData = { name: data.name, balance: data.balance, type: 'voucher' as const, holder: data.holder, brand: data.brand, benefitDay: data.benefitDay };
       if (editingItem && 'balance' in editingItem) {
        updateAccount(editingItem.id, accountData);
      } else {
        addAccount(accountData);
      }
    }
    setEditingItem(null);
    setIsAccountCardDialogOpen(false);
  };
  
  
  if (displayableItems.length === 0) {
      return (
        <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl h-full">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center">
                <Info className="h-12 w-12 mb-4 text-primary"/>
                <h2 className="text-2xl font-bold">Nenhum Cartão ou Vale</h2>
                <p className="text-muted-foreground mt-2">Adicione seu primeiro cartão ou vale para começar.</p>
                <Button className="mt-6" onClick={() => setIsAccountCardDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Adicionar
                </Button>
            </CardContent>
            {isAccountCardDialogOpen &&
                <EditAccountCardDialog 
                    isOpen={isAccountCardDialogOpen}
                    onClose={() => setIsAccountCardDialogOpen(false)}
                    onSave={handleSaveAccountCard}
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
          <Button onClick={() => setIsAccountCardDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4"/>
              Adicionar Cartão ou Vale
          </Button>
      </div>

      <Carousel setApi={setApi} className="w-full max-w-md mx-auto">
        <CarouselContent>
          {displayableItems.map((item) => (
            <CarouselItem key={item.id}>
              {'limit' in item 
                ? <GlassCard card={item} />
                : <VoucherCard voucher={item} />
              }
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
                                {isSelectedCard && (
                                    <CardDescription>
                                        Limite de {formatCurrency(selectedItem.limit)}
                                    </CardDescription>
                                )}
                                 {isSelectedVoucher && (
                                    <CardDescription>
                                       {selectedItem.brand ? <VoucherBrandLogo brand={selectedItem.brand} className="h-6"/> : 'Vale'}
                                    </CardDescription>
                                )}
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
                        {isSelectedCard && (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                <Card className="bg-transparent p-4">
                                    <CalendarClock className="h-8 w-8 mx-auto text-primary mb-2"/>
                                    <p className="font-semibold">Vencimento da Fatura</p>
                                    <p className="text-muted-foreground">{cardInfo?.dueDate}</p>
                                </Card>
                                <Card className="bg-transparent p-4">
                                    <ShoppingBag className="h-8 w-8 mx-auto text-primary mb-2"/>
                                    <p className="font-semibold">Melhor Dia de Compra</p>
                                    <p className="text-muted-foreground">{cardInfo?.bestPurchaseDate}</p>
                                </Card>
                                <Button className="h-full" onClick={() => openPayBillDialog(selectedItem as CardType)}>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Pagar Fatura
                                </Button>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Transações do Cartão</h3>
                                <TransactionsTable 
                                    transactions={cardTransactions}
                                    onEdit={handleEditTransaction}
                                    onDeleteRequest={(t) => setItemToDelete(t)}
                                    onTogglePaid={() => {}}
                                />
                            </div>
                           </>
                        )}
                        {isSelectedVoucher && (
                             <div className="text-center p-4">
                               <p className="text-muted-foreground">Saldo disponível</p>
                               <p className="text-4xl font-bold">{formatCurrency(selectedItem.balance)}</p>
                               {selectedItem.benefitDay && (
                                 <p className="text-sm text-muted-foreground mt-2">Benefício cai todo dia {selectedItem.benefitDay}</p>
                               )}
                             </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        )}
      </AnimatePresence>
      
      {isAccountCardDialogOpen &&
        <EditAccountCardDialog 
            isOpen={isAccountCardDialogOpen}
            onClose={() => setIsAccountCardDialogOpen(false)}
            onSave={handleSaveAccountCard}
            item={editingItem}
            coupleNames={coupleNames}
        />
      }
       {cardToPay && (
        <PayBillDialog
            isOpen={isPayBillDialogOpen}
            onClose={() => setIsPayBillDialogOpen(false)}
            onSave={handlePayCardBill}
            card={cardToPay}
        />
       )}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Excluir item?</AlertDialogTitle>
                <AlertDialogDescription>
                    Tem certeza que deseja excluir "{itemToDelete?.name}"? 
                    {itemToDelete && 'limit' in itemToDelete && " Todas as transações associadas também serão excluídas."}
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

