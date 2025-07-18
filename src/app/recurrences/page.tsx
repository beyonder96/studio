
'use client';

import { useContext, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FinanceContext } from '@/contexts/finance-context';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Repeat } from 'lucide-react';

const frequencyMap = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal',
  annual: 'Anual',
};

export default function RecurrencesPage() {
  const { transactions } = useContext(FinanceContext);

  const recurringTransactions = useMemo(() => {
    return transactions.filter(t => t.isRecurring);
  }, [transactions]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00'); // Assume start of day in local timezone
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
        <CardContent className="p-4 sm:p-6">
            <Card className="bg-transparent">
            <CardHeader>
                <CardTitle>Transações Recorrentes</CardTitle>
                <CardDescription>
                Visualize e gerencie suas despesas e receitas recorrentes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Frequência</TableHead>
                    <TableHead>Próxima Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recurringTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                                <Repeat className="h-4 w-4 text-muted-foreground" />
                                <span>{transaction.description}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                        <Badge variant="secondary">{transaction.category}</Badge>
                        </TableCell>
                        <TableCell>
                        {transaction.frequency ? frequencyMap[transaction.frequency] : 'N/A'}
                        </TableCell>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell
                        className={`text-right font-medium ${
                            transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                        }`}
                        >
                        {transaction.amount.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                        })}
                        </TableCell>
                        <TableCell>
                        <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" disabled>
                            <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled>
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                    ))}
                    {recurringTransactions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                Nenhuma transação recorrente encontrada.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
        </CardContent>
    </Card>
  );
}
