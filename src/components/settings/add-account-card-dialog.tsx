
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
import type { Account, Card } from '@/contexts/finance-context';


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

type FormData = z.infer<typeof formSchema>;

type AddAccountCardDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
};

export function AddAccountCardDialog({ isOpen, onClose, onSave }: AddAccountCardDialogProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'card'>('account');
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'account',
      name: '',
      balance: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        type: activeTab,
        name: '',
        ...(activeTab === 'account' ? { balance: 0 } : { limit: 1000, dueDay: 10 }),
      });
    }
  }, [isOpen, reset, activeTab]);

  const onSubmit = (data: FormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Conta ou Cartão</DialogTitle>
           <DialogDescription>
            Selecione o tipo e preencha as informações.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'account' | 'card')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Conta</TabsTrigger>
                    <TabsTrigger value="card">Cartão de Crédito</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="pt-4">
                    <div className="space-y-4">
                        <input type="hidden" {...register('type')} value="account" />
                        <div className="space-y-2">
                            <Label htmlFor="account-name">Nome da Conta</Label>
                            <Input id="account-name" {...register('name')} placeholder="Ex: Conta Corrente" />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="balance">Saldo Inicial</Label>
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
                            {errors.balance && <p className="text-red-500 text-xs mt-1">{errors.balance.message}</p>}
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="card" className="pt-4">
                     <div className="space-y-4">
                        <input type="hidden" {...register('type')} value="card" />
                        <div className="space-y-2">
                            <Label htmlFor="card-name">Nome do Cartão</Label>
                            <Input id="card-name" {...register('name')} placeholder="Ex: Cartão Principal" />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
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
                                {errors.limit && <p className="text-red-500 text-xs mt-1">{errors.limit.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="dueDay">Dia do Vencimento</Label>
                                <Input id="dueDay" type="number" {...register('dueDay')} min="1" max="31" />
                                {errors.dueDay && <p className="text-red-500 text-xs mt-1">{errors.dueDay.message}</p>}
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
