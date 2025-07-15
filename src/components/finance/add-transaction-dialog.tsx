
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
import { Input } from '@/components/ui/input';
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

const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Categoria é obrigatória'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

type AddTransactionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'transfer' >) => void;
};

const incomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
const expenseCategories = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Outros'];


export function AddTransactionDialog({
  isOpen,
  onClose,
  onAddTransaction,
}: AddTransactionDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const transactionType = watch('type');

  const onSubmit = (data: TransactionFormData) => {
    const amount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
    onAddTransaction({ ...data, amount });
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input id="description" {...register('description')} className="col-span-3" />
               {errors.description && <p className="col-span-4 text-red-500 text-xs text-right">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Valor
              </Label>
              <Input id="amount" type="number" step="0.01" {...register('amount')} className="col-span-3" />
               {errors.amount && <p className="col-span-4 text-red-500 text-xs text-right">{errors.amount.message}</p>}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Data
              </Label>
              <Input id="date" type="date" {...register('date')} className="col-span-3" />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="income">Receita</SelectItem>
                                <SelectItem value="expense">Despesa</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                    Categoria
                </Label>
                <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
