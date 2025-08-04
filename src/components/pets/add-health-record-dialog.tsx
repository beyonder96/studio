

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Pet, HealthRecord, HealthRecordType } from '@/contexts/finance-context';
import { format, parseISO } from 'date-fns';
import { useEffect } from 'react';

const healthRecordSchema = z.object({
  type: z.enum(['vaccine', 'dewormer', 'flea_tick', 'consultation', 'other']),
  description: z.string().min(1, 'A descrição é obrigatória'),
  date: z.string().min(1, 'A data é obrigatória'),
  nextDueDate: z.string().optional(),
  notes: z.string().optional(),
});

type HealthRecordFormData = z.infer<typeof healthRecordSchema>;

type AddHealthRecordDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<HealthRecord, 'id'>) => void;
  pet: Pet;
  record: HealthRecord | null;
};

export function AddHealthRecordDialog({ isOpen, onClose, onSave, pet, record }: AddHealthRecordDialogProps) {
  const isEditing = !!record;
  
  const {
    handleSubmit,
    control,
    register,
    reset,
    formState: { errors },
  } = useForm<HealthRecordFormData>({
    resolver: zodResolver(healthRecordSchema),
  });

  useEffect(() => {
    if (isOpen) {
        if(record) {
             reset({
                ...record,
                date: format(parseISO(record.date), 'yyyy-MM-dd'),
                nextDueDate: record.nextDueDate ? format(parseISO(record.nextDueDate), 'yyyy-MM-dd') : '',
            });
        } else {
            reset({
                type: 'vaccine',
                description: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                nextDueDate: '',
                notes: ''
            });
        }
    }
  }, [isOpen, record, reset]);

  const onSubmit = (data: HealthRecordFormData) => {
    const dataToSave: Omit<HealthRecord, 'id'> = {
        ...data,
        nextDueDate: data.nextDueDate || undefined,
        notes: data.notes || undefined,
    }
    onSave(dataToSave);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar' : 'Adicionar'} Registro de Saúde</DialogTitle>
          <DialogDescription>
            Registre um novo evento de saúde para {pet.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Registro</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vaccine">Vacina</SelectItem>
                      <SelectItem value="dewormer">Vermífugo</SelectItem>
                      <SelectItem value="flea_tick">Antipulgas/Carrapatos</SelectItem>
                      <SelectItem value="consultation">Consulta Veterinária</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input {...register('description')} id="description" placeholder="Ex: Vacina V5, Consulta de rotina" />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data da Aplicação/Consulta</Label>
                <Input {...register('date')} id="date" type="date" />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextDueDate">Próxima Dose/Retorno (Opcional)</Label>
                <Input {...register('nextDueDate')} id="nextDueDate" type="date" />
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Textarea {...register('notes')} id="notes" placeholder="Ex: Reação à vacina, receita, etc." />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">{isEditing ? 'Salvar' : 'Adicionar'} Registro</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
