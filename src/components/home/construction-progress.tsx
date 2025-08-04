
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Property, useProperty, ConstructionPayment } from '@/contexts/property-context';
import { PlusCircle, HardHat, DollarSign, Edit, TrendingUp, Wallet, MinusCircle, Pencil } from 'lucide-react';
import { AddConstructionPaymentDialog } from './add-construction-payment-dialog';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { FinanceContext } from '@/contexts/finance-context';
import { useContext } from 'react';
import { EditProgressDialog } from './edit-progress-dialog';
import { EditConstructionPaymentDialog } from './edit-construction-payment-dialog';


export function ConstructionProgress({ property }: { property: Property }) {
    const { formatCurrency } = useContext(FinanceContext);
    const { toggleConstructionPayment } = useProperty();
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<ConstructionPayment | null>(null);

    const progress = useMemo(() => {
        return property.constructionProgress?.progressPercentage || 0;
    }, [property.constructionProgress?.progressPercentage]);

    const spentAmount = useMemo(() => {
        const payments = property.constructionProgress?.payments || [];
        return payments.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
    }, [property.constructionProgress?.payments]);
    
    const totalBudget = useMemo(() => {
        return property.constructionProgress?.totalBudget || 0;
    }, [property.constructionProgress?.totalBudget]);

    const remainingBudget = totalBudget - spentAmount;

    const payments = property.constructionProgress?.payments || [];

    const handleEditClick = (payment: ConstructionPayment) => {
        setEditingPayment(payment);
    };

    return (
        <>
            <Card className="bg-transparent md:col-span-2 lg:col-span-3">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><HardHat /> Acompanhamento da Obra</CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsProgressDialogOpen(true)}>
                            <Edit className="h-4 w-4"/>
                        </Button>
                    </div>
                    <CardDescription>
                        Progresso: {Math.round(progress)}% concluído
                    </CardDescription>
                    <Progress value={progress} className="mt-2" />
                </CardHeader>
                <CardContent>
                   <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border">
                             <Wallet className="h-6 w-6 text-muted-foreground" />
                             <div>
                                <p className='text-sm text-muted-foreground'>Orçamento Total</p>
                                <p className='font-bold text-lg'>{formatCurrency(totalBudget)}</p>
                             </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border">
                             <TrendingUp className="h-6 w-6 text-green-500" />
                             <div>
                                <p className='text-sm text-muted-foreground'>Total Gasto</p>
                                <p className='font-bold text-lg text-green-500'>{formatCurrency(spentAmount)}</p>
                             </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border">
                             <MinusCircle className="h-6 w-6 text-red-500" />
                             <div>
                                <p className='text-sm text-muted-foreground'>Saldo Restante</p>
                                <p className='font-bold text-lg text-red-500'>{formatCurrency(remainingBudget)}</p>
                             </div>
                        </div>
                   </div>

                   <h3 className="font-semibold mb-4 text-lg">Pagamentos</h3>
                   <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                       {payments.length > 0 ? (
                            payments.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(payment => (
                                <div key={payment.id} className="flex items-center space-x-3 p-3 bg-background rounded-lg border">
                                     <Checkbox 
                                        id={`payment-${payment.id}`}
                                        checked={payment.paid}
                                        onCheckedChange={() => toggleConstructionPayment(property.id, payment.id)}
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor={`payment-${payment.id}`} className={cn('flex-1', payment.paid && 'line-through text-muted-foreground')}>
                                            {payment.description}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Vencimento: {format(parseISO(payment.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                                        </p>
                                    </div>
                                    <Badge variant={payment.paid ? 'default' : 'secondary'} className={cn(payment.paid && 'bg-green-600/80')}>
                                        {formatCurrency(payment.amount)}
                                    </Badge>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEditClick(payment)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground pt-8">Nenhum pagamento cadastrado.</p>
                        )}
                    </div>
                     <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setIsPaymentDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Pagamento
                    </Button>
                </CardContent>
            </Card>
            <AddConstructionPaymentDialog
                isOpen={isPaymentDialogOpen}
                onClose={() => setIsPaymentDialogOpen(false)}
                propertyId={property.id}
            />
            {editingPayment && (
                <EditConstructionPaymentDialog 
                    isOpen={!!editingPayment}
                    onClose={() => setEditingPayment(null)}
                    propertyId={property.id}
                    payment={editingPayment}
                />
            )}
            <EditProgressDialog
                isOpen={isProgressDialogOpen}
                onClose={() => setIsProgressDialogOpen(false)}
                propertyId={property.id}
                currentProgress={progress}
                currentBudget={totalBudget}
            />
        </>
    );
}
