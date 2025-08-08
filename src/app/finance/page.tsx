
'use client';

import { useState, useContext, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, Repeat, Edit, Trash2, Receipt } from 'lucide-react';
import { TransactionsTable } from '@/components/finance/transactions-table';
import { AddTransactionDialog } from '@/components/finance/add-transaction-dialog';
import { AddFromReceiptDialog } from '@/components/finance/add-from-receipt-dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FinanceContext, Transaction } from '@/contexts/finance-context';
import { motion } from 'framer-motion';
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
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import Loading from './loading';
import { format } from 'date-fns';

const frequencyMap = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal',
  annual: 'Anual',
};

export default function FinancePage() {
  const { 
    isLoading,
    transactions, 
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteRecurringTransaction,
    toggleTransactionPaid,
    totalIncome,
    totalExpenses,
    formatCurrency,
  } = useContext(FinanceContext);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const transactionToEditId = searchParams.get('edit');

  useEffect(() => {
    if (transactionToEditId) {
      const transactionToEdit = transactions.find(t => t.id === transactionToEditId);
      if (transactionToEdit) {
        openEditDialog(transactionToEdit);
        router.replace('/finance', { scroll: false });
      }
    }
  }, [transactionToEditId, transactions, router]);
  
  const handleReceiptProcessed = (receiptData: any) => {
    const prefilledTransaction: Partial<Transaction> = {
        description: receiptData.storeName || 'Compra via cupom',
        amount: Math.abs(receiptData.total) || 0,
        date: receiptData.purchaseDate ? format(parseISO(receiptData.purchaseDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        type: 'expense',
        category: 'Alimentação', // Sensible default
        paid: true,
        isRecurring: false,
    };
    setEditingTransaction(prefilledTransaction as Transaction);
    setIsDialogOpen(true);
  };


  const handleSaveTransaction = (transaction: Omit<Transaction, 'id' | 'amount' > & { id?: string; amount: number; fromAccount?: string; toAccount?: string; }, installments?: number) => {
    if (transaction.id) {
      updateTransaction(transaction.id, transaction);
    } else {
      addTransaction(transaction, installments);
    }
  };
  
  const handleDeleteConfirm = () => {
    if(!transactionToDelete) return;
    
    if(transactionToDelete.isRecurring) {
        deleteRecurringTransaction(transactionToDelete.id);
    } else {
        deleteTransaction(transactionToDelete.id);
    }
    setTransactionToDelete(null);
  }

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingTransaction(null);
    setIsDialogOpen(true);
  }

  const handleDialogClose = () => {
    setEditingTransaction(null);
    setIsDialogOpen(false);
  }

  const monthlyIncome = totalIncome();
  const monthlyExpenses = totalExpenses();

  const recurringTransactions = useMemo(() => {
    return transactions.filter(t => t.isRecurring);
  }, [transactions]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00'); // Assume start of day in local timezone
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
          <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
              <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <Card className="bg-transparent">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Receitas no Mês</CardTitle>
                              <ArrowUpCircle className="h-5 w-5 text-green-500" />
                          </CardHeader>
                          <CardContent>
                              <div className="text-2xl font-bold text-green-500">
                                  {formatCurrency(monthlyIncome, true)}
                              </div>
                          </CardContent>
                      </Card>
                      <Card className="bg-transparent">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Despesas no Mês</CardTitle>
                              <ArrowDownCircle className="h-5 w-5 text-red-500" />
                          </CardHeader>
                          <CardContent>
                              <div className="text-2xl font-bold text-red-500">
                                  {formatCurrency(monthlyExpenses, true)}
                              </div>
                          </CardContent>
                      </Card>
                      <Card className="bg-transparent">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Balanço Mensal</CardTitle>
                          </CardHeader>
                          <CardContent>
                              <div className="text-2xl font-bold">
                                  {formatCurrency(monthlyIncome + monthlyExpenses, true)}
                              </div>
                          </CardContent>
                      </Card>
                  </div>

                  <Card className="bg-transparent">
                      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <CardTitle>Transações</CardTitle>
                           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <AddFromReceiptDialog onReceiptProcessed={handleReceiptProcessed} />
                            <Button onClick={openAddDialog}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Adicionar Manualmente
                            </Button>
                           </div>
                      </CardHeader>
                      <CardContent className="p-0 sm:p-6">
                      <TransactionsTable 
                          transactions={transactions.filter(t => !t.isRecurring)} 
                          onEdit={openEditDialog}
                          onDeleteRequest={(transaction) => setTransactionToDelete(transaction)}
                          onTogglePaid={toggleTransactionPaid}
                      />
                      </CardContent>
                  </Card>

                  <Card className="bg-transparent">
                      <CardHeader>
                          <CardTitle>Transações Recorrentes</CardTitle>
                          <CardDescription>
                          Visualize e gerencie suas despesas e receitas recorrentes.
                          </CardDescription>
                      </CardHeader>
                      <CardContent>
                          {/* Mobile View */}
                          <div className="space-y-3 sm:hidden">
                              {recurringTransactions.map((transaction) => (
                                  <Card key={transaction.id} className="bg-background/50">
                                      <CardContent className="p-4 flex flex-col gap-3">
                                          <div className="flex items-start justify-between">
                                              <div className="flex items-center gap-2">
                                                  <Repeat className="h-5 w-5 text-muted-foreground" />
                                                  <p className="font-semibold text-base">{transaction.description}</p>
                                              </div>
                                              <p className={cn(
                                                  'font-mono font-semibold text-lg',
                                                  transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                                              )}>
                                                  {formatCurrency(transaction.amount, true)}
                                              </p>
                                          </div>
                                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                                               <Badge variant="secondary" className="font-normal">{transaction.category}</Badge>
                                               <div className="flex items-center gap-2">
                                                  <span>{formatDate(transaction.date)}</span>
                                                  <span>•</span>
                                                  <span>{transaction.frequency ? frequencyMap[transaction.frequency] : 'N/A'}</span>
                                               </div>
                                          </div>
                                           <div className="flex items-center justify-end gap-2 border-t pt-2 mt-2">
                                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(transaction)}>
                                                  <Edit className="mr-2 h-4 w-4" /> Editar
                                              </Button>
                                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setTransactionToDelete(transaction)}>
                                                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                              </Button>
                                          </div>
                                      </CardContent>
                                  </Card>
                              ))}
                          </div>

                          {/* Desktop View */}
                          <Table className="hidden sm:table">
                              <TableHeader>
                                  <TableRow>
                                  <TableHead>Descrição</TableHead>
                                  <TableHead>Categoria</TableHead>
                                  <TableHead>Frequência</TableHead>
                                  <TableHead>Próxima Data</TableHead>
                                  <TableHead className="text-right">Valor</TableHead>
                                  <TableHead className="w-[100px]">Ações</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {recurringTransactions.map((transaction) => (
                                  <TableRow key={transaction.id}>
                                      <TableCell className="font-medium">
                                      <div className="flex items-center gap-2">
                                              <Repeat className="h-4 w-4 text-muted-foreground" />
                                              <span>{transaction.description}</span>
                                          </div>
                                      </TableCell>
                                      <TableCell>
                                      <Badge variant="secondary">{transaction.category}</Badge>
                                      </TableCell>
                                      <TableCell>
                                      {transaction.frequency ? frequencyMap[transaction.frequency] : 'N/A'}
                                      </TableCell>
                                      <TableCell>{formatDate(transaction.date)}</TableCell>
                                      <TableCell
                                      className={`text-right font-medium ${
                                          transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                                      }`}
                                      >
                                      {formatCurrency(transaction.amount, true)}
                                      </TableCell>
                                      <TableCell>
                                      <div className="flex items-center justify-end gap-2">
                                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(transaction)}>
                                              <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setTransactionToDelete(transaction)}>
                                              <Trash2 className="h-4 w-4" />
                                          </Button>
                                      </div>
                                  </TableCell>
                                  </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                          
                          {recurringTransactions.length === 0 && (
                              <div className="text-center text-muted-foreground py-10">
                                  Nenhuma transação recorrente encontrada.
                              </div>
                          )}
                      </CardContent>
                  </Card>
                  </div>
              </CardContent>
          </Card>
      </motion.div>
      <AddTransactionDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onSaveTransaction={handleSaveTransaction}
          transaction={editingTransaction}
      />
      
      <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open ? setTransactionToDelete(null) : null}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso irá excluir permanentemente a transação de 
                  <span className="font-semibold"> "{transactionToDelete?.description}"</span>.
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
    </>
  );
}
