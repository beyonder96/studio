

'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Repeat, MoreVertical, CheckCircle, Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useContext } from 'react';
import { FinanceContext } from '@/contexts/finance-context';


export type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  account?: string;
  paid?: boolean;
  isRecurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'annual';
  installmentGroupId?: string;
  currentInstallment?: number;
  totalInstallments?: number;
  recurringSourceId?: string; // Link to the recurring template
  linkedGoalId?: string;
};

type TransactionsTableProps = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDeleteRequest: (transaction: Transaction) => void;
  onTogglePaid: (id: string, currentStatus: boolean) => void;
};

export function TransactionsTable({ transactions, onEdit, onDeleteRequest, onTogglePaid }: TransactionsTableProps) {
    const { formatCurrency } = useContext(FinanceContext);

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(date);
    };

  return (
    <div>
        {/* Mobile View */}
        <div className="space-y-3 sm:hidden">
            {transactions.map((transaction) => (
                <Card key={transaction.id} className="bg-transparent">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                       <div className="flex items-center gap-3">
                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onTogglePaid(transaction.id, !!transaction.paid)}>
                                {transaction.paid ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground"/>}
                           </Button>
                           <div className="flex-1 space-y-2 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    {transaction.isRecurring && <Repeat className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                                    <p className="font-semibold text-base truncate">
                                      {transaction.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                    <Badge variant="secondary" className="font-normal">{transaction.category}</Badge>
                                    <span>•</span>
                                    <span>{formatDate(transaction.date)}</span>
                                </div>
                                {transaction.totalInstallments && (
                                    <p className="text-xs text-muted-foreground">
                                        Parcela {transaction.currentInstallment}/{transaction.totalInstallments}
                                    </p>
                                )}
                           </div>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                           <p className={cn(
                                'font-mono text-base font-semibold',
                                transaction.type === 'income' ? 'text-green-500' : 'text-red-500',
                                !transaction.paid && 'opacity-50'
                            )}>
                                {formatCurrency(transaction.amount, true)}
                            </p>
                           
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(transaction)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => onDeleteRequest(transaction)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Excluir
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                       </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-12">Status</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[100px] text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map((transaction) => (
                <TableRow key={transaction.id} data-state={!transaction.paid ? 'pending' : 'paid'} className="data-[state=pending]:opacity-60">
                    <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onTogglePaid(transaction.id, !!transaction.paid)}>
                           {transaction.paid ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground"/>}
                        </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            {transaction.isRecurring && <Repeat className="h-4 w-4 text-muted-foreground" />}
                            <span>
                            {transaction.description}
                            {transaction.totalInstallments && ` (${transaction.currentInstallment}/${transaction.totalInstallments})`}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="secondary">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell
                        className={`text-right font-medium ${
                            transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                        }`}
                    >
                        {formatCurrency(transaction.amount, true)}
                    </TableCell>
                    <TableCell>
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => onEdit(transaction)}>
                        <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDeleteRequest(transaction)}>
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>

        {transactions.length === 0 && (
            <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg mt-4">
                <h3 className="text-lg font-medium">Nenhuma transação encontrada.</h3>
                <p className="text-sm">Clique em "Adicionar" para criar seu primeiro lançamento.</p>
            </div>
        )}
    </div>
  );
}
