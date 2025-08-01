
'use client';

import { useEffect, useContext } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PropertyContext, PropertyType, Property } from '@/contexts/property-context';

const propertySchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  type: z.enum(['house', 'apartment', 'construction']),
  address: z.string().min(1, 'O endereço é obrigatório'),
  imageUrl: z.string().url('URL da imagem inválida').optional().or(z.literal('')),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export function AddPropertyDialog() {
  const { 
    isAddDialogOpen, 
    setIsAddDialogOpen, 
    editingProperty,
    setEditingProperty,
    addProperty,
    updateProperty
  } = useContext(PropertyContext);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  const isEditing = !!editingProperty;

  useEffect(() => {
    if (isAddDialogOpen) {
      if (isEditing && editingProperty) {
        reset(editingProperty);
      } else {
        reset({ name: '', type: 'house', address: '', imageUrl: '' });
      }
    }
  }, [isAddDialogOpen, editingProperty, isEditing, reset]);

  const onSubmit = (data: PropertyFormData) => {
    if (isEditing && editingProperty) {
      updateProperty(editingProperty.id, data);
    } else {
      addProperty(data);
    }
    closeDialog();
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingProperty(null);
  };

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Imóvel' : 'Adicionar Novo Imóvel'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações do seu imóvel.' : 'Preencha os detalhes do seu novo imóvel.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome / Apelido do Imóvel</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} id="name" placeholder="Ex: Casa Principal, Apê da Praia" />}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Imóvel</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">Casa (Residência)</SelectItem>
                      <SelectItem value="apartment">Apartamento (Pronto)</SelectItem>
                      <SelectItem value="construction">Apartamento (Em Construção)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => <Input {...field} id="address" placeholder="Rua, Número, Bairro, Cidade - Estado" />}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL da Imagem (opcional)</Label>
              <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => <Input {...field} id="imageUrl" placeholder="https://exemplo.com/imagem.png" />}
              />
              {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={closeDialog}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Adicionar Imóvel'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
