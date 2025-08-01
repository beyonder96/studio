
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
import { CurrencyInput } from '@/components/finance/currency-input';
import { useEffect } from 'react';
import type { Account } from '@/contexts/finance-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const accountSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  balance: z.coerce.number().min(0, 'O saldo inicial não pode ser negativo'),
  holder: z.string().min(1, 'O titular é obrigatório'),
  type: z.enum(['checking', 'savings']),
});

export type AccountFormData = z.infer<typeof accountSchema>;

type EditAccountDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Account, 'id'>) => void;
  item: Account | null;
  coupleNames?: string[];
};

export function EditAccountDialog({ isOpen, onClose, onSave, item, coupleNames = [] }: EditAccountDialogProps) {
  const isEditing = !!item;
  
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: { type: 'checking', name: '', balance: 0, holder: '' }
  });

  useEffect(() => {
    if (isOpen) {
        if (isEditing && item) {
            reset({
                name: item.name,
                balance: item.balance,
                holder: item.holder,
                type: item.type === 'voucher' ? 'checking' : item.type, // default to checking if it's a voucher
            });
        } else {
            reset({
                type: 'checking',
                name: '',
                balance: 0,
                holder: coupleNames[0] || '',
            });
        }
    }
  }, [isOpen, item, isEditing, reset, coupleNames]);

  const onSubmit = (data: AccountFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Conta' : 'Adicionar Nova Conta'}</DialogTitle>
           <DialogDescription>
            {isEditing ? 'Atualize as informações da conta.' : 'Preencha as informações da nova conta.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="account-name">Nome da Conta</Label>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => <Input {...field} id="account-name" placeholder="Ex: Conta Corrente" />}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="balance">{isEditing ? "Saldo Atual" : "Saldo Inicial"}</Label>
                    <Controller
                        name="balance"
                        control={control}
                        render={({ field }) => (
                        <CurrencyInput
                            id="balance"
                            value={field.value}
                            onValueChange={(value) => field.onChange(value || 0)}
                        />
                        )}
                    />
                    {errors.balance && <p className="text-red-500 text-xs mt-1">{errors.balance.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="holder">Titular</Label>
                        <Controller
                            name="holder"
                            control={control}
                            render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id="holder">
                                    <SelectValue placeholder="Selecione o titular" />
                                </SelectTrigger>
                                <SelectContent>
                                    {coupleNames.map(name => (
                                        <SelectItem key={name} value={name}>{name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            )}
                        />
                        {errors.holder && <p className="text-red-500 text-xs mt-1">{errors.holder.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Conta</Label>
                         <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="checking">Conta Corrente</SelectItem>
                                    <SelectItem value="savings">Poupança</SelectItem>
                                </SelectContent>
                            </Select>
                            )}
                        />
                         {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                    </div>
                </div>
            </div>

          <DialogFooter className="pt-6">
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
