
'use client';

import { useEffect, useContext, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FinanceContext, ShoppingList } from '@/contexts/finance-context';
import type { Transaction } from '@/components/finance/transactions-table';

const finalizeSchema = z.object({
  category: z.string().min(1, 'A categoria é obrigatória'),
  account: z.string().min(1, 'A conta/cartão é obrigatória'),
});

type FinalizeFormData = z.infer<typeof finalizeSchema>;

type FinalizePurchaseDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (list: ShoppingList, transactionDetails: Omit<Transaction, 'id' | 'amount' | 'description'>) => void;
  list: ShoppingList;
};

export function FinalizePurchaseDialog({ isOpen, onClose, onConfirm, list }: FinalizePurchaseDialogProps) {
  const { expenseCategories, accounts, cards, formatCurrency } = useContext(FinanceContext);
  
  const combinedAccounts = useMemo(() => [
      ...accounts.map(a => ({...a, type: 'account', id: a.name, name: `${a.name} (${a.type === 'voucher' ? 'Vale' : 'Conta'})` })), 
      ...cards.map(c => ({...c, type: 'card', id: c.name }))
    ], [accounts, cards]);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FinalizeFormData>({
    resolver: zodResolver(finalizeSchema),
    defaultValues: {
      category: 'Alimentação',
      account: '',
    },
  });
  
  const totalCost = useMemo(() => {
    return list.items.reduce((total, item) => {
      return item.checked && item.price ? total + item.price : total;
    }, 0);
  }, [list]);

  useEffect(() => {
    if (isOpen) {
      reset({ category: 'Alimentação', account: '' });
    }
  }, [isOpen, reset]);

  const onSubmit = (data: FinalizeFormData) => {
    const transactionDetails = {
        type: 'expense' as 'expense',
        category: data.category,
        account: data.account,
        date: new Date().toISOString().split('T')[0],
    }
    onConfirm(list, transactionDetails);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar Compra e Registrar Despesa</DialogTitle>
          <DialogDescription>
            Confirme os detalhes para registrar a despesa de <span className="font-bold">{formatCurrency(totalCost)}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria da Despesa</Label>
              <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                              {expenseCategories.filter(c => c !== 'Transferência').map(cat => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  )}
              />
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Pagar com</Label>
              <Controller
                name="account"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta ou cartão" />
                    </SelectTrigger>
                    <SelectContent>
                      {combinedAccounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.account && <p className="text-red-500 text-xs mt-1">{errors.account.message}</p>}
            </div>

          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Confirmar e Registrar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    