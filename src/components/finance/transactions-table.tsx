
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

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
};

type TransactionsTableProps = {
  transactions: Transaction[];
};

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="font-medium">{transaction.description}</TableCell>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
