
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
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.string().min(1, 'Categoria é obrigatória'),
  account: z.string().min(1, 'Conta/Cartão é obrigatório'),
  isRecurring: z.boolean().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'annual']).optional(),
  installments: z.coerce.number().min(1).optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

type AddTransactionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaveTransaction: (transaction: Omit<Transaction, 'id' > & { id?: string }, installments?: number) => void;
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
      ...accounts.map(a => ({...a, type: 'account'})), 
      ...cards.map(c => ({...c, type: 'card'}))
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
      isRecurring: false,
      installments: 1,
    },
  });

  useEffect(() => {
    if (isOpen && transaction) {
      // Pre-fill form for editing
      reset({
        ...transaction,
        amount: Math.abs(transaction.amount), // Form expects positive number
        installments: transaction.totalInstallments || 1,
      });
    } else if (isOpen && !transaction) {
      // Reset form for adding new
      reset({
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        description: '',
        category: '',
        account: '',
        isRecurring: false,
        installments: 1,
      });
    }
  }, [transaction, isOpen, reset]);


  const transactionType = watch('type');
  const isRecurring = watch('isRecurring');
  const selectedAccountId = watch('account');
  
  const selectedAccount = useMemo(() => {
    return combinedAccounts.find(acc => acc.name === selectedAccountId);
  }, [selectedAccountId, combinedAccounts]);

  const isCreditCard = selectedAccount?.type === 'card';

  const onSubmit = (data: TransactionFormData) => {
    const amount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
    
    // Don't pass installment data if not a credit card purchase
    const installments = (isCreditCard && (data.installments || 1) > 1) ? data.installments : undefined;

    const finalData = { ...data, amount, installments: data.installments };

    if (!finalData.isRecurring) {
        delete finalData.frequency;
    }
     if (!isCreditCard || (finalData.installments || 1) <= 1) {
      delete finalData.installments;
    }

    onSaveTransaction(finalData, installments);
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
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <input id="description" {...register('description')} className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />
               {errors.description && <p className="col-span-4 text-red-500 text-xs text-right">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Valor
              </Label>
               <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    className="col-span-3"
                    value={field.value}
                    onValueChange={(value) => setValue('amount', value || 0)}
                  />
                )}
              />
               {errors.amount && <p className="col-span-4 text-red-500 text-xs text-right">{errors.amount.message}</p>}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Data
              </Label>
              <input id="date" type="date" {...register('date')} className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />
               {errors.date && <p className="col-span-4 text-red-500 text-xs text-right">{errors.date.message}</p>}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                    Tipo
                </Label>
                <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="income">Receita</SelectItem>
                                <SelectItem value="expense">Despesa</SelectItem>
                                <SelectItem value="transfer">Transferência</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
            
            {(transactionType === 'income' || transactionType === 'expense') && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                        Categoria
                    </Label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(transactionType === 'income' ? incomeCategories : expenseCategories).map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.category && <p className="col-span-4 text-red-500 text-xs text-right">{errors.category.message}</p>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="account" className="text-right">
                        Conta/Cartão
                    </Label>
                    <Controller
                        name="account"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="col-span-3">
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
                    {errors.account && <p className="col-span-4 text-red-500 text-xs text-right">{errors.account.message}</p>}
                </div>
                
                 {isCreditCard && transactionType === 'expense' && !isEditing && (
                   <div className="grid grid-cols-4 items-center gap-4">
                       <Label htmlFor="installments" className="text-right">
                           Parcelas
                       </Label>
                       <Input id="installments" type="number" {...register('installments')} min="1" className="col-span-3" />
                   </div>
                 )}


                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isRecurring" className="text-right">
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
                                disabled={isEditing}
                            />
                        )}
                    />
                </div>
                {isRecurring && !isEditing && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="frequency" className="text-right">
                            Frequência
                        </Label>
                         <Controller
                            name="frequency"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="col-span-3">
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
                <p className="text-center text-sm text-muted-foreground col-span-4 py-4">
                    Funcionalidade de transferência em breve!
                </p>
            )}
            
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={transactionType === 'transfer'}>{isEditing ? 'Salvar' : 'Adicionar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    