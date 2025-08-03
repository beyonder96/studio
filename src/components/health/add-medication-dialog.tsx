
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
import { Medication } from '@/contexts/finance-context';

const medicationSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  dosage: z.string().min(1, 'A dosagem é obrigatória'),
  frequency: z.string().min(1, 'A frequência é obrigatória'),
});

type MedicationFormData = z.infer<typeof medicationSchema>;

type AddMedicationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Medication, 'id'>) => void;
  medication: Medication | null;
};

export function AddMedicationDialog({ isOpen, onClose, onSave, medication }: AddMedicationDialogProps) {
  const isEditing = !!medication;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: { name: '', dosage: '', frequency: '' },
  });

  useEffect(() => {
    if (isOpen) {
      if (medication) {
        reset(medication);
      } else {
        reset({ name: '', dosage: '', frequency: '' });
      }
    }
  }, [medication, isOpen, reset]);

  const onSubmit = (data: MedicationFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Medicamento' : 'Adicionar Medicamento'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do medicamento de uso contínuo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Medicamento</Label>
              <Input id="name" {...register('name')} placeholder="Ex: Losartana Potássica" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dosage">Dosagem</Label>
                    <Input id="dosage" {...register('dosage')} placeholder="Ex: 50mg" />
                    {errors.dosage && <p className="text-red-500 text-xs mt-1">{errors.dosage.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="frequency">Frequência</Label>
                    <Input id="frequency" {...register('frequency')} placeholder="Ex: 1 vez ao dia" />
                    {errors.frequency && <p className="text-red-500 text-xs mt-1">{errors.frequency.message}</p>}
                </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Adicionar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
