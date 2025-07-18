
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
  const [quantity, setQuantity] = useState('1');

  const handleSave = () => {
    const numQuantity = parseInt(quantity, 10);
    if (name && !isNaN(numQuantity) && numQuantity > 0) {
      onAddItem(name, numQuantity);
      setName('');
      setQuantity('1');
    }
  };

  const handleClose = () => {
    setName('');
    setQuantity('1');
    onClose();
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or positive integers
    if (value === '' || /^[1-9]\d*$/.test(value)) {
        setQuantity(value);
    } else if (value === '0') {
        // Prevent typing "0" as the first digit
    } else if (quantity === '' && value === '0') {
        // Prevent starting with 0
    } else {
        const num = parseInt(value, 10);
        if(!isNaN(num) && num > 0) {
            setQuantity(num.toString());
        }
    }
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
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              type="text"
              inputMode="numeric"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={!name || !quantity || parseInt(quantity, 10) <= 0}>
            Adicionar Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
