
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
import { Edit, Trash2, Repeat, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  account?: string;
  isRecurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'annual';
  installmentGroupId?: string;
  currentInstallment?: number;
  totalInstallments?: number;
};

type TransactionsTableProps = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
};

export function TransactionsTable({ transactions, onEdit, onDelete }: TransactionsTableProps) {
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
                       <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                {transaction.isRecurring && <Repeat className="h-4 w-4 text-muted-foreground" />}
                                <p className="font-semibold text-base">
                                  {transaction.description}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                       <div className="flex flex-col items-end gap-2">
                           <p className={cn(
                                'font-mono text-base font-semibold',
                                transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                            )}>
                                {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(transaction.id)}>
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
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
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
                    {transaction.amount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    })}
                    </TableCell>
                    <TableCell>
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(transaction)}>
                        <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(transaction.id)}>
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
    </div>
  );
}
