
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Property, useProperty } from '@/contexts/property-context';
import { PlusCircle, HardHat, DollarSign, CheckCircle } from 'lucide-react';
import { AddConstructionStageDialog } from './add-construction-stage-dialog';
import { AddConstructionPaymentDialog } from './add-construction-payment-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { FinanceContext } from '@/contexts/finance-context';
import { useContext } from 'react';


export function ConstructionProgress({ property }: { property: Property }) {
    const { formatCurrency } = useContext(FinanceContext);
    const { toggleConstructionStage, toggleConstructionPayment } = useProperty();
    const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    const progress = useMemo(() => {
        const stages = property.constructionProgress?.stages || [];
        if (stages.length === 0) return 0;
        const completed = stages.filter(s => s.completed).length;
        return (completed / stages.length) * 100;
    }, [property.constructionProgress?.stages]);

    const totalPaid = useMemo(() => {
        const payments = property.constructionProgress?.payments || [];
        return payments.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
    }, [property.constructionProgress?.payments]);
    
    const totalCost = useMemo(() => {
        const payments = property.constructionProgress?.payments || [];
        return payments.reduce((sum, p) => sum + p.amount, 0);
    }, [property.constructionProgress?.payments]);

    const stages = property.constructionProgress?.stages || [];
    const payments = property.constructionProgress?.payments || [];

    return (
        <>
            <Card className="bg-transparent md:col-span-2 lg:col-span-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HardHat /> Acompanhamento da Obra</CardTitle>
                    <CardDescription>
                        Progresso: {Math.round(progress)}% concluído
                    </CardDescription>
                    <Progress value={progress} className="mt-2" />
                </CardHeader>
                <CardContent>
                   <Tabs defaultValue="stages">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="stages">Fases da Obra</TabsTrigger>
                            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
                        </TabsList>
                        <TabsContent value="stages" className="mt-4">
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {stages.length > 0 ? (
                                    stages.map(stage => (
                                        <div key={stage.id} className="flex items-center space-x-3 p-3 bg-background rounded-lg border">
                                            <Checkbox 
                                                id={`stage-${stage.id}`}
                                                checked={stage.completed}
                                                onCheckedChange={() => toggleConstructionStage(property.id, stage.id)}
                                            />
                                            <Label htmlFor={`stage-${stage.id}`} className={cn('flex-1', stage.completed && 'line-through text-muted-foreground')}>
                                                {stage.name}
                                            </Label>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground pt-8">Nenhuma fase cadastrada.</p>
                                )}
                            </div>
                            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setIsStageDialogOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Fase
                            </Button>
                        </TabsContent>
                        <TabsContent value="payments" className="mt-4">
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
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground pt-8">Nenhum pagamento cadastrado.</p>
                                )}
                            </div>
                             <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setIsPaymentDialogOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Pagamento
                            </Button>
                        </TabsContent>
                   </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between items-center bg-muted/50 p-4 rounded-b-lg">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <div>
                            <p className="text-sm font-semibold">Total Pago</p>
                            <p className="text-lg font-bold text-green-500">{formatCurrency(totalPaid)}</p>
                        </div>
                    </div>
                     <div className="text-right">
                        <p className="text-sm text-muted-foreground">Custo Total</p>
                        <p className="font-semibold text-muted-foreground">{formatCurrency(totalCost)}</p>
                    </div>
                </CardFooter>
            </Card>
            <AddConstructionStageDialog
                isOpen={isStageDialogOpen}
                onClose={() => setIsStageDialogOpen(false)}
                propertyId={property.id}
            />
            <AddConstructionPaymentDialog
                isOpen={isPaymentDialogOpen}
                onClose={() => setIsPaymentDialogOpen(false)}
                propertyId={property.id}
            />
        </>
    );
}
