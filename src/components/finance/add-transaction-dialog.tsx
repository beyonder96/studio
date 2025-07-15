
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Transaction } from './transactions-table';
import { CurrencyInput } from './currency-input';
import { useEffect } from 'react';

const transactionSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.string().min(1, 'Categoria é obrigatória'),
  account: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

type AddTransactionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaveTransaction: (transaction: Omit<Transaction, 'id' > & { id?: string }) => void;
  transaction: Transaction | null;
};

const incomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
const expenseCategories = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Outros'];
const accounts = ['Conta Corrente - Itaú', 'Conta Poupança - Bradesco', 'Cartão de Crédito - Nubank', 'Carteira'];


export function AddTransactionDialog({
  isOpen,
  onClose,
  onSaveTransaction,
  transaction,
}: AddTransactionDialogProps) {
  const isEditing = !!transaction;

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
    },
  });

  useEffect(() => {
    if (isOpen && transaction) {
      // Pre-fill form for editing
      reset({
        ...transaction,
        amount: Math.abs(transaction.amount) // Form expects positive number
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
      });
    }
  }, [transaction, isOpen, reset]);


  const transactionType = watch('type');

  const onSubmit = (data: TransactionFormData) => {
    const amount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
    onSaveTransaction({ ...data, amount });
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                                    <SelectValue placeholder="Selecione uma conta" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc} value={acc}>{acc}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
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
