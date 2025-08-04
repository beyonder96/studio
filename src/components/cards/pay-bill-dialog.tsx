
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
import { Label } from '@/components/ui/label';
import { FinanceContext, Card as CardType } from '@/contexts/finance-context';
import { CurrencyInput } from '@/components/finance/currency-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const payBillSchema = z.object({
  amount: z.coerce.number().min(0.01, 'O valor deve ser maior que zero'),
  accountId: z.string().min(1, 'Selecione uma conta de origem'),
});

type PayBillFormData = z.infer<typeof payBillSchema>;

type PayBillDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: CardType, amount: number, accountId: string) => void;
  card: CardType;
  totalBill: number;
};

export function PayBillDialog({ isOpen, onClose, onSave, card, totalBill }: PayBillDialogProps) {
  const { formatCurrency, accounts } = useContext(FinanceContext);

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PayBillFormData>({
    resolver: zodResolver(payBillSchema),
    defaultValues: {
      amount: totalBill,
      accountId: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ amount: totalBill > 0 ? totalBill : 0, accountId: '' });
    }
  }, [isOpen, reset, totalBill]);

  const onSubmit = (data: PayBillFormData) => {
    onSave(card, data.amount, data.accountId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagar Fatura do Cartão</DialogTitle>
          <DialogDescription>
            Fatura atual para o cartão "{card.name}" é de <span className="font-bold">{formatCurrency(totalBill, true)}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor a Pagar</Label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    value={field.value}
                    onValueChange={(value) => field.onChange(value || 0)}
                    autoFocus
                  />
                )}
              />
              <Button type="button" variant="link" size="sm" className="p-0 h-auto" onClick={() => setValue('amount', totalBill)}>
                Pagar valor total
              </Button>
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="accountId">Pagar com a conta</Label>
               <Controller
                name="accountId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta de origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter(acc => acc.type === 'checking' || acc.type === 'savings').map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.accountId && <p className="text-red-500 text-xs mt-1">{errors.accountId.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Confirmar Pagamento</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
