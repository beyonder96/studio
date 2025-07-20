
'use client';

import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getDatabase, ref, onValue, set, push, remove, update } from 'firebase/database';
import type { Transaction } from '@/components/finance/transactions-table';
import { addMonths, format, isSameMonth, startOfMonth } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { app as firebaseApp } from '@/lib/firebase';

// --- Default Data for New Users ---
const initialTransactions: Transaction[] = [
    { id: '1', description: 'Salário', amount: 5000, date: format(new Date(), 'yyyy-MM-dd'), type: 'income', category: 'Salário', isRecurring: true, frequency: 'monthly' },
    { id: '2', description: 'Aluguel', amount: -1500, date: format(new Date(), 'yyyy-MM-10'), type: 'expense', category: 'Moradia', isRecurring: true, frequency: 'monthly' },
];
const initialAccounts = [ { id: 'acc1', name: 'Conta Corrente', balance: 3500, type: 'checking' } ];
const initialCards = [ { id: 'card1', name: 'Cartão de Crédito', limit: 5000, dueDay: 10 } ];
const initialIncomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
const initialExpenseCategories = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Compras', 'Transferência', 'Outros'];
const initialPantryCategories: PantryCategory[] = [ 'Laticínios', 'Carnes', 'Peixes', 'Frutas e Vegetais', 'Grãos e Cereais', 'Enlatados e Conservas', 'Bebidas', 'Higiene e Limpeza', 'Outros' ];
const initialPantryItems: PantryItem[] = [];
const initialTasks: Task[] = [ { id: 'task1', text: 'Pagar conta de luz', completed: false } ];
const initialWishes: Wish[] = [ { id: 'wish1', name: 'Viagem para a praia', price: 3500, purchased: false, imageUrl: 'https://placehold.co/600x400.png', link: '' } ];
const initialAppointments: Appointment[] = [];
const initialShoppingLists: ShoppingList[] = [ { id: 'list1', name: 'Mercado', shared: true, items: [ { id: 'item1', name: 'Leite Integral', quantity: 1, checked: false } ] } ];

export type Account = { id: string; name: string; balance: number; type: 'checking' | 'savings'; }
export type Card = { id: string; name: string; limit: number; dueDay: number; }
export type Appointment = { id: string; title: string; date: string; time?: string; category: string; notes?: string; };
export type PantryCategory = string;
export type PantryItem = { id: string; name: string; quantity: number; pantryCategory: PantryCategory; }
export type Task = { id: string; text: string; completed: boolean; };
export type Wish = { id: string; name: string; price: number; link?: string; imageUrl?: string; purchased: boolean; };
export type ShoppingListItem = { id: string; name: string; quantity: number; checked: boolean; price?: number; };
export type ShoppingList = { id: string; name: string; items: ShoppingListItem[]; shared: boolean; };

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
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, account: Partial<Omit<Account, 'id'>>) => void;
  deleteAccount: (id: string) => void;
  cards: Card[];
  addCard: (card: Omit<Card, 'id'>) => void;
  updateCard: (id: string, card: Partial<Omit<Card, 'id'>>) => void;
  deleteCard: (id: string) => void;
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
  const { user } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<string[]>(initialIncomeCategories);
  const [expenseCategories, setExpenseCategories] = useState<string[]>(initialExpenseCategories);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [pantryCategories, setPantryCategories] = useState<PantryCategory[]>(initialPantryCategories);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  
  const [isSensitiveDataVisible, setIsSensitiveDataVisible] = useState(true);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const selectedList = shoppingLists.find(l => l.id === selectedListId) || null;
  
  const getDbRef = (path: string) => {
    if (!user) throw new Error("User not authenticated to get DB ref.");
    const db = getDatabase(firebaseApp);
    return ref(db, `users/${user.uid}/${path}`);
  }
  
  useEffect(() => {
    if (user) {
        const db = getDatabase(firebaseApp);
        const userRef = ref(db, `users/${user.uid}`);
        
        const unsubscribe = onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const transformData = (d: any) => d ? Object.keys(d).map(key => ({ id: key, ...d[key] })) : [];
                setTransactions(transformData(data.transactions));
                setAccounts(transformData(data.accounts));
                setCards(transformData(data.cards));
                setIncomeCategories(data.incomeCategories || initialIncomeCategories);
                setExpenseCategories(data.expenseCategories || initialExpenseCategories);
                setPantryItems(transformData(data.pantryItems));
                setPantryCategories(data.pantryCategories || initialPantryCategories);
                setTasks(transformData(data.tasks));
                setWishes(transformData(data.wishes));
                setAppointments(transformData(data.appointments));
                const dbShoppingLists: ShoppingList[] = transformData(data.shoppingLists).map((list: any) => ({
                    ...list,
                    items: list.items ? Object.keys(list.items).map(key => ({ id: key, ...list.items[key] })) : []
                }));
                setShoppingLists(dbShoppingLists);
                if (!selectedListId && dbShoppingLists.length > 0) {
                    setSelectedListId(dbShoppingLists[0].id || null);
                }
            } else {
                 const initialData = {
                    transactions: Object.fromEntries(initialTransactions.map(t => [t.id, t])),
                    accounts: Object.fromEntries(initialAccounts.map(a => [a.id, a])),
                    cards: Object.fromEntries(initialCards.map(c => [c.id, c])),
                    incomeCategories: initialIncomeCategories,
                    expenseCategories: initialExpenseCategories,
                    pantryCategories: initialPantryCategories,
                    pantryItems: {},
                    tasks: Object.fromEntries(initialTasks.map(t => [t.id, t])),
                    wishes: Object.fromEntries(initialWishes.map(w => [w.id, w])),
                    appointments: {},
                    shoppingLists: Object.fromEntries(initialShoppingLists.map(l => [l.id, l])),
                };
                set(userRef, initialData);
            }
        });
        return () => unsubscribe();
    } else {
        // Reset state when user logs out
        setTransactions([]);
        setAccounts([]);
        setCards([]);
        setIncomeCategories(initialIncomeCategories);
        setExpenseCategories(initialExpenseCategories);
        setPantryCategories(initialPantryCategories);
        setPantryItems([]);
        setTasks([]);
        setWishes([]);
        setAppointments([]);
        setShoppingLists([]);
        setSelectedListId(null);
    }
}, [user, selectedListId]);

  useEffect(() => {
    if (shoppingLists.length > 0 && !shoppingLists.find(l => l.id === selectedListId)) {
        setSelectedListId(shoppingLists[0]?.id || null);
    }
  }, [shoppingLists, selectedListId]);


  const toggleSensitiveDataVisibility = () => setIsSensitiveDataVisible(prev => !prev);

  const formatCurrency = (value: number) => {
    if (!isSensitiveDataVisible) return 'R$ ••••••';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const addTransaction = (transaction: Omit<Transaction, 'id'> & { fromAccount?: string; toAccount?: string }, installments: number = 1) => {
    if (!user) return;
    if (transaction.type === 'transfer') {
        toast({ title: "Funcionalidade não implementada", description: "Transferências serão implementadas em breve."});
        return;
    }

    if (installments > 1 && transaction.account && cards.some(c => c.name === transaction.account)) {
      const installmentAmount = transaction.amount / installments;
      const installmentGroupId = crypto.randomUUID();

      for (let i = 1; i <= installments; i++) {
        const installmentDate = addMonths(new Date(transaction.date + 'T00:00:00'), i - 1);
        const newTransaction: Transaction = {
          ...transaction,
          id: crypto.randomUUID(),
          amount: installmentAmount,
          date: format(installmentDate, 'yyyy-MM-dd'),
          installmentGroupId,
          currentInstallment: i,
          totalInstallments: installments,
          isRecurring: false,
        };
        const newId = push(getDbRef('transactions')).key!;
        set(getDbRef(`transactions/${newId}`), {...newTransaction, id: undefined });
      }
    } else {
      const newId = push(getDbRef('transactions')).key!;
      const newTransaction = { ...transaction };
      set(getDbRef(`transactions/${newId}`), newTransaction);
    }
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Omit<Transaction, 'id'>>) => {
    if (!user) return;
    update(getDbRef(`transactions/${id}`), updatedTransaction);
  };

  const deleteTransaction = (id: string) => {
    if (!user) return;
    remove(getDbRef(`transactions/${id}`));
  };

  const totalIncome = useCallback(() => {
    const today = new Date();
    return transactions
      .filter((t) => t.type === 'income' && isSameMonth(new Date(t.date + 'T00:00:00'), today))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpenses = useCallback(() => {
    const today = new Date();
    return transactions
      .filter((t) => t.type === 'expense' && isSameMonth(new Date(t.date + 'T00:00:00'), today))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalBalance = useCallback(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);

  const countRecurringTransactions = useCallback(() => transactions.filter(t => t.isRecurring).length, [transactions]);
  
  const resetAllData = () => {
    if (!user) return;
    const database = getDatabase(firebaseApp);
    set(ref(database, `users/${user.uid}`), null);
    toast({ title: "Dados Apagados!", description: "Todos os dados foram removidos." });
  };
  
  const addItemsToPantry = (items: { name: string, quantity: number }[]) => {
      if (!user) return;
      const updates: { [key: string]: PantryItem | null } = {};
      const newPantryItems = [...pantryItems];

      items.forEach(itemToAdd => {
          const existingItemIndex = newPantryItems.findIndex(pItem => pItem.name.toLowerCase() === itemToAdd.name.toLowerCase());

          if (existingItemIndex > -1) {
              const existingItem = newPantryItems[existingItemIndex];
              const updatedItem = { ...existingItem, quantity: existingItem.quantity + itemToAdd.quantity };
              updates[`pantryItems/${existingItem.id}`] = updatedItem;
              newPantryItems[existingItemIndex] = updatedItem;
          } else {
              const newId = push(getDbRef('pantryItems')).key!;
              const newItem: PantryItem = {
                  id: newId,
                  name: itemToAdd.name,
                  quantity: itemToAdd.quantity,
                  pantryCategory: mapShoppingItemToPantryCategory(itemToAdd.name),
              };
              updates[`pantryItems/${newItem.id}`] = newItem;
              newPantryItems.push(newItem);
          }
      });
      const db = getDatabase(firebaseApp);
      update(ref(db, `users/${user.uid}`), updates);
  };
  
  const addItemToPantry = (name: string, quantity: number, category: string) => {
      if (!user) return;
      const newId = push(getDbRef('pantryItems')).key!;
      const newItem: PantryItem = { id: newId, name, quantity, pantryCategory: category };
      set(getDbRef(`pantryItems/${newId}`), newItem);
  };

  const updatePantryItemQuantity = (itemId: string, newQuantity: number) => {
    if (!user) return;
    if (newQuantity <= 0) {
        remove(getDbRef(`pantryItems/${itemId}`));
    } else {
        update(getDbRef(`pantryItems/${itemId}`), { quantity: newQuantity });
    }
  };

  const addPantryCategory = (name: string) => {
    if (!user) return;
    if (!pantryCategories.find(cat => cat.toLowerCase() === name.toLowerCase())) {
      const updatedCategories = [...pantryCategories, name];
      set(getDbRef('pantryCategories'), updatedCategories);
    }
  };

  const deletePantryCategory = (name: string) => {
    if (!user) return;
    const updatedCategories = pantryCategories.filter(cat => cat !== name);
    set(getDbRef('pantryCategories'), updatedCategories);
    // Also update items in that category to 'Outros'
    const updates: any = {};
    pantryItems.forEach(item => {
        if(item.pantryCategory === name) {
            updates[`pantryItems/${item.id}/pantryCategory`] = 'Outros';
        }
    });
    update(getDbRef(''), updates);
  };

  // Task Management
  const addTask = (text: string) => {
    if (!user) return;
    const newId = push(getDbRef('tasks')).key!;
    const newTask: Task = { id: newId, text, completed: false };
    set(getDbRef(`tasks/${newId}`), {text: newTask.text, completed: newTask.completed});
  };

  const toggleTask = (id: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === id);
    if (task) {
      update(getDbRef(`tasks/${id}`), { completed: !task.completed });
    }
  };

  const deleteTask = (id: string) => {
    if (!user) return;
    remove(getDbRef(`tasks/${id}`));
  };

  // Wish Management
  const addWish = (wish: Omit<Wish, 'id' | 'purchased'>) => {
    if (!user) return;
    const newId = push(getDbRef('wishes')).key!;
    const newWish: Wish = { ...wish, id: newId, purchased: false };
    set(getDbRef(`wishes/${newId}`), { ...wish, purchased: false });
  };
  
  const updateWish = (id: string, updatedWish: Partial<Omit<Wish, 'id'>>) => {
    if (!user) return;
    update(getDbRef(`wishes/${id}`), updatedWish);
  };

  const deleteWish = (id: string) => {
    if (!user) return;
    remove(getDbRef(`wishes/${id}`));
  };

  const toggleWishPurchased = (id: string) => {
    if (!user) return;
    const wish = wishes.find(w => w.id === id);
    if (wish) {
      update(getDbRef(`wishes/${id}`), { purchased: !wish.purchased });
    }
  };
  
  const [appointmentCategories] = useState<string[]>(['Trabalho', 'Saúde', 'Social', 'Pessoal', 'Outros']);

  // Appointment Management
  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    if (!user) return;
    const newId = push(getDbRef('appointments')).key!;
    set(getDbRef(`appointments/${newId}`), appointment);
  };

  const updateAppointment = (id: string, updatedAppointment: Partial<Omit<Appointment, 'id'>>) => {
    if (!user) return;
    update(getDbRef(`appointments/${id}`), updatedAppointment);
  };

  const deleteAppointment = (id: string) => {
    if (!user) return;
    remove(getDbRef(`appointments/${id}`));
  };
  
  const addAccount = (account: Omit<Account, 'id'>) => {
    if(!user) return;
    const newId = push(getDbRef('accounts')).key!;
    set(getDbRef(`accounts/${newId}`), account);
  }

  const updateAccount = (id: string, updatedAccount: Partial<Omit<Account, 'id'>>) => {
    if(!user) return;
    update(getDbRef(`accounts/${id}`), updatedAccount);
  }

  const deleteAccount = (id: string) => {
    if(!user) return;
    remove(getDbRef(`accounts/${id}`));
  }

  const addCard = (card: Omit<Card, 'id'>) => {
    if(!user) return;
    const newId = push(getDbRef('cards')).key!;
    set(getDbRef(`cards/${newId}`), card);
  }

  const updateCard = (id: string, updatedCard: Partial<Omit<Card, 'id'>>) => {
    if(!user) return;
    update(getDbRef(`cards/${id}`), updatedCard);
  }

  const deleteCard = (id: string) => {
    if(!user) return;
    remove(getDbRef(`cards/${id}`));
  }

  // Shopping List Management
  const getListRef = (listId: string, path?: string) => {
    if (!user) throw new Error("User not authenticated to get list ref.");
    let fullPath = `shoppingLists/${listId}`;
    if (path) {
      fullPath += `/${path}`;
    }
    return getDbRef(fullPath);
  };

  const handleSetPrice = (itemId: string, price: number) => {
    if (!user || !selectedListId) return;
    const itemRef = getListRef(selectedListId, `items/${itemId}`);
    update(itemRef, { price, checked: true });
  };
  
  const handleCheckboxChange = (item: ShoppingListItem) => {
    if (!user || !selectedListId) return;
    const itemRef = getListRef(selectedListId, `items/${item.id}`);
    update(itemRef, { checked: !item.checked, price: item.checked ? null : item.price });
  };

  const handleDeleteItem = (itemId: string) => {
    if (!user || !selectedListId) return;
    const itemRef = getListRef(selectedListId, `items/${itemId}`);
    remove(itemRef);
  };
  
  const handleUpdateItem = (itemId: string, name: string, quantity: number) => {
    if (!user || !selectedListId) return;
    const itemRef = getListRef(selectedListId, `items/${itemId}`);
    update(itemRef, { name, quantity });
  };
  
  const handleClearCompletedItems = (listId: string) => {
    if (!user) return;
    const list = shoppingLists.find(l => l.id === listId);
    if (!list || !list.items) return;
    const updates: { [key: string]: null } = {};
    list.items.forEach(item => {
      if (item.checked) {
        updates[`shoppingLists/${listId}/items/${item.id}`] = null;
      }
    });
    const db = getDatabase(firebaseApp);
    update(ref(db, `users/${user.uid}`), updates);
  };

  const handleAddItemToList = (name: string, quantity: number) => {
    if (!user || !selectedListId) return;
    const itemsRef = getListRef(selectedListId, 'items');
    const newId = push(itemsRef).key!;
    const newItem: Omit<ShoppingListItem, 'id'> = { name, quantity, checked: false };
    set(ref(itemsRef, newId), newItem);
  };

  const handleCreateListSave = (name: string, callback: (newList: ShoppingList) => void) => {
    if (!user || !name.trim()) return;
    const listsRef = getDbRef('shoppingLists');
    const newId = push(listsRef).key!;
    const newList: Omit<ShoppingList, 'id'> = { name: name.trim(), shared: false, items: [] };
    set(ref(listsRef, newId), newList);
    callback({ ...newList, id: newId });
  };
  
  const handleDeleteList = (listId: string) => {
    if (!user) return;
    remove(getDbRef(`shoppingLists/${listId}`));
    if (selectedListId === listId) {
      const remainingLists = shoppingLists.filter(l => l.id !== listId);
      setSelectedListId(remainingLists[0]?.id || null);
    }
  };
  
  const handleRenameList = (listId: string, newName: string, callback: () => void) => {
     if (!user || !newName.trim()) return;
     update(getDbRef(`shoppingLists/${listId}`), { name: newName.trim() });
     callback();
  };
  
  const handleStartRenameList = () => {};

  const handleFinishList = (listId: string) => {
     if (!user) return;
     const list = shoppingLists.find(l => l.id === listId);
     if (!list) return;

     const itemsToAdd = list.items.filter(item => item.checked);
     if(itemsToAdd.length > 0) {
        addItemsToPantry(itemsToAdd);
     }
     
     handleClearCompletedItems(listId);
  }

  const value = {
    transactions, addTransaction, updateTransaction, deleteTransaction,
    accounts, addAccount, updateAccount, deleteAccount, 
    cards, addCard, updateCard, deleteCard, 
    incomeCategories, expenseCategories,
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
