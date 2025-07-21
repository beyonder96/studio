
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

const progressSchema = z.object({
  amount: z.coerce.number().min(0.01, 'O valor deve ser maior que zero'),
});

type ProgressFormData = z.infer<typeof progressSchema>;

type AddGoalProgressDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number) => void;
  goal: Goal;
};

export function AddGoalProgressDialog({ isOpen, onClose, onSave, goal }: AddGoalProgressDialogProps) {
  const { formatCurrency } = useContext(FinanceContext);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      amount: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ amount: 0 });
    }
  }, [isOpen, reset]);

  const onSubmit = (data: ProgressFormData) => {
    onSave(data.amount);
  };
  
  const remainingAmount = goal.targetAmount - goal.currentAmount;

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
