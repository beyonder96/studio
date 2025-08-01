
'use client';

import { useEffect } from 'react';
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
import { CurrencyInput } from '../finance/currency-input';
import { PropertyShoppingItem, ShoppingItemCategory, ShoppingItemStatus } from '@/contexts/property-context';
import { Trash2 } from 'lucide-react';
import { useProperty } from '@/contexts/property-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const itemSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  category: z.enum(['furniture', 'appliances', 'decor', 'materials', 'other']),
  status: z.enum(['needed', 'researching', 'purchased']),
  price: z.coerce.number().min(0, 'O preço não pode ser negativo'),
});

type ItemFormData = z.infer<typeof itemSchema>;

type AddPropertyItemDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<PropertyShoppingItem, 'id'>) => void;
  item: PropertyShoppingItem | null;
  propertyId: string;
};

export function AddPropertyItemDialog({ isOpen, onClose, onSave, item, propertyId }: AddPropertyItemDialogProps) {
  const isEditing = !!item;
  const { deleteShoppingItem } = useProperty();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && item) {
        reset(item);
      } else {
        reset({ name: '', category: 'furniture', status: 'needed', price: 0 });
      }
    }
  }, [isOpen, item, isEditing, reset]);

  const onSubmit = (data: ItemFormData) => {
    onSave(data);
  };
  
  const handleDelete = () => {
    if(item) {
        deleteShoppingItem(propertyId, item.id);
        onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Item da Lista' : 'Adicionar Item'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações do item.' : 'Preencha os detalhes do item para seu imóvel.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Item</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} id="name" placeholder="Ex: Sofá Retrátil" />}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="category">
                            <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="furniture">Móveis</SelectItem>
                                <SelectItem value="appliances">Eletrodomésticos</SelectItem>
                                <SelectItem value="decor">Decoração</SelectItem>
                                <SelectItem value="materials">Materiais</SelectItem>
                                <SelectItem value="other">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                        )}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="status">
                            <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="needed">A Comprar</SelectItem>
                                <SelectItem value="researching">Pesquisando</SelectItem>
                                <SelectItem value="purchased">Comprado</SelectItem>
                            </SelectContent>
                        </Select>
                        )}
                    />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço Estimado/Final</Label>
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
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
          </div>
          <DialogFooter className="justify-between">
            {isEditing ? (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button type="button" variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Item?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja excluir o item "{item?.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                Sim, Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ) : <div />}
            <div className="flex gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">
                        Cancelar
                    </Button>
                </DialogClose>
                <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Adicionar'}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
