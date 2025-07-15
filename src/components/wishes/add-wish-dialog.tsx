
'use client';

import { useEffect } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Wish } from '@/contexts/finance-context';
import { CurrencyInput } from '@/components/finance/currency-input';

const wishSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  price: z.coerce.number().min(0.01, 'O preço deve ser maior que zero'),
  link: z.string().url('Insira uma URL válida').optional().or(z.literal('')),
  imageUrl: z.string().url('Insira uma URL de imagem válida').optional().or(z.literal('')),
});

type WishFormData = z.infer<typeof wishSchema>;

type AddWishDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Wish, 'id' | 'purchased'>) => void;
  wish: Wish | null;
};

export function AddWishDialog({ isOpen, onClose, onSave, wish }: AddWishDialogProps) {
  const isEditing = !!wish;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<WishFormData>({
    resolver: zodResolver(wishSchema),
    defaultValues: {
      name: '',
      price: 0,
      link: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (wish) {
        reset(wish);
      } else {
        reset({ name: '', price: 0, link: '', imageUrl: '' });
      }
    }
  }, [wish, isOpen, reset]);

  const onSubmit = (data: WishFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Desejo' : 'Adicionar Desejo'}</DialogTitle>
          <DialogDescription>
            Preencha as informações do item que vocês desejam.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Desejo</Label>
              <Input id="name" {...register('name')} placeholder="Ex: Fone de ouvido novo" />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço (aproximado)</Label>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    value={field.value}
                    onValueChange={(value) => field.onChange(value || 0)}
                  />
                )}
              />
              {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link (opcional)</Label>
              <Input id="link" {...register('link')} placeholder="https://loja.com/produto" />
              {errors.link && <p className="text-red-500 text-xs">{errors.link.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL da Imagem (opcional)</Label>
              <Input id="imageUrl" {...register('imageUrl')} placeholder="https://imagem.com/foto.png" />
              {errors.imageUrl && <p className="text-red-500 text-xs">{errors.imageUrl.message}</p>}
            </div>
          </div>
          <DialogFooter>
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
