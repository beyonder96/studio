
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

const roomSchema = z.object({
  name: z.string().min(1, 'O nome do cômodo é obrigatório'),
});

type RoomFormData = z.infer<typeof roomSchema>;

type AddRoomDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomName: string) => void;
};

export function AddRoomDialog({ isOpen, onClose, onSave }: AddRoomDialogProps) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: { // Adicionando valores padrão
      name: ''
    }
  });

  const onSubmit = (data: RoomFormData) => {
    onSave(data.name);
    reset({ name: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cômodo</DialogTitle>
          <DialogDescription>
            Qual cômodo você quer adicionar ao seu imóvel?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Cômodo</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} id="name" placeholder="Ex: Cozinha, Quarto do Casal" autoFocus />}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Adicionar Cômodo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
