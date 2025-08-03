

'use client';

import React, { createContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { getDatabase, ref, onValue, set, push, remove, update, child } from 'firebase/database';
import type { Transaction } from '@/components/finance/transactions-table';
import { addMonths, format, isSameMonth, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { app as firebaseApp } from '@/lib/firebase';
import { createCalendarEvent } from '@/ai/tools/app-tools';

// --- Default Data for New Users ---
const initialTransactions: Transaction[] = [
    { id: '1', description: 'Salário', amount: 5000, date: format(new Date(), 'yyyy-MM-dd'), type: 'income', category: 'Salário', paid: true, isRecurring: true, frequency: 'monthly' },
    { id: '2', description: 'Aluguel', amount: -1500, date: format(new Date(), 'yyyy-MM-10'), type: 'expense', category: 'Moradia', paid: false, isRecurring: true, frequency: 'monthly' },
];
const initialAccounts: Account[] = [ { id: 'acc1', name: 'Conta Corrente', balance: 3500, type: 'checking', holder: 'Pessoa 1', bankName: 'nubank' } ];
const initialCards = [ { id: 'card1', name: 'Cartão de Crédito', limit: 5000, dueDay: 10, holder: 'Pessoa 1', brand: 'visa' as const } ];
const initialIncomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
const initialExpenseCategories = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Compras', 'Transferência', 'Investimento', 'Outros', 'Pagamento de Fatura'];
const initialPantryCategories: PantryCategory[] = [ 'Laticínios', 'Carnes', 'Peixes', 'Frutas e Vegetais', 'Grãos e Cereais', 'Enlatados e Conservas', 'Bebidas', 'Higiene e Limpeza', 'Outros' ];
const initialPantryItems: PantryItem[] = [];
const initialTasks: Task[] = [ { id: 'task1', text: 'Pagar conta de luz', completed: false } ];
const initialGoals: Goal[] = [ { id: 'goal1', name: 'Viagem para a praia', targetAmount: 3500, currentAmount: 1200, imageUrl: 'https://placehold.co/600x400.png', completed: false, milestones: [] } ];
const initialWishes: Wish[] = [ { id: 'wish1', name: 'Liquidificador Novo', price: 250, purchased: false, imageUrl: 'https://placehold.co/600x400.png', link: '' } ];
const initialAppointments: Appointment[] = [];
const initialMemories: Memory[] = [];
const initialShoppingLists: ShoppingList[] = [ { id: 'list1', name: 'Mercado', shared: true, items: [ { id: 'item1', name: 'Leite Integral', quantity: 1, checked: false } ] } ];
const initialPets: Pet[] = [];
const allAchievements: Achievement[] = [
    { id: 'goal1', name: 'Conquistador', description: 'Atingiu a primeira meta', icon: '🏆' },
    { id: 'goal5', name: 'Planejador Mestre', description: 'Atingiu 5 metas', icon: '🏅' },
    { id: 'memory1', name: 'Guardião de Memórias', description: 'Adicionou a primeira memória', icon: '📸' },
    { id: 'memory10', name: 'Contador de Histórias', description: 'Adicionou 10 memórias', icon: '📚' },
    { id: 'recipe1', name: 'Mestre Cuca', description: 'Cozinhou 1 receita da IA', icon: '🧑‍🍳' },
    { id: 'trip1', name: 'Explorador', description: 'Planejou a primeira viagem', icon: '✈️' },
];


export type VoucherBrand = 'ticket' | 'vr' | 'alelo' | 'other';
export type BankName = 'itau' | 'bradesco' | 'santander' | 'bb' | 'caixa' | 'nubank' | 'inter' | 'other';

export type Account = { 
    id: string; 
    name: string; 
    balance: number; 
    type: 'checking' | 'savings' | 'voucher';
    holder: string;
    // Bank specific fields
    bankName?: BankName;
    // Voucher specific fields
    brand?: VoucherBrand;
    benefitDay?: number;
}
export type Card = { id: string; name: string; limit: number; dueDay: number; holder: string; brand: 'visa' | 'mastercard' | 'elo' | 'amex'; };
export type Appointment = { id: string; title: string; date: string; time?: string; category: string; notes?: string; googleEventId?: string; accessToken?: string; };
export type PantryCategory = string;
export type PantryItem = { id: string; name: string; quantity: number; pantryCategory: PantryCategory; }
export type Task = { id: string; text: string; completed: boolean; };
export type Milestone = { id: string; name: string; cost: number; completed: boolean };
export type Goal = { id: string; name: string; targetAmount: number; currentAmount: number; imageUrl?: string; completed: boolean; milestones?: Milestone[]; };
export type Wish = { id: string; name: string; price: number; link?: string; imageUrl?: string; purchased: boolean; };
export type ShoppingListItem = { id: string; name: string; quantity: number; checked: boolean; price?: number; };
export type ShoppingList = { id: string; name: string; items: ShoppingListItem[]; shared: boolean; };
export type Memory = { id: string; title: string; description: string; date: string; imageUrl?: string; };
export type Achievement = { id: string; name: string; description: string; icon: string; };

export type Medication = {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
}
export type HealthInfo = {
    bloodType?: string;
    allergies?: string;
    healthPlan?: string;
    emergencyContact?: string;
    medications?: Medication[];
};

export type HealthRecordType = 'vaccine' | 'dewormer' | 'flea_tick' | 'consultation' | 'other';
export type HealthRecord = {
    id: string;
    type: HealthRecordType;
    date: string;
    description: string;
    notes?: string;
    nextDueDate?: string;
};

export type Pet = {
    id: string;
    name: string;
    species: 'cat' | 'dog' | 'other';
    breed?: string;
    birthDate: string;
    imageUrl?: string;
    microchip?: string;
    healthRecords?: HealthRecord[];
    neutered?: boolean;
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
  toggleTransactionPaid: (id: string, currentStatus: boolean) => void;
  deleteRecurringTransaction: (id: string) => void;
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
  updateIncomeCategory: (oldName: string, newName: string) => void;
  updateExpenseCategory: (oldName: string, newName: string) => void;
  totalIncome: () => number;
  totalExpenses: () => number;
  totalBalance: () => number;
  countRecurringTransactions: () => number;
  isSensitiveDataVisible: boolean;
  toggleSensitiveDataVisibility: () => void;
  formatCurrency: (value: number, forceVisible?: boolean) => string;
  resetAllData: () => void;
  pantryItems: PantryItem[];
  addItemsToPantry: (items: { name: string, quantity: number }[]) => void;
  addItemToPantry: (name: string, quantity: number, category: string) => void;
  updatePantryItemQuantity: (itemId: string, newQuantity: number) => void;
  pantryCategories: PantryCategory[];
  addPantryCategory: (name: string) => void;
  deletePantryCategory: (name: string) => void;
  updatePantryCategory: (oldName: string, newName: string) => void;
  tasks: Task[];
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>, milestones: Omit<Milestone, 'id' | 'completed'>[]) => void;
  updateGoal: (id: string, goal: Partial<Omit<Goal, 'id'>>, milestones: Omit<Milestone, 'id' | 'completed'>[]) => void;
  deleteGoal: (id: string) => void;
  addGoalProgress: (id: string, amount: number, accountId: string) => void;
  toggleGoalCompleted: (id: string) => void;
  toggleMilestoneCompleted: (goalId: string, milestoneId: string) => void;
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
  handleSetPrice: (itemId: string, price: number, quantity: number) => void;
  handleCheckboxChange: (item: ShoppingListItem) => void;
  handleDeleteItem: (itemId: string) => void;
  handleUpdateItem: (itemId: string, name: string, quantity: number) => void;
  handleClearCompletedItems: (listId: string) => void;
  handleAddItemToList: (name: string, quantity: number) => void;
  handleCreateListSave: (name: string, callback: (newList: ShoppingList) => void) => void;
  handleDeleteList: (listId: string) => void;
  handleStartRenameList: (list: ShoppingList) => void;
  handleRenameList: (listId: string, newName: string, callback: () => void) => void;
  handleFinishList: (list: ShoppingList, transactionDetails: Omit<Transaction, 'id' | 'amount' | 'description'>, discount?: number) => void;
  handlePayCardBill: (card: Card, amount: number, accountId: string) => void;
  memories: Memory[];
  addMemory: (memory: Omit<Memory, 'id'>) => void;
  achievements: Achievement[];
  googleEvents: any[];
  setGoogleEvents: React.Dispatch<React.SetStateAction<any[]>>;
  pets: Pet[];
  addPet: (pet: Omit<Pet, 'id'>) => void;
  updatePet: (id: string, pet: Partial<Omit<Pet, 'id'>>) => void;
  deletePet: (id: string) => void;
  addHealthRecord: (petId: string, record: Omit<HealthRecord, 'id'>) => void;
  addMedication: (personKey: 'healthInfo1' | 'healthInfo2', medication: Omit<Medication, 'id'>) => void;
  updateMedication: (personKey: 'healthInfo1' | 'healthInfo2', medication: Medication) => void;
  deleteMedication: (personKey: 'healthInfo1' | 'healthInfo2', medicationId: string) => void;
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
  const [goals, setGoals] = useState<Goal[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  
  const [isSensitiveDataVisible, setIsSensitiveDataVisible] = useState(true);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  
  const [googleEvents, setGoogleEventsState] = useState<any[]>([]);

  const selectedList = useMemo(() => {
    return shoppingLists.find(list => list.id === selectedListId) || null;
  }, [shoppingLists, selectedListId]);

  // Wrapper for setGoogleEvents to also save to localStorage
  const setGoogleEvents = useCallback((events: any[]) => {
      setGoogleEventsState(events);
      if (typeof window !== 'undefined') {
          sessionStorage.setItem('google_events', JSON.stringify(events));
      }
  }, []);
  
  const getDbRef = useCallback((path: string) => {
    if (!user) throw new Error("User not authenticated to get DB ref.");
    const db = getDatabase(firebaseApp);
    return ref(db, `users/${user.uid}/${path}`);
  }, [user]);
  
  const checkForAchievements = useCallback(() => {
    if(!user) return;

    const completedGoalsCount = goals.filter(g => g.completed).length;
    const memoriesCount = memories.length;

    const unlocked: Achievement[] = [];
    if(completedGoalsCount >= 1) unlocked.push(allAchievements.find(a => a.id === 'goal1')!);
    if(completedGoalsCount >= 5) unlocked.push(allAchievements.find(a => a.id === 'goal5')!);
    if(memoriesCount >= 1) unlocked.push(allAchievements.find(a => a.id === 'memory1')!);
    if(memoriesCount >= 10) unlocked.push(allAchievements.find(a => a.id === 'memory10')!);

    const currentAchievementIds = achievements.map(a => a.id);
    const newAchievements = unlocked.filter(a => a && !currentAchievementIds.includes(a.id));

    if(newAchievements.length > 0){
        const allNewAchievements = [...achievements, ...newAchievements];
        set(getDbRef('achievements'), allNewAchievements.map(a => ({...a})));
        
        newAchievements.forEach(a => {
            toast({ title: '🏆 Conquista Desbloqueada!', description: `Você ganhou: ${a.name}`});
        });
    }

  }, [user, goals, memories, achievements, getDbRef, toast]);

  useEffect(() => {
    checkForAchievements();
  }, [goals, memories, checkForAchievements]);
  
  useEffect(() => {
    if (user) {
        // Load events from localStorage first
        if (typeof window !== 'undefined') {
            const savedEvents = sessionStorage.getItem('google_events');
            if (savedEvents) {
                setGoogleEventsState(JSON.parse(savedEvents));
            }
        }

        const db = getDatabase(firebaseApp);
        const userRef = ref(db, `users/${user.uid}`);
        
        const unsubscribe = onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const transformDataWithSubItems = (d: any, subItemKey: string) => {
                  if (!d) return [];
                  return Object.keys(d).map(key => {
                    const item = { id: key, ...d[key] };
                    if (item[subItemKey]) {
                      item[subItemKey] = Object.keys(item[subItemKey]).map(subKey => ({ id: subKey, ...item[subItemKey][subKey]}));
                    } else {
                      item[subItemKey] = [];
                    }
                    return item;
                  });
                }

                const transformHealthInfo = (profileData: any) => {
                  if (!profileData) return {};
                  const newProfile = {...profileData};
                  if(newProfile.healthInfo1?.medications) {
                    newProfile.healthInfo1.medications = Object.keys(newProfile.healthInfo1.medications).map(key => ({ id: key, ...newProfile.healthInfo1.medications[key]}));
                  }
                   if(newProfile.healthInfo2?.medications) {
                    newProfile.healthInfo2.medications = Object.keys(newProfile.healthInfo2.medications).map(key => ({ id: key, ...newProfile.healthInfo2.medications[key]}));
                  }
                  return newProfile;
                }

                const transformData = (d: any) => d ? Object.keys(d).map(key => ({ id: key, ...d[key] })) : [];
                setTransactions(transformData(data.transactions));
                setAccounts(transformData(data.accounts));
                setCards(transformData(data.cards));
                setIncomeCategories(data.incomeCategories || initialIncomeCategories);
                setExpenseCategories(data.expenseCategories || initialExpenseCategories);
                setPantryItems(transformData(data.pantryItems));
                setPantryCategories(data.pantryCategories || initialPantryCategories);
                setTasks(transformData(data.tasks));
                setGoals(transformDataWithSubItems(data.goals, 'milestones'));
                setWishes(transformData(data.wishes));
                setAppointments(transformData(data.appointments));
                setMemories(transformData(data.memories));
                setAchievements(data.achievements || []);
                setPets(transformDataWithSubItems(data.pets, 'healthRecords'));
                const dbShoppingLists: ShoppingList[] = transformDataWithSubItems(data.shoppingLists, 'items');
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
                    goals: Object.fromEntries(initialGoals.map(g => [g.id, g])),
                    wishes: Object.fromEntries(initialWishes.map(w => [w.id, w])),
                    appointments: {},
                    memories: {},
                    shoppingLists: Object.fromEntries(initialShoppingLists.map(l => [l.id, l])),
                    achievements: [],
                    pets: {},
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
        setGoals([]);
        setWishes([]);
        setAppointments([]);
        setMemories([]);
        setAchievements([]);
        setPets([]);
        setShoppingLists([]);
        setSelectedListId(null);
        setGoogleEvents([]);
        if(typeof window !== 'undefined') sessionStorage.removeItem('google_events');
    }
}, [user, selectedListId, setGoogleEvents]);

  useEffect(() => {
    if (shoppingLists.length > 0 && !shoppingLists.find(l => l.id === selectedListId)) {
        setSelectedListId(shoppingLists[0]?.id || null);
    }
  }, [shoppingLists, selectedListId]);


  const toggleSensitiveDataVisibility = () => setIsSensitiveDataVisible(prev => !prev);

  const formatCurrency = (value: number, forceVisible: boolean = false) => {
    if (!isSensitiveDataVisible && !forceVisible) return 'R$ ••••••';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const addTransaction = (transaction: Omit<Transaction, 'id'>, installments: number = 1) => {
    if (!user) return;
    
    const updates: { [key: string]: any } = {};
    const rootRef = getDbRef('');

    // Handle Balance Update if the transaction is paid
    if (transaction.paid) {
        if (transaction.type === 'transfer') {
            const fromAccount = accounts.find(a => a.name === transaction.fromAccount);
            const toAccount = accounts.find(a => a.name === transaction.toAccount);
            if (fromAccount && toAccount) {
                updates[`accounts/${fromAccount.id}/balance`] = fromAccount.balance - Math.abs(transaction.amount || 0);
                updates[`accounts/${toAccount.id}/balance`] = toAccount.balance + Math.abs(transaction.amount || 0);
            }
        } else if (transaction.account) {
            const allAccountsAndCards = [...accounts, ...cards];
            const targetAccount = allAccountsAndCards.find(a => a.name === transaction.account);
            if (targetAccount && 'balance' in targetAccount) {
                 updates[`accounts/${targetAccount.id}/balance`] = targetAccount.balance + (transaction.amount || 0);
            }
        }
    }
    
    // Add transaction and update goal if linked
    if (transaction.type === 'expense' && transaction.linkedGoalId) {
        const goal = goals.find(g => g.id === transaction.linkedGoalId);
        if(goal) {
            const newCurrentAmount = goal.currentAmount + Math.abs(transaction.amount || 0);
            updates[`goals/${goal.id}/currentAmount`] = newCurrentAmount;
        }
    }


    if (transaction.type !== 'transfer' && installments > 1 && transaction.account && cards.some(c => c.name === transaction.account)) {
        const installmentAmount = (transaction.amount || 0) / installments;
        const installmentGroupId = push(child(rootRef, 'transactions')).key!;

        for (let i = 1; i <= installments; i++) {
            const installmentDate = addMonths(new Date(transaction.date + 'T00:00:00'), i - 1);
            const newTransaction: Partial<Transaction> = {
                ...transaction,
                amount: installmentAmount,
                date: format(installmentDate, 'yyyy-MM-dd'),
                paid: false, // Future installments are not paid yet
                installmentGroupId,
                currentInstallment: i,
                totalInstallments: installments,
                isRecurring: false,
            };
            const newId = push(child(rootRef, 'transactions')).key!;
            updates[`transactions/${newId}`] = newTransaction;
        }
    } else {
        const newId = push(child(rootRef, 'transactions')).key!;
        updates[`transactions/${newId}`] = transaction;
    }
    
    update(rootRef, updates);
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Omit<Transaction, 'id'>>) => {
    if (!user) return;

    const originalTransaction = transactions.find(t => t.id === id);
    if (!originalTransaction) return;

    const updates: { [key: string]: any } = {};
    const allAccountsAndCards = [...accounts, ...cards];
    const account = allAccountsAndCards.find(acc => acc.name === originalTransaction.account);
    
    if (account && 'balance' in account) {
        const originalAmount = originalTransaction.amount;
        const newAmount = updatedTransaction.amount ?? originalAmount;

        let balanceChange = 0;
        if (originalTransaction.paid) {
            balanceChange -= originalAmount;
        }
        if (updatedTransaction.paid) {
            balanceChange += newAmount;
        }

        if (balanceChange !== 0) {
            updates[`accounts/${account.id}/balance`] = account.balance + balanceChange;
        }
    }
    
    const finalUpdate: Partial<Transaction> = { ...updatedTransaction };
    Object.keys(finalUpdate).forEach(key => {
        const k = key as keyof typeof finalUpdate;
        if (finalUpdate[k] === undefined) {
            delete finalUpdate[k];
        }
    });

    updates[`transactions/${id}`] = { ...originalTransaction, ...finalUpdate };
    update(getDbRef(''), updates);
  };
  
  const toggleTransactionPaid = (id: string, currentStatus: boolean) => {
    if (!user) return;
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    const updates: { [key: string]: any } = {};
    updates[`transactions/${id}/paid`] = !currentStatus;

    if (transaction.account) {
        const allAccountsAndCards = [...accounts, ...cards];
        const account = allAccountsAndCards.find(acc => acc.name === transaction.account);
        if (account && 'balance' in account) {
            const amount = transaction.amount;
            const newBalance = currentStatus ? account.balance - amount : account.balance + amount;
            updates[`accounts/${account.id}/balance`] = newBalance;
        }
    }
    update(getDbRef(''), updates);
  }

  const deleteTransaction = (id: string) => {
    if (!user) return;
    const transactionToDelete = transactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    const updates: { [key: string]: null | number } = {};
    updates[`transactions/${id}`] = null;

    if (transactionToDelete.paid && transactionToDelete.account) {
        const allAccountsAndCards = [...accounts, ...cards];
        const account = allAccountsAndCards.find(acc => acc.name === transactionToDelete.account);
        if (account && 'balance' in account) {
            updates[`accounts/${account.id}/balance`] = account.balance - transactionToDelete.amount;
        }
    }

    update(getDbRef(''), updates);
  };
  
  const deleteRecurringTransaction = (id: string) => {
    if (!user) return;
    remove(getDbRef(`transactions/${id}`));
  };

  const totalIncome = useCallback(() => {
    const today = new Date();
    return transactions
      .filter((t) => t.type === 'income' && t.paid && isSameMonth(new Date(t.date + 'T00:00:00'), today))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpenses = useCallback(() => {
    const today = new Date();
    return transactions
      .filter((t) => t.type === 'expense' && t.paid && isSameMonth(new Date(t.date + 'T00:00:00'), today))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalBalance = useCallback(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);

  const countRecurringTransactions = useCallback(() => transactions.filter(t => t.isRecurring).length, [transactions]);
  
  const resetAllData = () => {
    if (!user) return;
    const database = getDatabase(firebaseApp);
    const updates: { [key: string]: null } = {};
    const pathsToDelete = ['transactions', 'accounts', 'cards', 'pantryItems', 'tasks', 'goals', 'wishes', 'appointments', 'shoppingLists', 'memories', 'pets'];
    pathsToDelete.forEach(path => {
        updates[`users/${user.uid}/${path}`] = null;
    });
    update(ref(database), updates);
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
    const updates: any = {};
    updates[`pantryCategories`] = updatedCategories;

    pantryItems.forEach(item => {
        if(item.pantryCategory === name) {
            updates[`pantryItems/${item.id}/pantryCategory`] = 'Outros';
        }
    });
    update(getDbRef(''), updates);
  };

  const updatePantryCategory = (oldName: string, newName: string) => {
    if (!user || oldName === newName) return;
    const updatedCategories = pantryCategories.map(cat => cat === oldName ? newName : cat);
    const updates: any = {};
    updates[`pantryCategories`] = updatedCategories;
    
    pantryItems.forEach(item => {
        if(item.pantryCategory === oldName) {
            updates[`pantryItems/${item.id}/pantryCategory`] = newName;
        }
    });
    update(getDbRef(''), updates);
  };

  const updateIncomeCategory = (oldName: string, newName: string) => {
    if (!user || oldName === newName) return;
    const updatedCategories = incomeCategories.map(cat => cat === oldName ? newName : cat);
    const updates: any = {};
    updates['incomeCategories'] = updatedCategories;

    transactions.forEach(t => {
      if (t.type === 'income' && t.category === oldName) {
        updates[`transactions/${t.id}/category`] = newName;
      }
    });
    update(getDbRef(''), updates);
  };
  
  const updateExpenseCategory = (oldName: string, newName: string) => {
    if (!user || oldName === newName) return;
    const updatedCategories = expenseCategories.map(cat => cat === oldName ? newName : cat);
    const updates: any = {};
    updates['expenseCategories'] = updatedCategories;

    transactions.forEach(t => {
      if (t.type === 'expense' && t.category === oldName) {
        updates[`transactions/${t.id}/category`] = newName;
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
  
  // Goal Management
  const addGoal = (goal: Omit<Goal, 'id' | 'completed'>, milestones: Omit<Milestone, 'id' | 'completed'>[]) => {
    if (!user) return;
    const newId = push(getDbRef('goals')).key!;
    const newGoal: Omit<Goal, 'id'> = { ...goal, completed: false, milestones: [] };
    const goalUpdates: { [key: string]: any } = {};
    goalUpdates[`goals/${newId}`] = newGoal;
    
    milestones.forEach(ms => {
        const msId = push(child(getDbRef('goals'), `${newId}/milestones`)).key!;
        goalUpdates[`goals/${newId}/milestones/${msId}`] = ms;
    });

    update(getDbRef(''), goalUpdates);
  };

  const updateGoal = (id: string, updatedGoal: Partial<Omit<Goal, 'id'>>, milestones: Omit<Milestone, 'id' | 'completed'>[]) => {
      if (!user) return;
      const updates: { [key: string]: any } = {};
      
      const goalToUpdate = { ...goals.find(g => g.id === id)!, ...updatedGoal };

      // Atomically update each field of the goal object
      Object.keys(updatedGoal).forEach(key => {
        const goalKey = key as keyof typeof updatedGoal;
        updates[`goals/${id}/${goalKey}`] = updatedGoal[goalKey];
      });
      
      // Handle milestones
      const existingMilestoneIds = goalToUpdate.milestones?.map(ms => ms.id) || [];
      const updatedMilestoneIds = milestones.map(ms => 'id' in ms ? ms.id : undefined).filter(Boolean);

      // Delete removed milestones
      existingMilestoneIds.forEach(existingId => {
          if (!updatedMilestoneIds.includes(existingId)) {
              updates[`goals/${id}/milestones/${existingId}`] = null;
          }
      });
      
      // Add or update milestones
      milestones.forEach(ms => {
          const msId = 'id' in ms ? ms.id : push(child(getDbRef('goals'), `${id}/milestones`)).key!;
          updates[`goals/${id}/milestones/${msId}`] = { name: ms.name, cost: ms.cost, completed: ms.completed || false };
      });
      
      update(getDbRef(''), updates);
  };

  const deleteGoal = (id: string) => {
      if (!user) return;
      remove(getDbRef(`goals/${id}`));
  };

  const addGoalProgress = (goalId: string, amount: number, accountId: string) => {
      if (!user) return;
      const goal = goals.find(g => g.id === goalId);
      const account = accounts.find(a => a.id === accountId);

      if (goal && account) {
          if (account.balance < amount) {
              toast({ variant: 'destructive', title: 'Saldo Insuficiente', description: `A conta ${account.name} não tem saldo suficiente.` });
              return;
          }

          const newGoalAmount = goal.currentAmount + amount;

          const updates: { [key: string]: any } = {};
          updates[`goals/${goalId}/currentAmount`] = newGoalAmount;
          
          const newTransaction: Omit<Transaction, 'id'> = {
            description: `Contribuição para meta: ${goal.name}`,
            amount: -Math.abs(amount),
            date: format(new Date(), 'yyyy-MM-dd'),
            type: 'expense',
            category: 'Investimento',
            account: account.name,
            paid: true, // This transaction is immediately settled
          };
          
          const newTransactionId = push(getDbRef('transactions')).key!;
          updates[`transactions/${newTransactionId}`] = newTransaction;

          // Also update the account balance
          updates[`accounts/${accountId}/balance`] = account.balance - amount;
          
          update(getDbRef(''), updates);
          
          toast({ title: 'Progresso Adicionado!', description: `${formatCurrency(amount, true)} adicionado à meta "${goal.name}".`});
      }
  };

  const toggleGoalCompleted = (id: string) => {
    if (!user) return;
    const goal = goals.find(g => g.id === id);
    if (goal) {
        const isCompleted = !goal.completed;
        update(getDbRef(`goals/${id}`), { completed: isCompleted });
        toast({ title: `Meta ${isCompleted ? 'concluída' : 'reativada'}!`, description: `A meta "${goal.name}" foi atualizada.` });
    }
  };
  
  const toggleMilestoneCompleted = (goalId: string, milestoneId: string) => {
    if (!user) return;
    const goal = goals.find(g => g.id === goalId);
    const milestone = goal?.milestones?.find(ms => ms.id === milestoneId);
    if (goal && milestone) {
        update(getDbRef(`goals/${goalId}/milestones/${milestoneId}`), { completed: !milestone.completed });
    }
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
  
  const [appointmentCategories] = useState<string[]>(['Trabalho', 'Saúde', 'Social', 'Pessoal', 'Google', 'Outros']);

  // Appointment Management
  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    if (!user) return;

    createCalendarEvent({ userId: user.uid, ...appointment }).then(result => {
        let newAppointmentData: Omit<Appointment, 'id'> = { ...appointment };
        if (result.success && result.googleEventId) {
            newAppointmentData.googleEventId = result.googleEventId;
        }
        delete newAppointmentData.accessToken; // Remove token before saving to DB
        
        const newId = push(getDbRef('appointments')).key!;
        set(getDbRef(`appointments/${newId}`), newAppointmentData);
    });
  };

  const updateAppointment = (id: string, updatedAppointment: Partial<Omit<Appointment, 'id'>>) => {
    if (!user) return;
    // For now, only update in Firebase. Google Calendar update is more complex.
    delete updatedAppointment.accessToken; // Ensure token is not saved
    update(getDbRef(`appointments/${id}`), updatedAppointment);
  };

  const deleteAppointment = (id: string) => {
    if (!user) return;
    // For now, only delete from Firebase. Google Calendar delete is more complex.
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
    if (!user) return;
    const accountToDelete = accounts.find(acc => acc.id === id);
    if (!accountToDelete) return;
  
    const updates: { [key: string]: null } = {};
    updates[`accounts/${id}`] = null;
  
    // Using account name is fragile, but it's what we have. A better approach would be an accountId on transactions.
    const transactionsToDelete = transactions.filter(t => t.account === accountToDelete.name);
    transactionsToDelete.forEach(t => {
        updates[`transactions/${t.id}`] = null;
    });
  
    update(getDbRef(''), updates);
  };

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
    if (!user) return;
    const cardToDelete = cards.find(c => c.id === id);
    if (!cardToDelete) return;
  
    const updates: { [key: string]: null } = {};
    updates[`cards/${id}`] = null;
  
    // Using card name is fragile
    const transactionsToDelete = transactions.filter(t => t.account === cardToDelete.name);
    transactionsToDelete.forEach(t => {
        updates[`transactions/${t.id}`] = null;
    });
  
    update(getDbRef(''), updates);
  };


  // Shopping List Management
  const getListRef = useCallback((listId: string, path?: string) => {
    let fullPath = `shoppingLists/${listId}`;
    if (path) {
      fullPath += `/${path}`;
    }
    return getDbRef(fullPath);
  }, [getDbRef]);

  const handleSetPrice = useCallback((itemId: string, price: number, quantity: number) => {
    if (!user || !selectedListId) return;
    const itemRef = getListRef(selectedListId, `items/${itemId}`);
    update(itemRef, { price, quantity, checked: true });
  }, [user, selectedListId, getListRef]);
  
  const handleCheckboxChange = useCallback((item: ShoppingListItem) => {
    if (!user || !selectedListId) return;
    const itemRef = getListRef(selectedListId, `items/${item.id}`);
    update(itemRef, { checked: !item.checked, price: item.checked ? null : item.price });
  }, [user, selectedListId, getListRef]);

  const handleDeleteItem = useCallback((itemId: string) => {
    if (!user || !selectedListId) return;
    const itemRef = getListRef(selectedListId, `items/${itemId}`);
    remove(itemRef);
  }, [user, selectedListId, getListRef]);
  
  const handleUpdateItem = useCallback((itemId: string, name: string, quantity: number) => {
    if (!user || !selectedListId) return;
    const itemRef = getListRef(selectedListId, `items/${itemId}`);
    update(itemRef, { name, quantity });
  }, [user, selectedListId, getListRef]);
  
  const handleClearCompletedItems = useCallback((listId: string) => {
    if (!user) return;
    const list = shoppingLists.find(l => l.id === listId);
    if (!list || !list.items) return;
    const updates: { [key: string]: null } = {};
    list.items.forEach(item => {
      if (item.checked) {
        updates[`shoppingLists/${listId}/items/${item.id}`] = null;
      }
    });
    update(getDbRef(''), updates);
  }, [user, shoppingLists, getDbRef]);

  const handleAddItemToList = useCallback((name: string, quantity: number) => {
    if (!user || !selectedListId) return;
    const itemsRef = getListRef(selectedListId, 'items');
    const newId = push(itemsRef).key!;
    const newItem: Omit<ShoppingListItem, 'id'> = { name, quantity, checked: false };
    set(child(itemsRef, newId), newItem);
  }, [user, selectedListId, getListRef]);

  const handleCreateListSave = useCallback((name: string, callback: (newList: ShoppingList) => void) => {
    if (!user || !name.trim()) return;
    const listsRef = getDbRef('shoppingLists');
    const newId = push(listsRef).key!;
    const newList: Omit<ShoppingList, 'id'> = { name: name.trim(), shared: false, items: [] };
    set(child(listsRef, newId), newList);
    callback({ ...newList, id: newId });
  }, [user, getDbRef]);
  
  const handleDeleteList = useCallback((listId: string) => {
    if (!user) return;
    remove(getDbRef(`shoppingLists/${listId}`));
    if (selectedListId === listId) {
      const remainingLists = shoppingLists.filter(l => l.id !== listId);
      setSelectedListId(remainingLists[0]?.id || null);
    }
  }, [user, getDbRef, selectedListId, shoppingLists]);
  
  const handleRenameList = useCallback((listId: string, newName: string, callback: () => void) => {
     if (!user || !newName.trim()) return;
     update(getDbRef(`shoppingLists/${listId}`), { name: newName.trim() });
     callback();
  }, [user, getDbRef]);
  
  const handleStartRenameList = () => {};

  const handleFinishList = useCallback((list: ShoppingList, transactionDetails: Omit<Transaction, 'id' | 'amount' | 'description'>, discount: number = 0) => {
     if (!user) return;

     const totalCost = list.items.reduce((sum, item) => item.checked && item.price ? sum + item.price : sum, 0);
     const finalCost = totalCost - discount;

     if (finalCost > 0) {
        const purchaseTransaction: Omit<Transaction, 'id'> = {
            ...transactionDetails,
            description: `Compra: ${list.name}`,
            amount: -finalCost, // as an expense
            type: 'expense',
            paid: true, // Purchase is immediately settled
            date: format(new Date(), 'yyyy-MM-dd'),
        };
        addTransaction(purchaseTransaction);
     }
     
     const itemsToAdd = list.items.filter(item => item.checked);
     if(itemsToAdd.length > 0) {
        addItemsToPantry(itemsToAdd);
     }
     
     handleClearCompletedItems(list.id);
  }, [user, addTransaction, addItemsToPantry, handleClearCompletedItems]);

  const handlePayCardBill = useCallback((card: Card, amount: number, accountId: string) => {
    if(!user) return;
    const account = accounts.find(a => a.id === accountId);
    if(!account) {
        toast({ variant: 'destructive', title: 'Conta não encontrada' });
        return;
    }
    if(account.balance < amount) {
        toast({ variant: 'destructive', title: 'Saldo insuficiente', description: `A conta ${account.name} não possui saldo para o pagamento.`});
        return;
    }
    
    const updates: { [key: string]: any } = {};

    // 1. Debit from bank account
    const newBalance = account.balance - amount;
    updates[`accounts/${accountId}/balance`] = newBalance;
    
    // 2. Create debit transaction for bank account
    const debitTransaction: Omit<Transaction, 'id'> = {
        description: `Pagamento Fatura ${card.name}`,
        amount: -amount,
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'expense',
        category: 'Pagamento de Fatura',
        account: account.name,
        paid: true,
    };
    const debitTransId = push(getDbRef('transactions')).key!;
    updates[`transactions/${debitTransId}`] = debitTransaction;
    
    // 3. Create credit transaction for the card
    const creditTransaction: Omit<Transaction, 'id'> = {
        description: `Pagamento Recebido`,
        amount: amount,
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'income',
        category: 'Pagamento de Fatura',
        account: card.name,
        paid: true,
    };
    const creditTransId = push(getDbRef('transactions')).key!;
    updates[`transactions/${creditTransId}`] = creditTransaction;

    update(getDbRef(''), updates);
    toast({ title: 'Fatura Paga!', description: `${formatCurrency(amount, true)} para o cartão ${card.name} foi registrado.`})

  }, [user, accounts, getDbRef, toast, formatCurrency]);

  // Memory Management
  const addMemory = (memory: Omit<Memory, 'id'>) => {
    if (!user) return;
    const newId = push(getDbRef('memories')).key!;
    set(getDbRef(`memories/${newId}`), memory);
  };
  
  // Pet Management
  const addPet = (pet: Omit<Pet, 'id'>) => {
      if(!user) return;
      const newId = push(getDbRef('pets')).key!;
      set(getDbRef(`pets/${newId}`), pet);
  };
  const updatePet = (id: string, pet: Partial<Omit<Pet, 'id'>>) => {
      if(!user) return;
      update(getDbRef(`pets/${id}`), pet);
  };
  const deletePet = (id: string) => {
      if(!user) return;
      remove(getDbRef(`pets/${id}`));
  };
   const addHealthRecord = (petId: string, record: Omit<HealthRecord, 'id'>) => {
    if (!user) return;
    const recordsRef = getDbRef(`pets/${petId}/healthRecords`);
    const newRecordId = push(recordsRef).key;
    if (newRecordId) {
        const finalRecord: any = { ...record };
        // Remove undefined fields before saving
        if (finalRecord.notes === undefined || finalRecord.notes === '') delete finalRecord.notes;
        if (finalRecord.nextDueDate === undefined || finalRecord.nextDueDate === '') delete finalRecord.nextDueDate;
        set(child(recordsRef, newRecordId), finalRecord);
    }
  };

  // Health Management
    const addMedication = (personKey: 'healthInfo1' | 'healthInfo2', medication: Omit<Medication, 'id'>) => {
        if (!user) return;
        const medicationsRef = getDbRef(`profile/${personKey}/medications`);
        const newId = push(medicationsRef).key!;
        set(child(medicationsRef, newId), medication);
    };

    const updateMedication = (personKey: 'healthInfo1' | 'healthInfo2', medication: Medication) => {
        if (!user) return;
        const medicationRef = getDbRef(`profile/${personKey}/medications/${medication.id}`);
        update(medicationRef, { name: medication.name, dosage: medication.dosage, frequency: medication.frequency });
    };

    const deleteMedication = (personKey: 'healthInfo1' | 'healthInfo2', medicationId: string) => {
        if (!user) return;
        const medicationRef = getDbRef(`profile/${personKey}/medications/${medicationId}`);
        remove(medicationRef);
    };


  const value = {
    transactions, addTransaction, updateTransaction, deleteTransaction, toggleTransactionPaid, deleteRecurringTransaction,
    accounts, addAccount, updateAccount, deleteAccount, 
    cards, addCard, updateCard, deleteCard, 
    incomeCategories, expenseCategories, updateIncomeCategory, updateExpenseCategory,
    totalIncome, totalExpenses, totalBalance, countRecurringTransactions,
    isSensitiveDataVisible, toggleSensitiveDataVisibility, formatCurrency,
    resetAllData,
    pantryItems, addItemsToPantry, addItemToPantry, updatePantryItemQuantity,
    pantryCategories, addPantryCategory, deletePantryCategory, updatePantryCategory,
    tasks, addTask, toggleTask, deleteTask,
    goals, addGoal, updateGoal, deleteGoal, addGoalProgress, toggleGoalCompleted, toggleMilestoneCompleted,
    wishes, addWish, updateWish, deleteWish, toggleWishPurchased,
    appointments, appointmentCategories, addAppointment, updateAppointment, deleteAppointment,
    toast,
    shoppingLists, selectedListId, setSelectedListId, selectedList,
    handleSetPrice, handleCheckboxChange, handleDeleteItem, handleUpdateItem,
    handleClearCompletedItems, handleAddItemToList, handleCreateListSave,
    handleDeleteList, handleStartRenameList, handleRenameList, handleFinishList,
    handlePayCardBill,
    memories, addMemory,
    achievements,
    googleEvents, setGoogleEvents,
    pets, addPet, updatePet, deletePet, addHealthRecord,
    addMedication, updateMedication, deleteMedication,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
