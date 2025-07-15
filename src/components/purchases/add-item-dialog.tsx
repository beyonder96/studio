
'use client';

import { useState } from 'react';
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

type AddItemDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (name: string, quantity: number) => void;
};

export function AddItemDialog({ isOpen, onClose, onAddItem }: AddItemDialogProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSave = () => {
    if (name && quantity > 0) {
      onAddItem(name, quantity);
      setName('');
      setQuantity(1);
    }
  };

  const handleClose = () => {
    setName('');
    setQuantity(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Item</DialogTitle>
          <DialogDescription>
            Insira o nome e a quantidade do item que deseja adicionar à lista.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">
              Nome do Item
            </Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Arroz Integral"
              autoFocus
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="item-quantity">
              Quantidade
            </Label>
            <Input
              id="item-quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={!name || quantity <= 0}>
            Adicionar Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
