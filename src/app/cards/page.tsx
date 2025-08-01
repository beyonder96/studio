
'use client';

import { useState, useContext, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { FinanceContext, Transaction, Card as CardType } from '@/contexts/finance-context';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { addDays, format, setDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionsTable } from '@/components/finance/transactions-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Info, CalendarClock, ShoppingBag, Edit, Trash2, CreditCard } from 'lucide-react';
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
import type { Account } from '@/contexts/finance-context';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';
import { CardBrandLogo } from '@/components/cards/card-brand-logo';
import { PayBillDialog } from '@/components/cards/pay-bill-dialog';


const GlassCard = ({ card }: { card: CardType }) => {
  return (
    <div className="relative w-full aspect-[1.586] rounded-xl bg-black/20 dark:bg-white/20 backdrop-blur-lg shadow-2xl p-6 text-white overflow-hidden">
      <div className="absolute top-0 left-0 w-48 h-48 bg-primary/40 rounded-full -translate-x-1/2 -translate-y-1/4"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-fuchsia-500/30 rounded-full translate-x-1/2 translate-y-1/4"></div>
      <div className="relative z-10 flex flex-col justify-between h-full">
        <h3 className="text-xl font-semibold">Vida a 2</h3>
        <p className="text-2xl font-mono tracking-widest">{card.name}</p>
        <div className="flex justify-between items-end">
          <p className="text-sm uppercase">{card.holder}</p>
          <CardBrandLogo brand={card.brand} className="h-8" />
        </div>
      </div>
    </div>
  );
};

export default function CardsPage() {
  const { 
    cards, 
    transactions, 
    deleteTransaction, 
    updateTransaction,
    addCard,
    updateCard,
    deleteCard,
    handlePayCardBill,
 } = useContext(FinanceContext);
  const router = useRouter();
  const { user } = useAuth();
  const [api, setApi] = useState<CarouselApi>();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [isAccountCardDialogOpen, setIsAccountCardDialogOpen] = useState(false);
  const [isPayBillDialogOpen, setIsPayBillDialogOpen] = useState(false);
  const [cardToPay, setCardToPay] = useState<CardType | null>(null);
  const [editingItem, setEditingItem] = useState<Account | CardType | null>(null);
  const [cardToDelete, setCardToDelete] = useState<CardType | null>(null);
  const [coupleNames, setCoupleNames] = useState<string[]>([]);

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
    
    setCurrentCardIndex(api.selectedScrollSnap());
    
    const onSelect = () => {
      setCurrentCardIndex(api.selectedScrollSnap());
    };
    
    api.on('select', onSelect);
    
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const selectedCard = useMemo(() => cards[currentCardIndex], [cards, currentCardIndex]);

  const cardTransactions = useMemo(() => {
    if (!selectedCard) return [];
    return transactions.filter(t => t.account === selectedCard.name);
  }, [selectedCard, transactions]);
  
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
  
  const cardInfo = selectedCard ? getCardInfo(selectedCard.dueDay) : null;

  const openAddDialog = () => {
    setEditingItem(null);
    setIsAccountCardDialogOpen(true);
  }

  const openEditDialog = (item: CardType) => {
    setEditingItem(item);
    setIsAccountCardDialogOpen(true);
  }

  const openPayBillDialog = (card: CardType) => {
    setCardToPay(card);
    setIsPayBillDialogOpen(true);
  }

  const handleDeleteConfirm = () => {
    if (!cardToDelete) return;
    deleteCard(cardToDelete.id);
    setCardToDelete(null);
  };
  
  const handleSaveAccountCard = (data: ({ type: 'account' | 'card' } & Partial<Account> & Partial<CardType>)) => {
    if (editingItem) { // Editing existing item
        if (data.type === 'card' && data.name && data.limit !== undefined && data.dueDay !== undefined && data.holder && data.brand) {
            updateCard(editingItem.id, { name: data.name, limit: data.limit, dueDay: data.dueDay, holder: data.holder, brand: data.brand });
        }
    } else { // Adding new item
        if (data.type === 'card' && data.name && data.limit !== undefined && data.dueDay !== undefined && data.holder && data.brand) {
            addCard({ name: data.name, limit: data.limit, dueDay: data.dueDay, holder: data.holder, brand: data.brand });
        }
    }
    setIsAccountCardDialogOpen(false);
  };
  
  if (cards.length === 0) {
      return (
        <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl h-full">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center">
                <Info className="h-12 w-12 mb-4 text-primary"/>
                <h2 className="text-2xl font-bold">Nenhum Cartão de Crédito</h2>
                <p className="text-muted-foreground mt-2">Adicione seu primeiro cartão de crédito para começar.</p>
                <Button className="mt-6" onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Adicionar Cartão
                </Button>
            </CardContent>
            <EditAccountCardDialog 
                isOpen={isAccountCardDialogOpen}
                onClose={() => setIsAccountCardDialogOpen(false)}
                onSave={handleSaveAccountCard}
                item={editingItem}
                allowedTypes={['card']}
                coupleNames={coupleNames}
            />
        </Card>
      )
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-end">
            <Button onClick={openAddDialog}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Adicionar Cartão
            </Button>
        </div>

      <Carousel setApi={setApi} className="w-full max-w-md mx-auto">
        <CarouselContent>
          {cards.map((card) => (
            <CarouselItem key={card.id}>
              <GlassCard card={card} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      <AnimatePresence mode="wait">
        <motion.div
            key={selectedCard ? selectedCard.id : 'empty'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
        {selectedCard && (
            <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{selectedCard.name}</CardTitle>
                            <CardDescription>
                                Limite de {selectedCard.limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => openEditDialog(selectedCard)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                             <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => setCardToDelete(selectedCard)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
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
                        <Button className="h-full" onClick={() => openPayBillDialog(selectedCard)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pagar Fatura
                        </Button>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Transações do Cartão</h3>
                        <TransactionsTable 
                            transactions={cardTransactions}
                            onEdit={handleEditTransaction}
                            onDeleteRequest={deleteTransaction}
                        />
                    </div>
                </CardContent>
            </Card>
        )}
        </motion.div>
      </AnimatePresence>
      <EditAccountCardDialog 
          isOpen={isAccountCardDialogOpen}
          onClose={() => setIsAccountCardDialogOpen(false)}
          onSave={handleSaveAccountCard}
          item={editingItem}
          allowedTypes={['card']}
          coupleNames={coupleNames}
      />
       {cardToPay && (
        <PayBillDialog
            isOpen={isPayBillDialogOpen}
            onClose={() => setIsPayBillDialogOpen(false)}
            onSave={handlePayCardBill}
            card={cardToPay}
        />
       )}
      <AlertDialog open={!!cardToDelete} onOpenChange={(open) => !open && setCardToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Excluir cartão?</AlertDialogTitle>
                <AlertDialogDescription>
                    Tem certeza que deseja excluir o cartão "{cardToDelete?.name}"? Todas as transações associadas também serão excluídas.
                    <br/><br/>
                    Esta ação não pode ser desfeita.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCardToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                    Sim, excluir
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
