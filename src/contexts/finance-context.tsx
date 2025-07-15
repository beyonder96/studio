
'use client';

import React, { createContext, useState, ReactNode } from 'react';
import type { Transaction } from '@/components/finance/transactions-table';

// Mock Data
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

const initialAccounts = [
  { id: 'acc1', name: 'Conta Corrente - Itaú', balance: 10500.50, type: 'checking' },
  { id: 'acc2', name: 'Conta Poupança - Bradesco', balance: 25000.00, type: 'savings' },
];

const initialCards = [
    { id: 'card1', name: 'Cartão de Crédito - Nubank', limit: 8000.00, dueDay: 10 },
    { id: 'card2', name: 'Cartão de Crédito - Inter', limit: 12000.00, dueDay: 15 },
];

const initialIncomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
const initialExpenseCategories = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Compras', 'Outros'];


type Account = {
    id: string;
    name: string;
    balance: number;
    type: 'checking' | 'savings';
}

type Card = {
    id: string;
    name: string;
    limit: number;
    dueDay: number;
}

type FinanceContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id'>>) => void;
  deleteTransaction: (id: string) => void;
  accounts: Account[];
  cards: Card[];
  incomeCategories: string[];
  expenseCategories: string[];
  totalIncome: () => number;
  totalExpenses: () => number;
  totalBalance: () => number;
};

export const FinanceContext = createContext<FinanceContextType>({} as FinanceContextType);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [incomeCategories, setIncomeCategories] = useState<string[]>(initialIncomeCategories);
  const [expenseCategories, setExpenseCategories] = useState<string[]>(initialExpenseCategories);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: (transactions.length + 1).toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedTransaction } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };
  
  const totalIncome = () => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  const totalExpenses = () => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }
  
  const totalBalance = () => {
      // This is a simplified balance. A real app would calculate this based on account movements.
      return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }

  const value = {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    accounts,
    cards,
    incomeCategories,
    expenseCategories,
    totalIncome,
    totalExpenses,
    totalBalance,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
