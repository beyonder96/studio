
'use client';

import { useEffect, useState } from 'react';
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
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Goal, Milestone } from '@/contexts/finance-context';
import { CurrencyInput } from '@/components/finance/currency-input';
import { PlusCircle, Trash2 } from 'lucide-react';

const milestoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'O nome da etapa é obrigatório'),
  cost: z.coerce.number().min(0, 'O custo não pode ser negativo'),
  completed: z.boolean().optional(),
});

const goalSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  targetAmount: z.coerce.number().min(0, 'O valor alvo não pode ser negativo'),
  currentAmount: z.coerce.number().min(0, 'O valor atual não pode ser negativo'),
  imageUrl: z.string().url('Insira uma URL de imagem válida').optional().or(z.literal('')),
  milestones: z.array(milestoneSchema).optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

type AddGoalDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Goal, 'id' | 'completed'>, milestones: Omit<Milestone, 'id' | 'completed'>[]) => void;
  goal: Goal | null;
};

export function AddGoalDialog({ isOpen, onClose, onSave, goal }: AddGoalDialogProps) {
  const isEditing = !!goal;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      imageUrl: '',
      milestones: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'milestones',
  });

  const milestones = watch('milestones');
  const targetAmount = watch('targetAmount');

  useEffect(() => {
    if (isOpen) {
      if (goal) {
        reset({
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          imageUrl: goal.imageUrl,
          milestones: goal.milestones || []
        });
      } else {
        reset({ name: '', targetAmount: 0, currentAmount: 0, imageUrl: '', milestones: [] });
      }
    }
  }, [goal, isOpen, reset]);

  useEffect(() => {
    const totalMilestoneCost = milestones?.reduce((sum, ms) => sum + (ms.cost || 0), 0) || 0;
    if (totalMilestoneCost > targetAmount) {
        // Optionally, auto-update the target amount, or show a warning.
        // For now, let's just log it. A better UX could be implemented.
        console.warn("Milestone costs exceed target amount.");
    }
  }, [milestones, targetAmount]);

  const onSubmit = (data: GoalFormData) => {
    onSave({
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      imageUrl: data.imageUrl
    }, data.milestones || []);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Meta' : 'Adicionar Nova Meta'}</DialogTitle>
          <DialogDescription>
            Preencha as informações do seu objetivo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Meta</Label>
              <Input id="name" {...register('name')} placeholder="Ex: Viagem para a Itália" />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Input id="imageUrl" {...register('imageUrl')} placeholder="https://placehold.co/600x400.png" />
              {errors.imageUrl && <p className="text-red-500 text-xs">{errors.imageUrl.message}</p>}
            </div>

            <div className="space-y-4">
                <Label>Checklist da Meta (Etapas)</Label>
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor={`milestones.${index}.name`} className="text-xs">Nome da Etapa</Label>
                                <Input 
                                    id={`milestones.${index}.name`}
                                    {...register(`milestones.${index}.name`)} 
                                    placeholder="Ex: Comprar passagens" 
                                />
                                {errors.milestones?.[index]?.name && <p className="text-red-500 text-xs">{errors.milestones?.[index]?.name?.message}</p>}
                            </div>
                            <div className="w-40 space-y-2">
                                <Label htmlFor={`milestones.${index}.cost`} className="text-xs">Custo (R$)</Label>
                                 <Controller
                                    name={`milestones.${index}.cost`}
                                    control={control}
                                    render={({ field: controllerField }) => (
                                    <CurrencyInput
                                        value={controllerField.value}
                                        onValueChange={(value) => controllerField.onChange(value || 0)}
                                    />
                                    )}
                                />
                                {errors.milestones?.[index]?.cost && <p className="text-red-500 text-xs">{errors.milestones?.[index]?.cost?.message}</p>}
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive">
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="outline" onClick={() => append({ name: '', cost: 0, completed: false })}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Adicionar Etapa
                </Button>
            </div>
          </div>
          <DialogFooter className="pt-6">
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
