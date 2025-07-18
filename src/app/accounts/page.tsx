
'use client';

import { useContext } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { FinanceContext } from '@/contexts/finance-context';


export default function AccountsPage() {
  const { 
    incomeCategories,
    expenseCategories,
  } = useContext(FinanceContext);

  return (
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
        <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card className="bg-card/50 dark:bg-card/50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Categorias de Receita</CardTitle>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Adicionar
                            </Button>
                        </div>
                        <CardDescription>Gerencie suas categorias de receitas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {incomeCategories.map(cat => (
                                <li key={cat} className="flex items-center justify-between p-3 rounded-lg border">
                                    <p>{cat}</p>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 dark:bg-card/50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Categorias de Despesa</CardTitle>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Adicionar
                            </Button>
                        </div>
                        <CardDescription>Gerencie suas categorias de despesas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {expenseCategories.map(cat => (
                                <li key={cat} className="flex items-center justify-between p-3 rounded-lg border">
                                    <p>{cat}</p>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </CardContent>
    </Card>
  );
}
