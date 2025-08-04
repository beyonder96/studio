

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pet, HealthRecord } from '@/contexts/finance-context';
import { Plus, Syringe, Pill, Stethoscope, Bug } from 'lucide-react';
import { format, parseISO, isFuture, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const healthTypeMap = {
    vaccine: { icon: <Syringe className="h-4 w-4" />, label: 'Vacina' },
    dewormer: { icon: <Bug className="h-4 w-4" />, label: 'Vermífugo' },
    flea_tick: { icon: <Bug className="h-4 w-4" />, label: 'Antipulgas' },
    consultation: { icon: <Stethoscope className="h-4 w-4" />, label: 'Consulta' },
    other: { icon: <Pill className="h-4 w-4" />, label: 'Outro' },
};

export function PetHealthCard({ pet, onAddRecord }: { pet: Pet; onAddRecord: () => void }) {
    
    const sortedRecords = (pet.healthRecords || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const getNextDueBadge = (record: HealthRecord) => {
        if (!record.nextDueDate) return null;
        
        const nextDate = parseISO(record.nextDueDate);
        if(!isFuture(nextDate)) return <Badge variant="destructive">Atrasado</Badge>;

        const daysUntil = differenceInDays(nextDate, new Date());
        if (daysUntil <= 30) {
            return <Badge variant="outline" className="border-amber-500 text-amber-500">{`Próxima em ${daysUntil}d`}</Badge>
        }
        return null;
    }

    return (
        <Card className="bg-transparent mt-4">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">Carteira de Saúde</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onAddRecord}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {sortedRecords.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                         <AnimatePresence>
                            {sortedRecords.map(record => (
                                <motion.div 
                                    key={record.id}
                                    layout
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                >
                                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                                        <div className={cn("p-2 bg-muted rounded-full mt-1", healthTypeMap[record.type] ? '' : 'hidden')}>
                                            {healthTypeMap[record.type]?.icon}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold">{record.description}</p>
                                                {getNextDueBadge(record)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {healthTypeMap[record.type]?.label} em {format(parseISO(record.date), "dd/MM/yyyy", { locale: ptBR })}
                                            </p>
                                            {record.notes && <p className="text-sm text-muted-foreground italic">"{record.notes}"</p>}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <p className="text-sm text-center text-muted-foreground py-4">Nenhum registro de saúde adicionado.</p>
                )}
            </CardContent>
        </Card>
    );
}
