
'use client';

import { useState, useEffect } from 'react';
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
import type { ShoppingListItem } from '@/app/purchases/page';

type EditItemDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpdateItem: (itemId: string, name: string, quantity: number) => void;
  item: ShoppingListItem;
};

export function EditItemDialog({ isOpen, onClose, onUpdateItem, item }: EditItemDialogProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity);
    }
  }, [item]);

  const handleSave = () => {
    if (item && name && quantity > 0) {
      onUpdateItem(item.id, name, quantity);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Item</DialogTitle>
          <DialogDescription>
            Altere o nome e a quantidade do item selecionado.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-item-name">
              Nome do Item
            </Label>
            <Input
              id="edit-item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Arroz Integral"
              autoFocus
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="edit-item-quantity">
              Quantidade
            </Label>
            <Input
              id="edit-item-quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={!name || quantity <= 0}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
