
'use client';

import { useState, useContext, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, Repeat, Edit, Trash2 } from 'lucide-react';
import { TransactionsTable, Transaction } from '@/components/finance/transactions-table';
import { AddTransactionDialog } from '@/components/finance/add-transaction-dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FinanceContext } from '@/contexts/finance-context';
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
} from "@/components/ui/alert-dialog"

const frequencyMap = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal',
  annual: 'Anual',
};


export default function FinancePage() {
  const { 
    transactions, 
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteRecurringTransaction,
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
        // Clean up the URL
        router.replace('/finance', { scroll: false });
      }
    }
  }, [transactionToEditId, transactions, router]);


  const handleSaveTransaction = (transaction: Omit<Transaction, 'id'> & { id?: string }, installments?: number) => {
    if (transaction.id) {
      // Update existing transaction
      updateTransaction(transaction.id, transaction);
    } else {
      // Add new transaction
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


  return (
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
                                {formatCurrency(monthlyIncome)}
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
                                {formatCurrency(monthlyExpenses)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-transparent">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Balanço Mensal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(monthlyIncome + monthlyExpenses)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-transparent">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Transações</CardTitle>
                        <Button onClick={openAddDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                    <TransactionsTable 
                        transactions={transactions.filter(t => !t.isRecurring)} 
                        onEdit={openEditDialog}
                        onDelete={(id) => {
                            const transaction = transactions.find(t => t.id === id);
                            if (transaction) setTransactionToDelete(transaction);
                        }}
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
                        <Table>
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
                                {formatCurrency(transaction.amount)}
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
                            {recurringTransactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        Nenhuma transação recorrente encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <AddTransactionDialog
                    isOpen={isDialogOpen}
                    onClose={handleDialogClose}
                    onSaveTransaction={handleSaveTransaction}
                    transaction={editingTransaction}
                />
                
                <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso irá excluir permanentemente a transação de 
                            <span className="font-semibold"> "{transactionToDelete?.description}"</span>.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                            Sim, excluir
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                </div>
            </CardContent>
        </Card>
    </motion.div>
  );
}
