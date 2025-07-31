
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
import { Transaction } from './transactions-table';
import { CurrencyInput } from './currency-input';
import { useEffect, useContext, useMemo } from 'react';
import { FinanceContext } from '@/contexts/finance-context';
import { Input } from '@/components/ui/input';
import { addMonths, format } from 'date-fns';

const transactionSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Descrição é obrigatória').optional(),
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.string().optional(),
  account: z.string().optional(),
  fromAccount: z.string().optional(),
  toAccount: z.string().optional(),
  paid: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'annual']).optional(),
  installments: z.coerce.number().min(1).optional(),
}).superRefine((data, ctx) => {
    if (data.type === 'transfer') {
        if (!data.fromAccount) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Conta de origem é obrigatória", path: ["fromAccount"] });
        }
        if (!data.toAccount) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Conta de destino é obrigatória", path: ["toAccount"] });
        }
        if (data.fromAccount === data.toAccount) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Contas de origem e destino não podem ser iguais", path: ["toAccount"] });
        }
    } else {
        if (!data.description) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Descrição é obrigatória", path: ["description"] });
        }
        if (!data.category) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Categoria é obrigatória", path: ["category"] });
        }
        if (!data.account) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Conta/Cartão é obrigatório", path: ["account"] });
        }
    }
});

type TransactionFormData = z.infer<typeof transactionSchema>;

type AddTransactionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaveTransaction: (transaction: Omit<Transaction, 'id' > & { id?: string; fromAccount?: string; toAccount?: string; }, installments?: number) => void;
  transaction: Transaction | null;
};

export function AddTransactionDialog({
  isOpen,
  onClose,
  onSaveTransaction,
  transaction,
}: AddTransactionDialogProps) {
  const isEditing = !!transaction;
  const { accounts, cards, incomeCategories, expenseCategories } = useContext(FinanceContext);

  const combinedAccounts = useMemo(() => [
      ...accounts.map(a => ({...a, type: 'account', limit: undefined})), 
      ...cards.map(c => ({...c, type: 'card', balance: undefined}))
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
      fromAccount: '',
      toAccount: '',
      paid: true,
      isRecurring: false,
      installments: 1,
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
          });
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
          });
      }
    }
  }, [transaction, isOpen, reset]);


  const transactionType = watch('type');
  const isRecurring = watch('isRecurring');
  const selectedAccountId = watch('account');
  const amount = watch('amount');
  const installments = watch('installments');
  
  const selectedAccount = useMemo(() => {
    return combinedAccounts.find(acc => acc.name === selectedAccountId);
  }, [selectedAccountId, combinedAccounts]);

  const isCreditCard = selectedAccount?.type === 'card';
  
  const installmentValue = useMemo(() => {
    if (isCreditCard && amount && installments && installments > 1) {
      return amount / installments;
    }
    return null;
  }, [isCreditCard, amount, installments]);

  const remainingLimit = useMemo(() => {
    if (isCreditCard && selectedAccount.limit !== undefined && amount) {
       // In a real scenario, this would also check for other pending transactions
      return selectedAccount.limit - amount;
    }
    return null;
  }, [isCreditCard, selectedAccount, amount]);


  const onSubmit = (data: TransactionFormData) => {
    const transactionAmount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
    
    // Don't pass installment data if not a credit card purchase
    const finalInstallments = (isCreditCard && (data.installments || 1) > 1) ? data.installments : undefined;
    
    const finalData = { ...data, amount: transactionAmount };
    
    if (data.type !== 'transfer') {
        if (!finalData.isRecurring) {
            delete finalData.frequency;
        }
         if (!isCreditCard || (finalData.installments || 1) <= 1) {
          delete finalData.installments;
        }
    } else {
        finalData.description = `Transferência de ${data.fromAccount} para ${data.toAccount}`;
    }

    onSaveTransaction(finalData, finalInstallments);
    onClose();
  };
  
  const handleClose = () => {
    reset();
    onClose();
  }
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Transação' : 'Adicionar Transação'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="md:text-right">
                    Tipo
                </Label>
                <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                            <SelectTrigger className="md:col-span-3">
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

            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="md:text-right">
                Valor
              </Label>
               <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    className="md:col-span-3"
                    value={field.value}
                    onValueChange={(value) => setValue('amount', value || 0)}
                  />
                )}
              />
               {errors.amount && <p className="md:col-span-4 text-red-500 text-xs md:text-right">{errors.amount.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="md:text-right">
                Data
              </Label>
              <Input id="date" type="date" {...register('date')} className="md:col-span-3" />
               {errors.date && <p className="md:col-span-4 text-red-500 text-xs md:text-right">{errors.date.message}</p>}
            </div>
            
            {(transactionType === 'income' || transactionType === 'expense') && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="md:text-right">
                        Descrição
                    </Label>
                    <Input id="description" {...register('description')} className="md:col-span-3" />
                    {errors.description && <p className="md:col-span-4 text-red-500 text-xs md:text-right">{errors.description.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="md:text-right">
                        Categoria
                    </Label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="md:col-span-3">
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
                    {errors.category && <p className="md:col-span-4 text-red-500 text-xs md:text-right">{errors.category.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 relative">
                    <Label htmlFor="account" className="md:text-right">
                        Conta/Cartão
                    </Label>
                    <div className="md:col-span-3">
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
                        {errors.account && <p className="text-red-500 text-xs text-right mt-1">{errors.account.message}</p>}

                         {isCreditCard && selectedAccount.limit !== undefined && (
                            <div className="text-xs text-muted-foreground mt-1 text-right">
                                Limite: {formatCurrency(selectedAccount.limit)}
                                {remainingLimit !== null && (
                                    <span className="text-blue-500"> | Restante: {formatCurrency(remainingLimit)}</span>
                                )}
                            </div>
                        )}
                    </div>
                   
                </div>
                
                 {isCreditCard && transactionType === 'expense' && !isEditing && (
                   <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                        <Label htmlFor="installments" className="md:text-right">
                           Parcelas
                        </Label>
                        <div className="md:col-span-3">
                           <Input id="installments" type="number" {...register('installments')} min="1" />
                           {installmentValue !== null && (
                                <p className="text-xs text-muted-foreground mt-1 text-right">
                                    {installments}x de {formatCurrency(installmentValue)}
                                </p>
                           )}
                        </div>
                   </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="paid" className="md:text-right">
                        {transactionType === 'income' ? 'Recebido' : 'Pago'}
                    </Label>
                     <div className="md:col-span-3 flex items-center">
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
                </div>


                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="isRecurring" className="md:text-right">
                        Recorrente
                    </Label>
                     <div className="md:col-span-3 flex items-center">
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
                </div>
                {isRecurring && !isEditing && (
                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                        <Label htmlFor="frequency" className="md:text-right">
                            Frequência
                        </Label>
                         <Controller
                            name="frequency"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="md:col-span-3">
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
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="fromAccount" className="md:text-right">
                        Da Conta
                    </Label>
                    <Controller
                        name="fromAccount"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="md:col-span-3">
                                    <SelectValue placeholder="Selecione a conta de origem" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.fromAccount && <p className="md:col-span-4 text-red-500 text-xs md:text-right">{errors.fromAccount.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="toAccount" className="md:text-right">
                        Para Conta
                    </Label>
                    <Controller
                        name="toAccount"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="md:col-span-3">
                                    <SelectValue placeholder="Selecione a conta de destino" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.toAccount && <p className="md:col-span-4 text-red-500 text-xs md:text-right">{errors.toAccount.message}</p>}
                </div>
              </>
            )}
            
          </div>
          <DialogFooter>
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
