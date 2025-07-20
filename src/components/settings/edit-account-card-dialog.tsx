
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import type { Account, Card as CardType } from '@/contexts/finance-context';


const accountSchema = z.object({
  type: z.literal('account'),
  name: z.string().min(1, 'O nome é obrigatório'),
  balance: z.coerce.number().min(0, 'O saldo inicial não pode ser negativo'),
});

const cardSchema = z.object({
  type: z.literal('card'),
  name: z.string().min(1, 'O nome é obrigatório'),
  limit: z.coerce.number().min(1, 'O limite deve ser maior que zero'),
  dueDay: z.coerce.number().min(1, 'Dia inválido').max(31, 'Dia inválido'),
});

const formSchema = z.discriminatedUnion('type', [accountSchema, cardSchema]);

export type AccountCardFormData = z.infer<typeof formSchema>;

type EditAccountCardDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AccountCardFormData) => void;
  item: Account | CardType | null;
};

export function EditAccountCardDialog({ isOpen, onClose, onSave, item }: EditAccountCardDialogProps) {
  const isEditing = !!item;
  const itemType = item && 'balance' in item ? 'account' : 'card';
  const [activeTab, setActiveTab] = useState<'account' | 'card'>(isEditing ? itemType : 'account');
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AccountCardFormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (item) {
        // Editing
        const type = 'balance' in item ? 'account' : 'card';
        setActiveTab(type);
        reset({
          type,
          name: item.name,
          ...(type === 'account' ? { balance: (item as Account).balance } : { limit: (item as CardType).limit, dueDay: (item as CardType).dueDay }),
        });
      } else {
        // Adding new
        reset({
          type: activeTab,
          name: '',
          ...(activeTab === 'account' ? { balance: 0 } : { limit: 1000, dueDay: 10 }),
        });
      }
    }
  }, [isOpen, reset, item, activeTab]);

  const onSubmit = (data: AccountCardFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? (itemType === 'account' ? 'Editar Conta' : 'Editar Cartão') : 'Adicionar Conta ou Cartão'}</DialogTitle>
           <DialogDescription>
            {isEditing ? 'Atualize as informações abaixo.' : 'Selecione o tipo e preencha as informações.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'account' | 'card')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account" disabled={isEditing && itemType !== 'account'}>Conta</TabsTrigger>
                    <TabsTrigger value="card" disabled={isEditing && itemType !== 'card'}>Cartão de Crédito</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="pt-4">
                    <div className="space-y-4">
                        <input type="hidden" {...register('type')} value="account" />
                        <div className="space-y-2">
                            <Label htmlFor="account-name">Nome da Conta</Label>
                            <Input id="account-name" {...register('name')} placeholder="Ex: Conta Corrente" />
                            {errors.name && errors.type === 'account' && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="balance">{isEditing ? "Saldo Atual" : "Saldo Inicial"}</Label>
                            <Controller
                                name="balance"
                                control={control}
                                render={({ field }) => (
                                <CurrencyInput
                                    id="balance"
                                    value={field.value || 0}
                                    onValueChange={(value) => field.onChange(value)}
                                />
                                )}
                            />
                             {errors.balance && errors.type === 'account' && <p className="text-red-500 text-xs mt-1">{errors.balance.message}</p>}
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="card" className="pt-4">
                     <div className="space-y-4">
                        <input type="hidden" {...register('type')} value="card" />
                        <div className="space-y-2">
                            <Label htmlFor="card-name">Nome do Cartão</Label>
                            <Input id="card-name" {...register('name')} placeholder="Ex: Cartão Principal" />
                            {errors.name && errors.type === 'card' && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="limit">Limite</Label>
                                 <Controller
                                    name="limit"
                                    control={control}
                                    render={({ field }) => (
                                    <CurrencyInput
                                        id="limit"
                                        value={field.value || 0}
                                        onValueChange={(value) => field.onChange(value)}
                                    />
                                    )}
                                />
                                 {errors.limit && errors.type === 'card' && <p className="text-red-500 text-xs mt-1">{errors.limit.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="dueDay">Dia do Vencimento</Label>
                                <Input id="dueDay" type="number" {...register('dueDay')} min="1" max="31" />
                                {errors.dueDay && errors.type === 'card' && <p className="text-red-500 text-xs mt-1">{errors.dueDay.message}</p>}
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
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
