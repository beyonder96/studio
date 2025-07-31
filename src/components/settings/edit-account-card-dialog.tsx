
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const accountSchema = z.object({
  type: z.literal('account'),
  name: z.string().min(1, 'O nome é obrigatório'),
  balance: z.coerce.number().min(0, 'O saldo inicial não pode ser negativo'),
  accountType: z.enum(['checking', 'savings', 'voucher']).default('checking'),
});

const cardSchema = z.object({
  type: z.literal('card'),
  name: z.string().min(1, 'O nome é obrigatório'),
  limit: z.coerce.number().min(1, 'O limite deve ser maior que zero'),
  dueDay: z.coerce.number().min(1, 'Dia inválido').max(31, 'Dia inválido'),
  holder: z.string().min(1, 'O titular é obrigatório'),
  brand: z.enum(['visa', 'mastercard', 'elo', 'amex']),
});

const formSchema = z.discriminatedUnion('type', [accountSchema, cardSchema]);

export type AccountCardFormData = z.infer<typeof formSchema>;

type EditAccountCardDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AccountCardFormData) => void;
  item: Account | CardType | null;
  allowedTypes?: ('account' | 'card')[];
  coupleNames?: string[];
};

export function EditAccountCardDialog({ isOpen, onClose, onSave, item, allowedTypes = ['account', 'card'], coupleNames = [] }: EditAccountCardDialogProps) {
  const isEditing = !!item;
  const itemType = item && 'balance' in item ? 'account' : 'card';
  
  const [activeTab, setActiveTab] = useState<'account' | 'card'>(item ? itemType : allowedTypes[0]);
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    setValue
  } = useForm<AccountCardFormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      const defaultTab = item ? itemType : allowedTypes[0];
      setActiveTab(defaultTab);
      
      if (item) {
        // Editing
        const type = 'balance' in item ? 'account' : 'card';
        setValue('type', type);
        reset({
          type,
          name: item.name,
          ...(type === 'account' ? { balance: (item as Account).balance, accountType: (item as Account).type } : { limit: (item as CardType).limit, dueDay: (item as CardType).dueDay, holder: (item as CardType).holder, brand: (item as CardType).brand }),
        });
      } else {
        // Adding new
        setValue('type', defaultTab);
        reset({
          type: defaultTab,
          name: '',
          ...(defaultTab === 'account' ? { balance: 0, accountType: 'checking' } : { limit: 1000, dueDay: 10, holder: coupleNames[0] || '', brand: 'visa' }),
        });
      }
    }
  }, [isOpen, reset, item, allowedTypes, itemType, setValue, coupleNames]);

  const onSubmit = (data: AccountCardFormData) => {
    onSave(data);
  };
  
  const showTabs = allowedTypes.length > 1 && !isEditing;

  const AccountForm = (
    <div className="space-y-4 pt-4">
        <Controller name="type" control={control} render={({ field }) => <input type="hidden" {...field} value="account" />} />
        <div className="space-y-2">
            <Label htmlFor="account-name">Nome da Conta</Label>
            <Input id="account-name" {...register('name')} placeholder="Ex: Conta Corrente, Vale Refeição" />
            {errors.name && errors.type === 'account' && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
                <Label htmlFor="accountType">Tipo</Label>
                <Controller
                    name="accountType"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="accountType">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="checking">Conta Corrente</SelectItem>
                                <SelectItem value="savings">Poupança</SelectItem>
                                <SelectItem value="voucher">Vale (Refeição/Alim.)</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                 {errors.accountType && errors.type === 'account' && <p className="text-red-500 text-xs mt-1">{errors.accountType.message}</p>}
            </div>
        </div>
    </div>
  );

  const CardForm = (
    <div className="space-y-4 pt-4">
        <Controller name="type" control={control} render={({ field }) => <input type="hidden" {...field} value="card" />} />
        <div className="space-y-2">
            <Label htmlFor="card-name">Apelido do Cartão</Label>
            <Input id="card-name" {...register('name')} placeholder="Ex: Cartão Principal" />
            {errors.name && errors.type === 'card' && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                {errors.holder && errors.type === 'card' && <p className="text-red-500 text-xs mt-1">{errors.holder.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="brand">Bandeira</Label>
                 <Controller
                    name="brand"
                    control={control}
                    render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="brand">
                            <SelectValue placeholder="Selecione a bandeira" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="visa">Visa</SelectItem>
                            <SelectItem value="mastercard">Mastercard</SelectItem>
                            <SelectItem value="elo">Elo</SelectItem>
                            <SelectItem value="amex">Amex</SelectItem>
                        </SelectContent>
                    </Select>
                    )}
                />
                 {errors.brand && errors.type === 'card' && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
            </div>
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
  );


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? (itemType === 'account' ? 'Editar Conta' : 'Editar Cartão') : 'Adicionar'}</DialogTitle>
           <DialogDescription>
            {isEditing ? 'Atualize as informações abaixo.' : 'Selecione o tipo e preencha as informações.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
            {showTabs ? (
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'account' | 'card')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        {allowedTypes.includes('account') && <TabsTrigger value="account" disabled={isEditing && itemType !== 'account'}>Conta/Vale</TabsTrigger>}
                        {allowedTypes.includes('card') && <TabsTrigger value="card" disabled={isEditing && itemType !== 'card'}>Cartão de Crédito</TabsTrigger>}
                    </TabsList>
                    <TabsContent value="account">
                        {AccountForm}
                    </TabsContent>
                    <TabsContent value="card">
                        {CardForm}
                    </TabsContent>
                </Tabs>
            ) : (
                 activeTab === 'account' ? AccountForm : CardForm
            )}

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

    