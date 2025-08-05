'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CurrencyInput } from './currency-input';
import { useEffect, useContext, useMemo, useCallback } from 'react';
import { FinanceContext, Account, Transaction } from '@/contexts/finance-context';
import { Input } from '@/components/ui/input';
import { addMonths, format } from 'date-fns';

const incomeSchema = z.object({
  type: z.literal('income'),
  id: z.string().optional(),
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
  paid: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'annual']).optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  account: z.string().min(1, 'Conta/Cartão é obrigatório'),
  installments: z.coerce.number().min(1).optional(),
  linkedGoalId: z.string().optional(),
});

const expenseSchema = z.object({
  type: z.literal('expense'),
  id: z.string().optional(),
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
  paid: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'annual']).optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  account: z.string().min(1, 'Conta/Cartão é obrigatório'),
  installments: z.coerce.number().min(1).optional(),
  linkedGoalId: z.string().optional(),
});

const transferSchema = z.object({
  type: z.literal('transfer'),
  id: z.string().optional(),
  amount: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  date: z.string().min(1, "Data é obrigatória"),
  fromAccount: z.string().min(1, "Conta de origem é obrigatória"),
  toAccount: z.string().min(1, "Conta de destino é obrigatória"),
  paid: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'annual']).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  account: z.string().optional(),
  installments: z.coerce.number().min(1).optional(),
  linkedGoalId: z.string().optional(),
}).refine(data => data.fromAccount !== data.toAccount, {
  message: "Contas de origem e destino não podem ser iguais",
  path: ["toAccount"],
});

const transactionSchema = z.discriminatedUnion('type', [
  incomeSchema,
  expenseSchema,
  transferSchema,
]);


type TransactionFormData = z.infer<typeof transactionSchema>;

type AddTransactionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaveTransaction: (transaction: Omit<Transaction, 'id' | 'amount' > & { id?: string; amount: number; fromAccount?: string; toAccount?: string; }, installments?: number) => void;
  transaction: Transaction | null;
};

export function AddTransactionDialog({
  isOpen,
  onClose,
  onSaveTransaction,
  transaction,
}: AddTransactionDialogProps) {
  const isEditing = !!transaction;
  const { transactions, accounts, cards, incomeCategories, expenseCategories, goals, formatCurrency } = useContext(FinanceContext);

  const combinedAccounts = useMemo(() => [
      ...accounts.map(a => ({...a, id: a.id, name: a.name, type: a.type, limit: undefined})), 
      ...cards.map(c => ({...c, id: c.id, name: c.name, type: 'card' as const, balance: undefined}))
    ], [accounts, cards]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: '',
      category: '',
      account: '',
      paid: true,
      isRecurring: false,
      installments: 1,
      linkedGoalId: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      const defaultDate = new Date().toISOString().split('T')[0];
      if (transaction) {
         reset({
            ...transaction,
            date: transaction.date || defaultDate,
            amount: Math.abs(transaction.amount), // Form expects positive number
            installments: transaction.totalInstallments || 1,
            linkedGoalId: transaction.linkedGoalId || '',
          } as TransactionFormData); // Cast to avoid type issues with discriminated union
      } else {
         reset({
            type: 'expense',
            date: defaultDate,
            amount: 0,
            description: '',
            category: '',
            account: '',
            paid: true,
            isRecurring: false,
            installments: 1,
            linkedGoalId: '',
          });
      }
    }
  }, [transaction, isOpen, reset]);


  const transactionType = watch('type');
  const isRecurring = watch('isRecurring');
  
  const selectedAccountName = transactionType !== 'transfer' ? watch('account') : undefined;
  
  const amount = watch('amount');
  const installments = transactionType !== 'transfer' ? watch('installments') : 1;
  
  const selectedAccount = useMemo(() => {
    if (!selectedAccountName) return null;
    return combinedAccounts.find(acc => acc.name === selectedAccountName);
  }, [selectedAccountName, combinedAccounts]);

  const isCreditCard = selectedAccount?.type === 'card';
  const isVoucher = selectedAccount?.type === 'voucher';

  const getVoucherCurrentBalance = useCallback((voucher: Account) => {
    const associatedTransactions = transactions.filter(t => t.account === voucher.name);
    const balance = associatedTransactions.reduce((sum, t) => sum + t.amount, voucher.balance || 0);
    return balance;
  }, [transactions]);
  
  const installmentValue = useMemo(() => {
    if (isCreditCard && amount && installments && installments > 1) {
      return amount / installments;
    }
    return null;
  }, [isCreditCard, amount, installments]);

  const remainingBalanceText = useMemo(() => {
    if (!selectedAccount) return null;

    if (isCreditCard && selectedAccount.limit !== undefined) {
      const remainingLimit = selectedAccount.limit - (transactionType === 'expense' ? amount : 0);
      return (
        <div className="text-xs text-muted-foreground mt-1 text-right">
          Limite: {formatCurrency(selectedAccount.limit, true)}
          {amount > 0 && <span className="text-blue-500"> | Restante: {formatCurrency(remainingLimit, true)}</span>}
        </div>
      );
    }
    
    if (isVoucher) {
      const voucherAccount = accounts.find(acc => acc.name === selectedAccount.name) as Account | undefined;
      if (voucherAccount && voucherAccount.balance !== undefined) {
        const currentBalance = getVoucherCurrentBalance(voucherAccount);
        const remainingBalance = currentBalance - (transactionType === 'expense' ? amount : 0);
        return (
          <div className="text-xs text-muted-foreground mt-1 text-right">
            Saldo: {formatCurrency(currentBalance, true)}
            {amount > 0 && <span className="text-blue-500"> | Restante: {formatCurrency(remainingBalance, true)}</span>}
          </div>
        );
      }
    }
    
    return null;
  }, [isCreditCard, isVoucher, selectedAccount, amount, transactionType, formatCurrency, accounts, getVoucherCurrentBalance]);


  const pendingGoals = useMemo(() => goals.filter(g => !g.completed), [goals]);


  const onSubmit = (data: TransactionFormData) => {
    const finalInstallments = (data.type === 'expense' && isCreditCard && (data.installments || 1) > 1) ? data.installments : undefined;
    
    let finalData: Omit<Transaction, 'id' | 'amount'> & { id?: string; amount: number; fromAccount?: string; toAccount?: string; } = { ...data, amount: data.amount };
    
    if (data.type !== 'transfer') {
        if (!finalData.isRecurring) {
            delete finalData.frequency;
        }
         if (!isCreditCard || (finalData.installments || 1) <= 1) {
          delete (finalData as any).installments;
        }
    }

    if (finalData.linkedGoalId === '' || finalData.linkedGoalId === 'none') {
        delete finalData.linkedGoalId;
    }

    onSaveTransaction(finalData, finalInstallments);
    onClose();
  };
  
  const handleClose = () => {
    reset();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Transação' : 'Adicionar Transação'}</DialogTitle>
           <DialogDescription>
            Insira os detalhes do seu lançamento financeiro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
             <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={(value) => field.onChange(value as TransactionFormData['type'])} value={field.value} disabled={isEditing}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">Despesa</SelectItem>
                                <SelectItem value="income">Receita</SelectItem>
                                <SelectItem value="transfer">Transferência</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
               <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    value={field.value}
                    onValueChange={(value) => setValue('amount', value || 0)}
                  />
                )}
              />
               {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Controller
                  name="date"
                  control={control}
                  render={({ field }) => <Input id="date" type="date" {...field} />}
                />
               {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
            </div>
            
            {(transactionType === 'income' || transactionType === 'expense') && (
              <>
                <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => <Input id="description" {...field} value={field.value || ''} />}
                    />
                    {errors.type === 'income' && errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                    {errors.type === 'expense' && errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(transactionType === 'income' ? incomeCategories : expenseCategories.filter(c => c !== 'Transferência')).map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.type === 'income' && errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                    {errors.type === 'expense' && errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="account">Conta/Cartão</Label>
                     <Controller
                        name="account"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma conta ou cartão" />
                                </SelectTrigger>
                                <SelectContent>
                                    {combinedAccounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.type === 'income' && errors.account && <p className="text-red-500 text-xs mt-1">{errors.account.message}</p>}
                    {errors.type === 'expense' && errors.account && <p className="text-red-500 text-xs mt-1">{errors.account.message}</p>}
                    {remainingBalanceText}
                </div>
                
                 {isCreditCard && transactionType === 'expense' && !isEditing && (
                   <div className="space-y-2">
                        <Label htmlFor="installments">Parcelas</Label>
                           <Controller
                            name="installments"
                            control={control}
                            render={({ field }) => (
                               <Input id="installments" type="number" {...field} min="1" />
                            )}
                            />
                           {installmentValue !== null && (
                                <p className="text-xs text-muted-foreground mt-1 text-right">
                                    {installments}x de {formatCurrency(installmentValue, true)}
                                </p>
                           )}
                   </div>
                 )}
                 
                {transactionType === 'expense' && pendingGoals.length > 0 && (
                    <div className="space-y-2">
                        <Label htmlFor="linkedGoalId">Vincular a uma Meta (Opcional)</Label>
                        <Controller
                            name="linkedGoalId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || 'none'}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma meta para contribuir" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Nenhuma</SelectItem>
                                        {pendingGoals.map(goal => (
                                            <SelectItem key={goal.id} value={goal.id}>{goal.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                )}


                <div className="flex items-center justify-between">
                    <Label htmlFor="paid" className="cursor-pointer">
                        {transactionType === 'income' ? 'Recebido' : 'Pago'}
                    </Label>
                    <Controller
                        name="paid"
                        control={control}
                        render={({ field }) => (
                        <Switch
                                id="paid"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label htmlFor="isRecurring" className="cursor-pointer">
                        Recorrente
                    </Label>
                    <Controller
                        name="isRecurring"
                        control={control}
                        render={({ field }) => (
                        <Switch
                                id="isRecurring"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isEditing || (installments || 1) > 1}
                            />
                        )}
                    />
                </div>
                {isRecurring && !isEditing && (
                    <div className="space-y-2">
                        <Label htmlFor="frequency">Frequência</Label>
                         <Controller
                            name="frequency"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a frequência" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Diária</SelectItem>
                                        <SelectItem value="weekly">Semanal</SelectItem>
                                        <SelectItem value="monthly">Mensal</SelectItem>
                                        <SelectItem value="annual">Anual</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                )}
              </>
            )}

            {transactionType === 'transfer' && (
              <>
                <div className="space-y-2">
                    <Label htmlFor="fromAccount">Da Conta</Label>
                    <Controller
                        name="fromAccount"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a conta de origem" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.filter(a => a.type !== 'voucher').map(acc => (
                                        <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.type === 'transfer' && errors.fromAccount && <p className="text-red-500 text-xs mt-1">{errors.fromAccount.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="toAccount">Para Conta</Label>
                    <Controller
                        name="toAccount"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a conta de destino" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.filter(a => a.type !== 'voucher').map(acc => (
                                        <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.type === 'transfer' && errors.toAccount && <p className="text-red-500 text-xs mt-1">{errors.toAccount.message}</p>}
                </div>
              </>
            )}
            
          </div>
          <DialogFooter className="pt-6">
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">{isEditing ? 'Salvar' : 'Adicionar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
