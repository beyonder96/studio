
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

const stageSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
});

type StageFormData = z.infer<typeof stageSchema>;

type AddConstructionStageDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
};

export function AddConstructionStageDialog({ isOpen, onClose, propertyId }: AddConstructionStageDialogProps) {
  const { addConstructionStage } = useProperty();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StageFormData>({
    resolver: zodResolver(stageSchema),
  });

  const onSubmit = (data: StageFormData) => {
    addConstructionStage(propertyId, data);
    reset({ name: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Fase da Obra</DialogTitle>
          <DialogDescription>
            Cadastre uma nova etapa para o acompanhamento da construção.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Fase</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} id="name" placeholder="Ex: Acabamento" />}
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
            <Button type="submit">Adicionar Fase</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
