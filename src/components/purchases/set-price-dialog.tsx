
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
import { ShoppingListItem } from '@/contexts/finance-context';
import { CurrencyInput } from '@/components/finance/currency-input';

type SetPriceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSetPrice: (itemId: string, price: number, quantity: number) => void;
  item: ShoppingListItem;
};

export function SetPriceDialog({ isOpen, onClose, onSetPrice, item }: SetPriceDialogProps) {
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    if (item) {
      setPrice(item.price);
      setQuantity(item.quantity.toString());
    } else {
      setPrice(undefined);
      setQuantity('1');
    }
  }, [item]);

  const handleSave = () => {
    const numQuantity = parseInt(quantity, 10);
    if (item && price !== undefined && !isNaN(numQuantity) && numQuantity > 0) {
      onSetPrice(item.id, price, numQuantity);
    }
  };

  const handleClose = () => {
    setPrice(undefined);
    setQuantity('1');
    onClose();
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[1-9]\d*$/.test(value)) {
        setQuantity(value);
    }
  };
  
  const numQuantity = parseInt(quantity, 10);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Preço e Quantidade</DialogTitle>
          <DialogDescription>
            Qual o valor e a quantidade para <span className="font-semibold">{item?.name}</span>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="item-quantity">Quantidade Comprada</Label>
                <Input
                    id="item-quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    type="number"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="item-price">Preço Total</Label>
                <CurrencyInput
                    id="item-price"
                    value={price || 0}
                    onValueChange={(value) => setPrice(value)}
                    placeholder="R$ 0,00"
                    autoFocus
                />
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={price === undefined || price <= 0 || !quantity || numQuantity <= 0}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

