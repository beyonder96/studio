
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { formatCurrency } from '@/lib/utils'; // Assuming formatCurrency is available here

type SetPriceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSetPrice: (itemId: string, price: number, quantity: number) => void;
  item: ShoppingListItem;
};

export function SetPriceDialog({ isOpen, onClose, onSetPrice, item }: SetPriceDialogProps) {
  const [unitPrice, setUnitPrice] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    if (item) {
      // If a total price exists and quantity is valid, calculate unit price, otherwise default to undefined
      const numQuantity = parseInt(item.quantity.toString(), 10);
      if (item.price && numQuantity > 0) {
        setUnitPrice(item.price / numQuantity);
      } else {
        setUnitPrice(undefined);
      }
      setQuantity(item.quantity.toString());
    } else {
      setUnitPrice(undefined);
      setQuantity('1');
    }
  }, [item]);

  const numQuantity = parseInt(quantity, 10);
  const totalPrice = useMemo(() => {
    if (unitPrice !== undefined && !isNaN(numQuantity) && numQuantity > 0) {
      return unitPrice * numQuantity;
    }
    return 0;
  }, [unitPrice, numQuantity]);

  const handleSave = () => {
    if (item && !isNaN(totalPrice)) {
      onSetPrice(item.id, totalPrice, numQuantity);
    }
  };

  const handleClose = () => {
    setUnitPrice(undefined);
    setQuantity('1');
    onClose();
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[1-9]\d*$/.test(value)) {
        setQuantity(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Preço e Quantidade</DialogTitle>
          <DialogDescription>
            Qual o valor unitário e a quantidade para <span className="font-semibold">{item?.name}</span>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="item-quantity">Quantidade</Label>
                    <Input
                        id="item-quantity"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1"
                        type="number"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="item-unit-price">Preço Unitário</Label>
                    <CurrencyInput
                        id="item-unit-price"
                        value={unitPrice || 0}
                        onValueChange={(value) => setUnitPrice(value)}
                        placeholder="R$ 0,00"
                        autoFocus
                    />
                </div>
            </div>
             {totalPrice > 0 && (
                <p className="text-right text-muted-foreground text-sm">
                    Total do item: <span className="font-bold text-foreground">{formatCurrency(totalPrice, true)}</span>
                </p>
             )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={unitPrice === undefined || unitPrice <= 0 || !quantity || numQuantity <= 0}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
