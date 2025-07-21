
'use client';

import { useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Goal, FinanceContext } from '@/contexts/finance-context';
import { CurrencyInput } from '@/components/finance/currency-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const progressSchema = z.object({
  amount: z.coerce.number().min(0.01, 'O valor deve ser maior que zero'),
  accountId: z.string().min(1, 'Selecione uma conta de origem'),
});

type ProgressFormData = z.infer<typeof progressSchema>;

type AddGoalProgressDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number, accountId: string) => void;
  goal: Goal;
};

export function AddGoalProgressDialog({ isOpen, onClose, onSave, goal }: AddGoalProgressDialogProps) {
  const { formatCurrency, accounts } = useContext(FinanceContext);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      amount: 0,
      accountId: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ amount: 0, accountId: '' });
    }
  }, [isOpen, reset]);

  const onSubmit = (data: ProgressFormData) => {
    onSave(data.amount, data.accountId);
  };
  
  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Progresso</DialogTitle>
          <DialogDescription>
            Adicione um valor para a meta "{goal.name}".
            <br />
            Falta {formatCurrency(remainingAmount)} para completar!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor a Adicionar</Label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    value={field.value}
                    onValueChange={(value) => field.onChange(value || 0)}
                    autoFocus
                  />
                )}
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="accountId">Deduzir da Conta</Label>
               <Controller
                name="accountId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta de origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.accountId && <p className="text-red-500 text-xs mt-1">{errors.accountId.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Adicionar Progresso</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
