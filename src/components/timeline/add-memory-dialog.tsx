
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
import { Textarea } from '@/components/ui/textarea';
import type { Memory } from '@/contexts/finance-context';
import { format } from 'date-fns';

const memorySchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  date: z.string().min(1, 'A data é obrigatória'),
  imageUrl: z.string().url('URL da imagem inválida').optional().or(z.literal('')),
});

type MemoryFormData = z.infer<typeof memorySchema>;

type AddMemoryDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Memory, 'id'>) => void;
  memory?: Memory | null;
};

export function AddMemoryDialog({ isOpen, onClose, onSave, memory }: AddMemoryDialogProps) {
  const isEditing = !!memory;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemoryFormData>({
    resolver: zodResolver(memorySchema),
    defaultValues: {
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (memory) {
        reset(memory);
      } else {
        reset({
          title: '',
          description: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          imageUrl: '',
        });
      }
    }
  }, [memory, isOpen, reset]);

  const onSubmit = (data: MemoryFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Memória' : 'Adicionar Nova Memória'}</DialogTitle>
          <DialogDescription>
            Registre um momento especial na sua linha do tempo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register('title')} placeholder="Ex: Nossa primeira viagem" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data do Acontecimento</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" {...register('description')} placeholder="Descreva como foi esse momento..." />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL da Foto (opcional)</Label>
              <Input id="imageUrl" {...register('imageUrl')} placeholder="https://exemplo.com/foto.jpg" />
              {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Adicionar Memória'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
