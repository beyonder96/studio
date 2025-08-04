
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
import { useProperty, ConstructionPayment } from '@/contexts/property-context';
import { CurrencyInput } from '../finance/currency-input';
import { format, parseISO } from 'date-fns';

const paymentSchema = z.object({
  description: z.string().min(1, 'A descrição é obrigatória'),
  amount: z.coerce.number().min(0.01, 'O valor deve ser maior que zero'),
  dueDate: z.string().min(1, 'A data de vencimento é obrigatória'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

type EditConstructionPaymentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  payment: ConstructionPayment;
};

export function EditConstructionPaymentDialog({ isOpen, onClose, propertyId, payment }: EditConstructionPaymentDialogProps) {
  const { updateConstructionPayment } = useProperty();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  useEffect(() => {
      if (payment && isOpen) {
          reset({
              ...payment,
              dueDate: format(parseISO(payment.dueDate), 'yyyy-MM-dd')
          });
      }
  }, [payment, isOpen, reset]);

  const onSubmit = (data: PaymentFormData) => {
    updateConstructionPayment(propertyId, payment.id, data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Pagamento da Obra</DialogTitle>
          <DialogDescription>
            Atualize as informações do pagamento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => <Input {...field} id="description" placeholder="Ex: Parcela da Entrada, Custo da Elétrica" />}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="amount">Valor</Label>
                    <Controller
                        name="amount"
                        control={control}
                        render={({ field }) => (
                            <CurrencyInput
                                value={field.value}
                                onValueChange={(value) => field.onChange(value || 0)}
                            />
                        )}
                    />
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="dueDate">Data de Vencimento</Label>
                    <Controller
                        name="dueDate"
                        control={control}
                        render={({ field }) => <Input {...field} id="dueDate" type="date" />}
                    />
                    {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>}
                </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
