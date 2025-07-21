
'use client';

import { useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Goal } from '@/contexts/finance-context';
import { CurrencyInput } from '@/components/finance/currency-input';

const goalSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  targetAmount: z.coerce.number().min(0.01, 'O valor alvo deve ser maior que zero'),
  currentAmount: z.coerce.number().min(0, 'O valor atual não pode ser negativo'),
  imageUrl: z.string().url('Insira uma URL de imagem válida').optional().or(z.literal('')),
});

type GoalFormData = z.infer<typeof goalSchema>;

type AddGoalDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Goal, 'id'>) => void;
  goal: Goal | null;
};

export function AddGoalDialog({ isOpen, onClose, onSave, goal }: AddGoalDialogProps) {
  const isEditing = !!goal;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (goal) {
        reset(goal);
      } else {
        reset({ name: '', targetAmount: 0, currentAmount: 0, imageUrl: '' });
      }
    }
  }, [goal, isOpen, reset]);

  const onSubmit = (data: GoalFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Meta' : 'Adicionar Nova Meta'}</DialogTitle>
          <DialogDescription>
            Preencha as informações do seu objetivo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Meta</Label>
              <Input id="name" {...register('name')} placeholder="Ex: Viagem para a Itália" />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="currentAmount">Valor Atual</Label>
                <Controller
                    name="currentAmount"
                    control={control}
                    render={({ field }) => (
                    <CurrencyInput
                        value={field.value}
                        onValueChange={(value) => field.onChange(value || 0)}
                    />
                    )}
                />
                {errors.currentAmount && <p className="text-red-500 text-xs">{errors.currentAmount.message}</p>}
                </div>
                <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor Alvo</Label>
                <Controller
                    name="targetAmount"
                    control={control}
                    render={({ field }) => (
                    <CurrencyInput
                        value={field.value}
                        onValueChange={(value) => field.onChange(value || 0)}
                    />
                    )}
                />
                {errors.targetAmount && <p className="text-red-500 text-xs">{errors.targetAmount.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL da Imagem (opcional)</Label>
              <Input id="imageUrl" {...register('imageUrl')} placeholder="https://imagem.com/foto.png" />
              {errors.imageUrl && <p className="text-red-500 text-xs">{errors.imageUrl.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
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
