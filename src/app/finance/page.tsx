
'use client';

import { useState, useContext, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { TransactionsTable, Transaction } from '@/components/finance/transactions-table';
import { AddTransactionDialog } from '@/components/finance/add-transaction-dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { FinanceContext } from '@/contexts/finance-context';


export default function FinancePage() {
  const { 
    transactions, 
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalIncome,
    totalExpenses
  } = useContext(FinanceContext);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
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

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
  };
  
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


  return (
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
        <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receitas no Mês</CardTitle>
                        <ArrowUpCircle className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {monthlyIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Despesas no Mês</CardTitle>
                        <ArrowDownCircle className="h-5 w-5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {monthlyExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Balanço Mensal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(monthlyIncome + monthlyExpenses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Transações</CardTitle>
                </div>
                <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Transação
                </Button>
                </CardHeader>
                <CardContent>
                <TransactionsTable 
                    transactions={transactions} 
                    onEdit={openEditDialog}
                    onDelete={handleDeleteTransaction}
                />
                </CardContent>
            </Card>
            <AddTransactionDialog
                isOpen={isDialogOpen}
                onClose={handleDialogClose}
                onSaveTransaction={handleSaveTransaction}
                transaction={editingTransaction}
            />
            </div>
        </CardContent>
    </Card>
  );
}
