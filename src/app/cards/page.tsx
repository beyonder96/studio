
'use client';

import { useState, useContext, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { FinanceContext, Transaction, Card as CardType, Account } from '@/contexts/finance-context';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { addDays, format, parseISO, isAfter, startOfDay, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionsTable } from '@/components/finance/transactions-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Info, TrendingUp, CreditCard, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { EditAccountCardDialog, AccountCardFormData } from '@/components/settings/edit-account-card-dialog';
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
import Loading from '../finance/loading';

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

const VoucherCard = ({ voucher, balance }: { voucher: Account, balance: number }) => {
    const { formatCurrency, isSensitiveDataVisible } = useContext(FinanceContext);
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
                    <p className="text-3xl font-semibold">{formatCurrency(balance, isSensitiveDataVisible)}</p>
                    <VoucherBrandLogo brand={voucher.brand} className="h-8" />
                </div>
            </div>
        </div>
    )
}

export default function CardsPage() {
  const { 
    isLoading,
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
    formatCurrency,
    toggleTransactionPaid
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
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [coupleNames, setCoupleNames] = useState<string[]>([]);
  
  const form = useForm<AccountCardFormData>();
  
  const vouchers = useMemo(() => accounts.filter(acc => acc.type === 'voucher'), [accounts]);
  
  const displayableItems = useMemo(() => {
    const allItems: DisplayableItem[] = [...cards, ...vouchers];
    return allItems;
  }, [cards, vouchers]);
  
  const getVoucherCurrentBalance = (voucher: Account) => {
    const associatedTransactions = transactions.filter(t => t.account === voucher.name);
    const balance = associatedTransactions.reduce((sum, t) => sum + t.amount, voucher.balance);
    return balance;
  }

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

  const handleEditTransaction = (transaction: Transaction) => {
    router.push(`/finance?edit=${transaction.id}`);
  }

  const { cardInfo, currentBill, itemTransactions } = useMemo(() => {
    if (!selectedItem || !isSelectedCard) {
      return { cardInfo: null, currentBill: 0, itemTransactions: [] };
    }
  
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
  
    const closingDay = selectedItem.closingDay;
    const paymentDay = selectedItem.paymentDay;
  
    // Determine current invoice's closing date
    let closingYear = todayYear;
    let closingMonth = todayDay > closingDay ? todayMonth + 1 : todayMonth;
    if (closingMonth > 11) { // Handle year change
      closingMonth = 0;
      closingYear += 1;
    }
    const closingDate = new Date(closingYear, closingMonth, closingDay);
  
    // Determine previous invoice's closing date
    let prevClosingYear = closingYear;
    let prevClosingMonth = closingMonth - 1;
    if (prevClosingMonth < 0) {
      prevClosingMonth = 11;
      prevClosingYear -= 1;
    }
    const previousClosingDate = new Date(prevClosingYear, prevClosingMonth, closingDay);
  
    // Determine payment date for the current open invoice
    let paymentYear = closingYear;
    let paymentMonth = paymentDay > closingDay ? closingMonth : closingMonth + 1;
    if (paymentMonth > 11) {
      paymentMonth = 0;
      paymentYear += 1;
    }
    const paymentDate = new Date(paymentYear, paymentMonth, paymentDay);
  
    const bestPurchaseDate = addDays(closingDate, 1);
  
    const filteredTransactions = transactions.filter(t => {
      if (t.account !== selectedItem.name || t.type !== 'expense') {
        return false;
      }
      const transactionDate = startOfDay(parseISO(t.date));
      // Transaction is after the previous closing date AND on or before the current closing date.
      return isAfter(transactionDate, startOfDay(previousClosingDate)) && !isAfter(transactionDate, startOfDay(closingDate));
    });
  
    const totalBill = filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
    const formatDateSafe = (date?: Date) => {
        if (!date || !isValid(date)) return 'Data indisponível';
        return format(date, "dd 'de' MMMM", { locale: ptBR });
    }

    return {
      cardInfo: {
        bestPurchaseDate: formatDateSafe(bestPurchaseDate),
        closingDate: formatDateSafe(closingDate),
        paymentDate: formatDateSafe(paymentDate),
      },
      currentBill: totalBill,
      itemTransactions: filteredTransactions
    };
  
  }, [selectedItem, isSelectedCard, transactions]);
  
  
  const openAddDialog = (type: 'card' | 'account') => {
    setEditingItem(null);
    form.setValue('type', type);
    if (type === 'card') {
      form.reset({ type: 'card', name: '', limit: 1000, closingDay: 28, paymentDay: 10, holder: coupleNames[0] || '', brand: 'visa' });
    } else {
      form.reset({ type: 'account', name: '', balance: 0, holder: coupleNames[0] || '', brand: 'ticket' });
    }
    setIsAccountCardDialogOpen(true);
  }

  const openEditDialog = (item: DisplayableItem) => {
    setEditingItem(item);
    if ('balance' in item) {
      form.reset({ type: 'account', name: item.name, balance: item.balance, holder: item.holder, brand: item.brand, benefitDay: item.benefitDay });
    } else {
      form.reset({ type: 'card', name: item.name, limit: item.limit, closingDay: item.closingDay, paymentDay: item.paymentDay, holder: item.holder, brand: item.brand });
    }
    setIsAccountCardDialogOpen(true);
  }

  const openPayBillDialog = (card: CardType) => {
    setCardToPay(card);
    setIsPayBillDialogOpen(true);
  }

  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
        deleteTransaction(transactionToDelete.id);
        setTransactionToDelete(null);
    } else if (itemToDelete) {
        if ('balance' in itemToDelete) { 
            deleteAccount(itemToDelete.id);
        } else {
            deleteCard(itemToDelete.id);
        }
        setItemToDelete(null);
    }
  };
  
  const handleSaveAccountCard = (data: any) => { 
    if (data.type === 'card') {
      const cardData = { name: data.name, limit: data.limit, closingDay: data.closingDay, paymentDay: data.paymentDay, holder: data.holder, brand: data.brand };
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
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (displayableItems.length === 0) {
      return (
        <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl h-full">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center">
                <Info className="h-12 w-12 mb-4 text-primary"/>
                <h2 className="text-2xl font-bold">Nenhum Cartão ou Vale</h2>
                <p className="text-muted-foreground mt-2">Adicione seu primeiro cartão ou vale para começar.</p>
                <Button className="mt-6" onClick={() => openAddDialog('card')}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Adicionar
                </Button>
            </CardContent>
            <EditAccountCardDialog 
                isOpen={isAccountCardDialogOpen}
                onClose={() => setIsAccountCardDialogOpen(false)}
                onSave={handleSaveAccountCard}
                item={editingItem}
                coupleNames={coupleNames}
                form={form}
            />
        </Card>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
          <Button onClick={() => openAddDialog('card')}>
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
                : <VoucherCard voucher={item} balance={getVoucherCurrentBalance(item)} />
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
                                {isSelectedCard ? (
                                    <CardDescription>
                                        Limite de {formatCurrency(selectedItem.limit)}
                                    </CardDescription>
                                ) : (
                                    <CardDescription>
                                       {(selectedItem as Account).brand ? <VoucherBrandLogo brand={(selectedItem as Account).brand} className="h-6"/> : 'Vale'}
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
                        {isSelectedCard && cardInfo && (
                            <>
                            <Card className="bg-transparent p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-8 w-8 text-primary"/>
                                        <div>
                                            <p className="font-semibold text-muted-foreground">Fatura Atual</p>
                                            <p className="text-2xl font-bold">{formatCurrency(currentBill, true)}</p>
                                        </div>
                                    </div>
                                    <Button className="w-full" onClick={() => openPayBillDialog(selectedItem as CardType)}>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Pagar Fatura
                                    </Button>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Fechamento:</span>
                                        <span className="font-medium">{cardInfo.closingDate}</span>
                                    </div>
                                     <div className="flex justify-between">
                                        <span className="text-muted-foreground">Vencimento:</span>
                                        <span className="font-medium">{cardInfo.paymentDate}</span>
                                    </div>
                                     <div className="flex justify-between">
                                        <span className="text-muted-foreground">Melhor dia de compra:</span>
                                        <span className="font-medium">{cardInfo.bestPurchaseDate}</span>
                                    </div>
                                </div>
                            </Card>
                            </>
                        )}
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Transações</h3>
                            <TransactionsTable 
                                transactions={isSelectedCard ? itemTransactions : transactions.filter(t => t.account === selectedItem.name)}
                                onEdit={handleEditTransaction}
                                onDeleteRequest={(t) => setTransactionToDelete(t)}
                                onTogglePaid={toggleTransactionPaid}
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )}
      </AnimatePresence>
      
      <EditAccountCardDialog 
        isOpen={isAccountCardDialogOpen}
        onClose={() => setIsAccountCardDialogOpen(false)}
        onSave={handleSaveAccountCard}
        item={editingItem}
        coupleNames={coupleNames}
        form={form}
      />
       {cardToPay && (
        <PayBillDialog
            isOpen={isPayBillDialogOpen}
            onClose={() => setIsPayBillDialogOpen(false)}
            onSave={handlePayCardBill}
            card={cardToPay}
            totalBill={currentBill}
        />
       )}
      <AlertDialog open={!!itemToDelete || !!transactionToDelete} onOpenChange={(open) => !open && (setItemToDelete(null), setTransactionToDelete(null))}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Excluir item?</AlertDialogTitle>
                <AlertDialogDescription>
                    Tem certeza que deseja excluir "{(itemToDelete || transactionToDelete)?.name || (transactionToDelete as Transaction)?.description}"? 
                    {itemToDelete && 'limit' in itemToDelete && " Todas as transações associadas também serão excluídas."}
                    <br/><br/>
                    Esta ação não pode ser desfeita.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => (setItemToDelete(null), setTransactionToDelete(null))}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                    Sim, excluir
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
