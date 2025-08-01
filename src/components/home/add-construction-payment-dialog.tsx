
'use client';

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
import { useProperty } from '@/contexts/property-context';
import { CurrencyInput } from '../finance/currency-input';
import { format } from 'date-fns';

const paymentSchema = z.object({
  description: z.string().min(1, 'A descrição é obrigatória'),
  amount: z.coerce.number().min(0.01, 'O valor deve ser maior que zero'),
  dueDate: z.string().min(1, 'A data de vencimento é obrigatória'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

type AddConstructionPaymentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
};

export function AddConstructionPaymentDialog({ isOpen, onClose, propertyId }: AddConstructionPaymentDialogProps) {
  const { addConstructionPayment } = useProperty();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
        description: '',
        amount: 0,
        dueDate: format(new Date(), 'yyyy-MM-dd')
    }
  });

  const onSubmit = (data: PaymentFormData) => {
    addConstructionPayment(propertyId, data);
    reset({ description: '', amount: 0, dueDate: format(new Date(), 'yyyy-MM-dd') });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Pagamento da Obra</DialogTitle>
          <DialogDescription>
            Registre um novo custo ou boleto relacionado à obra.
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
            <Button type="submit">Adicionar Pagamento</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
