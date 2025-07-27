
'use client';

import { useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Appointment, FinanceContext } from '@/contexts/finance-context';


const appointmentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'O título é obrigatório'),
  date: z.string().min(1, 'A data é obrigatória'),
  time: z.string().optional(),
  category: z.string().min(1, 'A categoria é obrigatória'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

type AddAppointmentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Appointment, 'id'> & { id?: string }) => void;
  appointment: Appointment | null;
  selectedDate?: Date;
};

export function AddAppointmentDialog({ isOpen, onClose, onSave, appointment, selectedDate }: AddAppointmentDialogProps) {
  const isEditing = !!appointment;
  const { appointmentCategories } = useContext(FinanceContext);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: '',
      date: '',
      time: '',
      category: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        reset(appointment);
      } else {
        reset({
          title: '',
          date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          time: '',
          category: '',
          notes: '',
        });
      }
    }
  }, [appointment, isOpen, reset, selectedDate]);
  
  const onSubmit = (data: AppointmentFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Compromisso' : 'Adicionar Compromisso'}</DialogTitle>
           <DialogDescription>
            Preencha os detalhes do seu evento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register('title')} placeholder="Ex: Reunião com cliente" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
              </div>
               <div className="space-y-2">
                <Label htmlFor="time">Hora (opcional)</Label>
                <Input id="time" type="time" {...register('time')} />
              </div>
            </div>
            
             <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                              {appointmentCategories.map(cat => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  )}
              />
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea id="notes" {...register('notes')} placeholder="Detalhes adicionais, link da reunião, etc." />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Adicionar Evento'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
