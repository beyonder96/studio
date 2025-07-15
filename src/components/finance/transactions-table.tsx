
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
import { Edit, Trash2, Repeat } from 'lucide-react';

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
};

type TransactionsTableProps = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
};

export function TransactionsTable({ transactions, onEdit, onDelete }: TransactionsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  };

  return (
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
                    <span>{transaction.description}</span>
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
  );
}
