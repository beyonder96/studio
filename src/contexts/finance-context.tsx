
'use client';

import React, { createContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import type { Transaction } from '@/components/finance/transactions-table';
import { addMonths, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// --- LocalStorage Helper Functions ---

const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    // This function now only runs on the initial render on the client.
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    // This effect runs only when the value changes, not on every render.
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    }
  }, [key, value]);

  return [value, setValue];
};


// Mock Data (used only if localStorage is empty)
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
const initialExpenseCategories = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Compras', 'Transferência', 'Outros'];

const initialPantryCategories: PantryCategory[] = [
    'Laticínios',
    'Carnes',
    'Peixes',
    'Frutas e Vegetais',
    'Grãos e Cereais',
    'Enlatados e Conservas',
    'Bebidas',
    'Higiene e Limpeza',
    'Outros',
];


const initialPantryItems: PantryItem[] = [
    { id: 'p1', name: 'Leite Integral', quantity: 2, pantryCategory: 'Laticínios' },
    { id: 'p2', name: 'Ovos', quantity: 12, pantryCategory: 'Outros' },
    { id: 'p3', name: 'Peito de Frango (kg)', quantity: 1, pantryCategory: 'Carnes' },
];

const initialTasks: Task[] = [
    { id: 'task1', text: 'Pagar conta de luz', completed: false },
    { id: 'task2', text: 'Agendar consulta no dentista', completed: false },
    { id: 'task3', text: 'Comprar presente para mamãe', completed: true },
];

const initialWishes: Wish[] = [
    { id: 'wish1', name: 'Viagem para a Praia do Forte', price: 3500, purchased: false, imageUrl: 'https://placehold.co/600x400.png', link: '' },
    { id: 'wish2', name: 'Nova Smart TV 55"', price: 2800, purchased: false, imageUrl: 'https://placehold.co/600x400.png', link: ''  },
    { id: 'wish3', name: 'Air Fryer', price: 450, purchased: true, imageUrl: 'https://placehold.co/600x400.png', link: ''  },
];

const initialAppointments: Appointment[] = [
    { id: 'appt1', title: 'Reunião de Design', date: '2024-07-20', time: '10:00', category: 'Trabalho', notes: 'Discutir novo layout do app.' },
    { id: 'appt2', title: 'Consulta Médica', date: '2024-07-22', time: '14:00', category: 'Saúde', notes: '' },
    { id: 'appt3', title: 'Almoço com a equipe', date: '2024-07-25', time: '12:30', category: 'Social', notes: '' },
]

const initialShoppingLists: ShoppingList[] = [
    {
        id: 'list1',
        name: 'Mercado',
        shared: true,
        items: [
            { id: 'item1', name: 'Leite Integral', quantity: 6, checked: false, price: 30.00 },
            { id: 'item2', name: 'Pão de Forma', quantity: 2, checked: true, price: 15.50 },
            { id: 'item3', name: 'Dúzia de Ovos', quantity: 2, checked: false },
            { id: 'item4', name: 'Queijo Mussarela (kg)', quantity: 1, checked: true, price: 45.00 },
            { id: 'item5', name: 'Peito de Frango (kg)', quantity: 3, checked: false },
        ]
    },
    {
        id: 'list2',
        name: 'Farmácia',
        shared: false,
        items: [
             { id: 'item6', name: 'Vitamina C', quantity: 1, checked: false },
             { id: 'item7', name: 'Pasta de dente', quantity: 2, checked: true, price: 8.90 },
             { id: 'item8', name: 'Fio dental', quantity: 3, checked: false },
        ]
    }
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

export type Appointment = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  category: string;
  notes?: string;
};


export type PantryCategory = string;

export type PantryItem = {
    id: string;
    name: string;
    quantity: number;
    pantryCategory: PantryCategory;
}

export type Task = {
  id: string;
  text: string;
  completed: boolean;
};

export type Wish = {
  id: string;
  name: string;
  price: number;
  link?: string;
  imageUrl?: string;
  purchased: boolean;
};

export type ShoppingListItem = {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
  price?: number;
};

export type ShoppingList = {
  id: string;
  name: string;
  items: ShoppingListItem[];
  shared: boolean;
};


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
  addItemToPantry: (name: string, quantity: number, category: string) => void;
  updatePantryItemQuantity: (itemId: string, newQuantity: number) => void;
  pantryCategories: PantryCategory[];
  addPantryCategory: (name: string) => void;
  deletePantryCategory: (name: string) => void;
  tasks: Task[];
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  wishes: Wish[];
  addWish: (wish: Omit<Wish, 'id' | 'purchased'>) => void;
  updateWish: (id: string, wish: Partial<Omit<Wish, 'id'>>) => void;
  deleteWish: (id: string) => void;
  toggleWishPurchased: (id: string) => void;
  appointments: Appointment[];
  appointmentCategories: string[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, appointment: Partial<Omit<Appointment, 'id'>>) => void;
  deleteAppointment: (id: string) => void;
  toast: ReturnType<typeof useToast>['toast'];
  shoppingLists: ShoppingList[];
  selectedListId: string | null;
  setSelectedListId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedList: ShoppingList | null;
  handleSetPrice: (itemId: string, price: number) => void;
  handleCheckboxChange: (item: ShoppingListItem) => void;
  handleDeleteItem: (itemId: string) => void;
  handleUpdateItem: (itemId: string, name: string, quantity: number) => void;
  handleClearCompletedItems: (listId: string) => void;
  handleAddItemToList: (name: string, quantity: number) => void;
  handleCreateListSave: (name: string, callback: (newList: ShoppingList) => void) => void;
  handleDeleteList: (listId: string) => void;
  handleStartRenameList: (list: ShoppingList) => void;
  handleRenameList: (listId: string, newName: string, callback: () => void) => void;
  handleFinishList: (listId: string) => void;
};

export const FinanceContext = createContext<FinanceContextType>({} as FinanceContextType);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  
  // Use the custom hook for all state management
  const [transactions, setTransactions] = useStickyState<Transaction[]>(initialTransactions, 'app-transactions');
  const [accounts, setAccounts] = useStickyState<Account[]>(initialAccounts, 'app-accounts');
  const [cards, setCards] = useStickyState<Card[]>(initialCards, 'app-cards');
  const [incomeCategories, setIncomeCategories] = useStickyState<string[]>(initialIncomeCategories, 'app-income-categories');
  const [expenseCategories, setExpenseCategories] = useStickyState<string[]>(initialExpenseCategories, 'app-expense-categories');
  const [pantryItems, setPantryItems] = useStickyState<PantryItem[]>(initialPantryItems, 'app-pantry-items');
  const [pantryCategories, setPantryCategories] = useStickyState<PantryCategory[]>(initialPantryCategories, 'app-pantry-categories');
  const [tasks, setTasks] = useStickyState<Task[]>(initialTasks, 'app-tasks');
  const [wishes, setWishes] = useStickyState<Wish[]>(initialWishes, 'app-wishes');
  const [appointments, setAppointments] = useStickyState<Appointment[]>(initialAppointments, 'app-appointments');
  const [shoppingLists, setShoppingLists] = useStickyState<ShoppingList[]>(initialShoppingLists, 'app-shopping-lists');
  
  const [isSensitiveDataVisible, setIsSensitiveDataVisible] = useState(true);
  const [selectedListId, setSelectedListId] = useStickyState<string | null>(initialShoppingLists[0]?.id || null, 'app-selected-list-id');

  const selectedList = shoppingLists.find(l => l.id === selectedListId) || null;

   useEffect(() => {
    if (!selectedListId && shoppingLists.length > 0) {
      setSelectedListId(shoppingLists[0].id);
    }
     // If the selected list was deleted, select the first available one.
    if (selectedListId && !shoppingLists.find(l => l.id === selectedListId)) {
        setSelectedListId(shoppingLists[0]?.id || null);
    }
  }, [shoppingLists, selectedListId, setSelectedListId]);


  const toggleSensitiveDataVisibility = () => {
    setIsSensitiveDataVisible(prev => !prev);
  }

  const formatCurrency = (value: number) => {
    if (!isSensitiveDataVisible) {
        return 'R$ ••••••';
    }
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };


  const addTransaction = (transaction: Omit<Transaction, 'id'> & { fromAccount?: string; toAccount?: string }, installments: number = 1) => {
    
    // Handle Transfer
    if (transaction.type === 'transfer') {
        const { amount, fromAccount, toAccount, date } = transaction;
        if (!fromAccount || !toAccount || !amount) return;

        const transferAmount = Math.abs(amount);

        // Create two transactions for a transfer
        const expenseTransaction: Transaction = {
            id: crypto.randomUUID(),
            description: `Transferência para ${toAccount}`,
            amount: -transferAmount,
            date,
            type: 'expense',
            category: 'Transferência',
            account: fromAccount,
        };

        const incomeTransaction: Transaction = {
            id: crypto.randomUUID(),
            description: `Transferência de ${fromAccount}`,
            amount: transferAmount,
            date,
            type: 'income',
            category: 'Transferência',
            account: toAccount,
        };
        
        // Update account balances
        setAccounts(prev => prev.map(acc => {
            if (acc.name === fromAccount) return { ...acc, balance: acc.balance - transferAmount };
            if (acc.name === toAccount) return { ...acc, balance: acc.balance + transferAmount };
            return acc;
        }));

        setTransactions(prev => [expenseTransaction, incomeTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        return;
    }


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

  const addItemToPantry = (name: string, quantity: number, category: string) => {
      const newItem: PantryItem = {
          id: crypto.randomUUID(),
          name,
          quantity,
          pantryCategory: category,
      };
      setPantryItems(prev => [newItem, ...prev]);
  };

  const updatePantryItemQuantity = (itemId: string, newQuantity: number) => {
    setPantryItems(prevPantryItems => {
      if (newQuantity <= 0) {
        return prevPantryItems.filter(item => item.id !== itemId);
      }
      return prevPantryItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
    });
  };
  
  const addPantryCategory = (name: string) => {
    if (!pantryCategories.find(cat => cat.toLowerCase() === name.toLowerCase())) {
        setPantryCategories(prev => [...prev, name]);
    } else {
        toast({
            variant: 'destructive',
            title: 'Categoria já existe',
            description: `A categoria "${name}" já está na lista.`
        })
    }
  }

  const deletePantryCategory = (name: string) => {
      // Move items from deleted category to 'Outros'
      setPantryItems(prev => prev.map(item => 
          item.pantryCategory === name ? { ...item, pantryCategory: 'Outros' } : item
      ));
      // Remove the category
      setPantryCategories(prev => prev.filter(cat => cat !== name));
  }


  const resetAllData = () => {
    // Set all data to an empty state, keeping default categories
    setTransactions([]);
    setAccounts([]);
    setCards([]);
    setIncomeCategories(initialIncomeCategories);
    setExpenseCategories(initialExpenseCategories);
    setPantryItems([]);
    setTasks([]);
    setWishes([]);
    setAppointments([]);
    setShoppingLists([]);
    setSelectedListId(null);
    
    // Note: pantryCategories are kept by design for now
    
    toast({
        title: "Dados Apagados!",
        description: "Todos os dados do aplicativo foram removidos com sucesso."
    })
  };
  
  // Task Management
  const addTask = (text: string) => {
    const newTask: Task = { id: crypto.randomUUID(), text, completed: false };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };
  
  // Wish Management
  const addWish = (wish: Omit<Wish, 'id' | 'purchased'>) => {
    const newWish: Wish = { ...wish, id: crypto.randomUUID(), purchased: false };
    setWishes(prev => [newWish, ...prev]);
  };
  
  const updateWish = (id: string, updatedWish: Partial<Omit<Wish, 'id'>>) => {
    setWishes(prev =>
      prev.map(wish => (wish.id === id ? { ...wish, ...updatedWish } as Wish : wish))
    );
  };

  const deleteWish = (id: string) => {
    setWishes(prev => prev.filter(wish => wish.id !== id));
  };

  const toggleWishPurchased = (id: string) => {
    setWishes(prev =>
      prev.map(wish =>
        wish.id === id ? { ...wish, purchased: !wish.purchased } : wish
      )
    );
  };

  const [appointmentCategories] = useState<string[]>(['Trabalho', 'Saúde', 'Social', 'Pessoal', 'Outros']);

  // Appointment Management
  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = { ...appointment, id: crypto.randomUUID() };
    setAppointments(prev => [...prev, newAppointment].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const updateAppointment = (id: string, updatedAppointment: Partial<Omit<Appointment, 'id'>>) => {
    setAppointments(prev =>
      prev.map(appt => (appt.id === id ? { ...appt, ...updatedAppointment } as Appointment : appt))
    );
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(appt => appt.id !== id));
  };
  
  // Shopping List Management
  const handleSetPrice = (itemId: string, price: number) => {
    setShoppingLists(prev => prev.map(list => 
      list.id === selectedListId 
        ? { ...list, items: list.items.map(item => item.id === itemId ? { ...item, price, checked: true } : item) }
        : list
    ));
  };
  
  const handleCheckboxChange = (item: ShoppingListItem) => {
    setShoppingLists(prev => prev.map(list => 
      list.id === selectedListId 
        ? { ...list, items: list.items.map(i => i.id === item.id ? { ...i, checked: !i.checked, price: i.checked ? undefined : i.price } : i) }
        : list
    ));
  };

  const handleDeleteItem = (itemId: string) => {
    setShoppingLists(prev => prev.map(list => 
      list.id === selectedListId 
        ? { ...list, items: list.items.filter(item => item.id !== itemId) }
        : list
    ));
  };
  
  const handleUpdateItem = (itemId: string, name: string, quantity: number) => {
    setShoppingLists(prev => prev.map(list => 
      list.id === selectedListId 
        ? { ...list, items: list.items.map(i => i.id === itemId ? { ...i, name, quantity } : i) }
        : list
    ));
  };
  
  const handleClearCompletedItems = (listId: string) => {
    setShoppingLists(prev => prev.map(list => 
      list.id === listId 
        ? { ...list, items: list.items.filter(item => !item.checked) }
        : list
    ));
  };
  
  const handleAddItemToList = (name: string, quantity: number) => {
    if (!selectedListId) return;
    const newItem: ShoppingListItem = { id: crypto.randomUUID(), name, quantity, checked: false };
    setShoppingLists(prev => prev.map(list => 
      list.id === selectedListId 
        ? { ...list, items: [...list.items, newItem] }
        : list
    ));
  };

  const handleCreateListSave = (name: string, callback: (newList: ShoppingList) => void) => {
    if (!name.trim()) return;
    const newList: ShoppingList = { id: crypto.randomUUID(), name: name.trim(), shared: false, items: [] };
    setShoppingLists(prev => [newList, ...prev]);
    callback(newList);
  };
  
  const handleDeleteList = (listId: string) => {
    setShoppingLists(prev => {
      const newLists = prev.filter(list => list.id !== listId);
      if (selectedListId === listId) {
        setSelectedListId(newLists[0]?.id || null);
      }
      return newLists;
    });
  };
  
  const handleRenameList = (listId: string, newName: string, callback: () => void) => {
     if (!newName.trim()) return;
     setShoppingLists(prev => prev.map(list => 
       list.id === listId ? { ...list, name: newName.trim() } : list
     ));
     callback();
  };
  
  const handleStartRenameList = () => {}; // Managed in page component state

  const handleFinishList = (listId: string) => {
     setShoppingLists(prev => prev.map(list => 
      list.id === listId 
        ? { ...list, items: list.items.filter(item => !item.checked) }
        : list
    ));
  }


  const value = {
    transactions, addTransaction, updateTransaction, deleteTransaction,
    accounts, cards, incomeCategories, expenseCategories,
    totalIncome, totalExpenses, totalBalance, countRecurringTransactions,
    isSensitiveDataVisible, toggleSensitiveDataVisibility, formatCurrency,
    resetAllData,
    pantryItems, addItemsToPantry, addItemToPantry, updatePantryItemQuantity,
    pantryCategories, addPantryCategory, deletePantryCategory,
    tasks, addTask, toggleTask, deleteTask,
    wishes, addWish, updateWish, deleteWish, toggleWishPurchased,
    appointments, appointmentCategories, addAppointment, updateAppointment, deleteAppointment,
    toast,
    shoppingLists, selectedListId, setSelectedListId, selectedList,
    handleSetPrice, handleCheckboxChange, handleDeleteItem, handleUpdateItem,
    handleClearCompletedItems, handleAddItemToList, handleCreateListSave,
    handleDeleteList, handleStartRenameList, handleRenameList, handleFinishList
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
