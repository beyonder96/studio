// src/components/finance/add-transaction-dialog.tsx

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
import { Switch } from '@/components/ui/switch';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CurrencyInput } from './currency-input';
import { useEffect, useContext, useMemo, useState } from 'react';
import { FinanceContext, Account, Transaction } from '@/contexts/finance-context';
import { Input } from '@/components/ui/input';
import { addMonths, format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';


const transactionSchema = z.object({
  id: z.string().optional(),
  description: z.string().optional(),
  amount: z.coerce.number().min(0.01, 'O valor deve ser maior que zero'),
  date: z.string().min(1, 'A data é obrigatória'),
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.string().optional(),
  account: z.string().optional(),
  fromAccount: z.string().optional(),
  toAccount: z.string().optional(),
  paid: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'annual']).optional(),
  installments: z.coerce.number().min(1).optional(),
  linkedGoalId: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.type === 'transfer') {
        if (!data.fromAccount) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A conta de origem é obrigatória.", path: ["fromAccount"] });
        }
        if (!data.toAccount) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A conta de destino é obrigatória.", path: ["toAccount"] });
        }
        if (data.fromAccount && data.fromAccount === data.toAccount) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "As contas devem ser diferentes.", path: ["toAccount"] });
        }
    } else {
        if (!data.description || data.description.trim() === '') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A descrição é obrigatória.", path: ["description"] });
        }
        if (!data.category) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A categoria é obrigatória.", path: ["category"] });
        }
        if (!data.account) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A conta/cartão é obrigatório.", path: ["account"] });
        }
    }
});


type TransactionFormData = z.infer<typeof transactionSchema>;

type AddTransactionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaveTransaction: (transaction: Omit<Transaction, 'id' > & { id?: string; fromAccount?: string; toAccount?: string; }, installments?: number) => void;
  transaction: Transaction | null;
};

export function AddTransactionDialog({
  isOpen,
  onClose,
  onSaveTransaction,
  transaction,
}: AddTransactionDialogProps) {
  const isEditing = !!transaction;
  const { accounts, cards, incomeCategories, expenseCategories, goals } = useContext(FinanceContext);
  const [step, setStep] = useState(1);

  const combinedAccounts = useMemo(() => [
      ...accounts.map(a => ({...a, id: a.id, name: a.name, type: a.type, limit: undefined})), 
      ...cards.map(c => ({...c, id: c.id, name: c.name, type: 'card' as const, balance: undefined}))
    ], [accounts, cards]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: '',
      category: '',
      account: '',
      paid: true,
      isRecurring: false,
      installments: 1,
    },
  });

  const transactionType = watch('type');
  const selectedAccountId = watch('account');
  const isRecurring = watch('isRecurring');
  const installments = watch('installments');
  const selectedAccount = useMemo(() => combinedAccounts.find(acc => acc.name === selectedAccountId), [selectedAccountId, combinedAccounts]);
  const isCreditCard = selectedAccount?.type === 'card';
  
  useEffect(() => {
    if (isOpen) {
        if (transaction) {
            const amount = Math.abs(transaction.amount);
            reset({...transaction, amount});
        }
    } else {
        // Reset form and step when dialog closes
        reset({
            type: 'expense',
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            description: '',
            category: '',
            account: '',
            paid: true,
            isRecurring: false,
            installments: 1,
        });
        setStep(1);
    }
  }, [isOpen, transaction, reset]);


  const nextStep = async () => {
    let fieldsToValidate: (keyof TransactionFormData)[] = [];
    if (step === 1) {
        fieldsToValidate = ['type', 'amount', 'date'];
        if (transactionType !== 'transfer') {
            fieldsToValidate.push('description');
        }
    } else if (step === 2 && transactionType !== 'transfer') {
        fieldsToValidate = ['category', 'account'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => setStep(s => s - 1);

  const onSubmit = (data: TransactionFormData) => {
    const transactionAmount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
    const finalInstallments = (isCreditCard && (data.installments || 1) > 1) ? data.installments : undefined;
    const finalData = { ...data, amount: transactionAmount };
    onSaveTransaction(finalData, finalInstallments);
    onClose();
  };
  
  const handleClose = () => {
    reset();
    onClose();
  }
  
  const pendingGoals = useMemo(() => goals.filter(g => !g.completed), [goals]);

  const renderStepContent = () => {
    const animationProps = {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
        transition: { duration: 0.3 }
    };
    
    if (step === 1) {
        return (
            <motion.div {...animationProps} className="space-y-4">
                 <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Controller name="type" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">Despesa</SelectItem>
                                <SelectItem value="income">Receita</SelectItem>
                                <SelectItem value="transfer">Transferência</SelectItem>
                            </SelectContent>
                        </Select>
                    )}/>
                </div>
                {transactionType !== 'transfer' && (
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input id="description" {...register('description')} placeholder="Ex: Jantar no Outback"/>
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="amount">Valor</Label>
                    <Controller name="amount" control={control} render={({ field }) => (
                        <CurrencyInput value={field.value} onValueChange={(value) => field.onChange(value || 0)} />
                    )}/>
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                </div>
            </motion.div>
        );
    }

    if (step === 2) {
      return (
        <motion.div {...animationProps} className="space-y-4">
          {transactionType === 'transfer' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="fromAccount">Da Conta</Label>
                <Controller name="fromAccount" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Selecione a origem"/></SelectTrigger>
                        <SelectContent>{accounts.map(acc => <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>)}</SelectContent>
                    </Select>
                )}/>
                {errors.fromAccount && <p className="text-red-500 text-xs mt-1">{errors.fromAccount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="toAccount">Para Conta</Label>
                <Controller name="toAccount" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Selecione o destino"/></SelectTrigger>
                        <SelectContent>{accounts.map(acc => <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>)}</SelectContent>
                    </Select>
                )}/>
                {errors.toAccount && <p className="text-red-500 text-xs mt-1">{errors.toAccount.message}</p>}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Controller name="category" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Selecione uma categoria"/></SelectTrigger>
                        <SelectContent>{(transactionType === 'income' ? incomeCategories : expenseCategories.filter(c => c !== 'Transferência')).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                    </Select>
                )}/>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Conta/Cartão</Label>
                <Controller name="account" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Selecione uma conta ou cartão"/></SelectTrigger>
                        <SelectContent>{combinedAccounts.map(acc => <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>)}</SelectContent>
                    </Select>
                )}/>
                {errors.account && <p className="text-red-500 text-xs mt-1">{errors.account.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
              </div>
            </>
          )}
        </motion.div>
      );
    }
    
    if (step === 3 && transactionType !== 'transfer') {
        return (
             <motion.div {...animationProps} className="space-y-4">
                {isCreditCard && !isEditing && (
                   <div className="space-y-2">
                        <Label htmlFor="installments">Parcelas</Label>
                           <Input id="installments" type="number" {...register('installments')} min="1" />
                   </div>
                 )}
                 {transactionType === 'expense' && pendingGoals.length > 0 && (
                    <div className="space-y-2">
                        <Label htmlFor="linkedGoalId">Vincular a uma Meta (Opcional)</Label>
                        <Controller name="linkedGoalId" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || 'none'}>
                                <SelectTrigger><SelectValue placeholder="Selecione uma meta"/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhuma</SelectItem>
                                    {pendingGoals.map(goal => <SelectItem key={goal.id} value={goal.id}>{goal.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}/>
                    </div>
                )}
                 <div className="flex items-center justify-between">
                    <Label htmlFor="paid" className="cursor-pointer">{transactionType === 'income' ? 'Recebido' : 'Pago'}</Label>
                    <Controller name="paid" control={control} render={({ field }) => ( <Switch id="paid" checked={field.value} onCheckedChange={field.onChange}/> )}/>
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="isRecurring" className="cursor-pointer">Recorrente</Label>
                    <Controller name="isRecurring" control={control} render={({ field }) => (
                        <Switch id="isRecurring" checked={field.value} onCheckedChange={field.onChange} disabled={isEditing || (installments || 1) > 1}/>
                    )}/>
                </div>
                {isRecurring && !isEditing && (
                    <div className="space-y-2">
                        <Label htmlFor="frequency">Frequência</Label>
                        <Controller name="frequency" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Selecione a frequência"/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Mensal</SelectItem>
                                    <SelectItem value="annual">Anual</SelectItem>
                                </SelectContent>
                            </Select>
                        )}/>
                    </div>
                )}
            </motion.div>
        )
    }
  };

  const maxSteps = transactionType === 'transfer' ? 2 : 3;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Transação' : 'Adicionar Transação'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="py-4 min-h-[250px]">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </div>
          <DialogFooter>
            {step > 1 && (
                <Button type="button" variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Voltar
                </Button>
            )}
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
            </DialogClose>
            {step < maxSteps ? (
              <Button type="button" onClick={nextStep}>
                Avançar
              </Button>
            ) : (
              <Button type="submit">{isEditing ? 'Salvar' : 'Adicionar'}</Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
