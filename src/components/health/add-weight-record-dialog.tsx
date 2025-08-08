
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { WeightRecord } from '@/contexts/finance-context';
import { format } from 'date-fns';

const weightRecordSchema = z.object({
  date: z.string().min(1, 'A data é obrigatória'),
  weight: z.coerce.number().min(1, 'O peso deve ser maior que zero'),
});

type WeightRecordFormData = z.infer<typeof weightRecordSchema>;

type AddWeightRecordDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<WeightRecord, 'id'>) => void;
};

export function AddWeightRecordDialog({ isOpen, onClose, onSave }: AddWeightRecordDialogProps) {

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WeightRecordFormData>({
    resolver: zodResolver(weightRecordSchema),
  });

  useEffect(() => {
    if (isOpen) {
        reset({ date: format(new Date(), 'yyyy-MM-dd'), weight: 0 });
    }
  }, [isOpen, reset]);

  const onSubmit = (data: WeightRecordFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Registro de Peso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input id="weight" type="number" step="0.1" {...register('weight')} placeholder="Ex: 65.5" />
                {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
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
