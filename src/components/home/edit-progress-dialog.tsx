
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

const progressSchema = z.object({
  percentage: z.coerce.number().min(0).max(100),
});

type ProgressFormData = z.infer<typeof progressSchema>;

type EditProgressDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  currentProgress: number;
};

export function EditProgressDialog({ isOpen, onClose, propertyId, currentProgress }: EditProgressDialogProps) {
  const { updateConstructionProgress } = useProperty();

  const {
    handleSubmit,
    control,
    reset,
    watch
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
        percentage: currentProgress || 0
    }
  });

  const percentage = watch('percentage');

  useEffect(() => {
    reset({ percentage: currentProgress });
  }, [currentProgress, reset]);

  const onSubmit = (data: ProgressFormData) => {
    updateConstructionProgress(propertyId, data.percentage);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Progresso da Obra</DialogTitle>
          <DialogDescription>
            Atualize a porcentagem de conclusão da obra.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="percentage">Progresso ({percentage}%)</Label>
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
            <Button type="submit">Salvar Progresso</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
