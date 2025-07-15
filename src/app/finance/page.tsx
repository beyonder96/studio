
'use client';

import { useState } from 'react';
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


const initialTransactions: Transaction[] = [
    {
      id: '1',
      description: 'Salário Kenned',
      amount: 5000,
      date: '2024-07-05',
      type: 'income',
      category: 'Salário',
      account: 'Conta Corrente - Itaú'
    },
    {
      id: '2',
      description: 'Salário Nicoli',
      amount: 4500,
      date: '2024-07-05',
      type: 'income',
      category: 'Salário',
      account: 'Conta Corrente - Itaú'
    },
    {
      id: '3',
      description: 'Aluguel',
      amount: -1500,
      date: '2024-07-10',
      type: 'expense',
      category: 'Moradia',
      account: 'Conta Corrente - Itaú'
    },
    {
      id: '4',
      description: 'Supermercado',
      amount: -650,
      date: '2024-07-12',
      type: 'expense',
      category: 'Alimentação',
      account: 'Cartão de Crédito - Nubank'
    },
     {
      id: '5',
      description: 'iFood',
      amount: -55.90,
      date: '2024-07-15',
      type: 'expense',
      category: 'Alimentação',
      account: 'Cartão de Crédito - Nubank'
    },
];

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleSaveTransaction = (transaction: Omit<Transaction, 'id'> & { id?: string }) => {
    if (transaction.id) {
      // Update existing transaction
      setTransactions(prev => prev.map(t => t.id === transaction.id ? { ...t, ...transaction } : t));
    } else {
      // Add new transaction
      const newTransaction = {
        ...transaction,
        id: (transactions.length + 1).toString(),
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
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

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex flex-col gap-6">
       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receitas no Mês</CardTitle>
                <ArrowUpCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-500">
                    {totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                     {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
            </CardContent>
         </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balanço Mensal</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                     {(totalIncome + totalExpenses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
  );
}
