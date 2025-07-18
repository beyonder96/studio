
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
import { ShoppingListItem } from '@/contexts/finance-context';
import { CurrencyInput } from '@/components/finance/currency-input';

type SetPriceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSetPrice: (itemId: string, price: number) => void;
  item: ShoppingListItem;
};

export function SetPriceDialog({ isOpen, onClose, onSetPrice, item }: SetPriceDialogProps) {
  const [price, setPrice] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (item && item.price !== undefined) {
      setPrice(item.price);
    } else {
      setPrice(undefined);
    }
  }, [item]);

  const handleSave = () => {
    if (item && price !== undefined) {
      onSetPrice(item.id, price);
    }
  };

  const handleClose = () => {
    setPrice(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Preço do Item</DialogTitle>
          <DialogDescription>
            Qual o valor de <span className="font-semibold">{item?.quantity}x {item?.name}</span>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="item-price" className="sr-only">
            Preço
          </Label>
          <CurrencyInput
             id="item-price"
             value={price || 0}
             onValueChange={(value) => setPrice(value)}
             placeholder="R$ 0,00"
             autoFocus
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={price === undefined || price <= 0}>
            Salvar Preço
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
