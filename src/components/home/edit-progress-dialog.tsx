
'use client';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProperty } from '@/contexts/property-context';
import { Slider } from '../ui/slider';
import { useEffect } from 'react';
import { CurrencyInput } from '../finance/currency-input';

const progressSchema = z.object({
  percentage: z.coerce.number().min(0).max(100),
  budget: z.coerce.number().min(0, 'O orçamento não pode ser negativo'),
});

type ProgressFormData = z.infer<typeof progressSchema>;

type EditProgressDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  currentProgress: number;
  currentBudget: number;
};

export function EditProgressDialog({ isOpen, onClose, propertyId, currentProgress, currentBudget }: EditProgressDialogProps) {
  const { updateConstructionProgress } = useProperty();

  const {
    handleSubmit,
    control,
    reset,
    watch
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
        percentage: currentProgress || 0,
        budget: currentBudget || 0,
    }
  });

  const percentage = watch('percentage');

  useEffect(() => {
    reset({ percentage: currentProgress, budget: currentBudget });
  }, [currentProgress, currentBudget, reset]);

  const onSubmit = (data: ProgressFormData) => {
    updateConstructionProgress(propertyId, data.percentage, data.budget);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Progresso e Orçamento</DialogTitle>
          <DialogDescription>
            Atualize a porcentagem de conclusão e o orçamento total da obra.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento Total da Obra</Label>
               <Controller
                name="budget"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    value={field.value}
                    onValueChange={(value) => field.onChange(value || 0)}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="percentage">Progresso da Obra ({percentage}%)</Label>
               <Controller
                name="percentage"
                control={control}
                render={({ field }) => (
                  <Slider
                    defaultValue={[field.value]}
                    max={100}
                    step={1}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
