
'use client';

import React, { createContext, useState, ReactNode, useContext } from 'react';
import type { Transaction } from '@/components/finance/transactions-table';
import { addMonths, format } from 'date-fns';

// Mock Data
const initialTransactions: Transaction[] = [
    {
      id: '1',
      description: 'Salário Kenned',
      amount: 5000,
      date: '2024-07-05',
      type: 'income',
      category: 'Salário',
      account: 'Conta Corrente - Itaú',
      isRecurring: true,
      frequency: 'monthly',
    },
    {
      id: '2',
      description: 'Salário Nicoli',
      amount: 4500,
      date: '2024-07-05',
      type: 'income',
      category: 'Salário',
      account: 'Conta Corrente - Itaú',
      isRecurring: true,
      frequency: 'monthly',
    },
    {
      id: '3',
      description: 'Aluguel',
      amount: -1500,
      date: '2024-07-10',
      type: 'expense',
      category: 'Moradia',
      account: 'Conta Corrente - Itaú',
      isRecurring: true,
      frequency: 'monthly',
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

const initialPantryItems: PantryItem[] = [
    { id: 'p1', name: 'Leite Integral', quantity: 2, pantryCategory: 'Laticínios' },
    { id: 'p2', name: 'Ovos', quantity: 12, pantryCategory: 'Outros' },
    { id: 'p3', name: 'Peito de Frango (kg)', quantity: 1, pantryCategory: 'Carnes' },
];


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

export type PantryCategory = 'Laticínios' | 'Carnes' | 'Peixes' | 'Frutas e Vegetais' | 'Outros';

export type PantryItem = {
    id: string;
    name: string;
    quantity: number;
    pantryCategory: PantryCategory;
}

const mapShoppingItemToPantryCategory = (itemName: string): PantryCategory => {
    const lowerCaseName = itemName.toLowerCase();
    if (lowerCaseName.includes('leite') || lowerCaseName.includes('queijo') || lowerCaseName.includes('iogurte')) return 'Laticínios';
    if (lowerCaseName.includes('frango') || lowerCaseName.includes('carne') || lowerCaseName.includes('bife')) return 'Carnes';
    if (lowerCaseName.includes('peixe') || lowerCaseName.includes('salmão') || lowerCaseName.includes('atum')) return 'Peixes';
    if (lowerCaseName.includes('maçã') || lowerCaseName.includes('banana') || lowerCaseName.includes('cenoura') || lowerCaseName.includes('alface')) return 'Frutas e Vegetais';
    return 'Outros';
}


type FinanceContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>, installments?: number) => void;
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id'>>) => void;
  deleteTransaction: (id: string) => void;
  accounts: Account[];
  cards: Card[];
  incomeCategories: string[];
  expenseCategories: string[];
  totalIncome: () => number;
  totalExpenses: () => number;
  totalBalance: () => number;
  countRecurringTransactions: () => number;
  isSensitiveDataVisible: boolean;
  toggleSensitiveDataVisibility: () => void;
  formatCurrency: (value: number) => string;
  resetAllData: () => void;
  pantryItems: PantryItem[];
  addItemsToPantry: (items: { name: string, quantity: number }[]) => void;
};

export const FinanceContext = createContext<FinanceContextType>({} as FinanceContextType);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [incomeCategories, setIncomeCategories] = useState<string[]>(initialIncomeCategories);
  const [expenseCategories, setExpenseCategories] = useState<string[]>(initialExpenseCategories);
  const [isSensitiveDataVisible, setIsSensitiveDataVisible] = useState(true);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(initialPantryItems);

  const toggleSensitiveDataVisibility = () => {
    setIsSensitiveDataVisible(prev => !prev);
  }

  const formatCurrency = (value: number) => {
    if (!isSensitiveDataVisible) {
        return 'R$ ••••••';
    }
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };


  const addTransaction = (transaction: Omit<Transaction, 'id'>, installments: number = 1) => {
     if (installments > 1) {
      const installmentAmount = transaction.amount / installments;
      const installmentGroupId = crypto.randomUUID();
      const newTransactions: Transaction[] = [];

      for (let i = 1; i <= installments; i++) {
        const installmentDate = addMonths(new Date(transaction.date + 'T00:00:00'), i - 1);
        newTransactions.push({
          ...transaction,
          id: crypto.randomUUID(),
          amount: installmentAmount,
          date: format(installmentDate, 'yyyy-MM-dd'),
          installmentGroupId,
          currentInstallment: i,
          totalInstallments: installments,
          isRecurring: false, // Installments are not recurring in the same way
        });
      }
      setTransactions(prev => [...newTransactions, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } else {
      const newTransaction = {
        ...transaction,
        id: crypto.randomUUID(),
      };
      setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedTransaction } as Transaction : t));
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

  const countRecurringTransactions = () => {
    return transactions.filter(t => t.isRecurring).length;
  }
  
  const addItemsToPantry = (items: { name: string, quantity: number }[]) => {
    setPantryItems(prevPantryItems => {
        const newPantryItems = [...prevPantryItems];

        items.forEach(itemToAdd => {
            const existingItemIndex = newPantryItems.findIndex(pItem => pItem.name.toLowerCase() === itemToAdd.name.toLowerCase());

            if (existingItemIndex > -1) {
                // Item exists, update quantity
                newPantryItems[existingItemIndex].quantity += itemToAdd.quantity;
            } else {
                // Item is new, add it
                newPantryItems.push({
                    id: crypto.randomUUID(),
                    name: itemToAdd.name,
                    quantity: itemToAdd.quantity,
                    pantryCategory: mapShoppingItemToPantryCategory(itemToAdd.name),
                });
            }
        });

        return newPantryItems;
    });
  };

  const resetAllData = () => {
    setTransactions([]);
    setAccounts([]);
    setCards([]);
    setPantryItems([]);
    // We keep the categories for convenience
    setIncomeCategories(initialIncomeCategories);
    setExpenseCategories(initialExpenseCategories);
  };

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
    countRecurringTransactions,
    isSensitiveDataVisible,
    toggleSensitiveDataVisibility,
    formatCurrency,
    resetAllData,
    pantryItems,
    addItemsToPantry,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
