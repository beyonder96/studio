
'use client';

import { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PantryCategory } from '@/contexts/finance-context';

const pantryItemSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  quantity: z.coerce.number().min(1, 'A quantidade deve ser pelo menos 1'),
  category: z.string().min(1, 'A categoria é obrigatória'),
});

type PantryItemFormData = z.infer<typeof pantryItemSchema>;

type AddPantryItemDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PantryItemFormData) => void;
  categories: PantryCategory[];
};

export function AddPantryItemDialog({ isOpen, onClose, onSave, categories }: AddPantryItemDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<PantryItemFormData>({
    resolver: zodResolver(pantryItemSchema),
    defaultValues: {
      name: '',
      quantity: 1,
      category: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = (data: PantryItemFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Item à Despensa</DialogTitle>
          <DialogDescription>
            Insira os detalhes do item que deseja adicionar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Item</Label>
              <Input id="name" {...register('name')} placeholder="Ex: Arroz Integral" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input id="quantity" type="number" {...register('quantity')} min="1" />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Adicionar Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
