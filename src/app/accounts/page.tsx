
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { FinanceContext } from '@/contexts/finance-context';


export default function AccountsPage() {
  const { 
    accounts,
    cards,
    incomeCategories,
    expenseCategories,
  } = useContext(FinanceContext);

  return (
    <Tabs defaultValue="accounts">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="accounts">Contas e Cartões</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="accounts">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Contas Bancárias</CardTitle>
                    <CardDescription>Gerencie suas contas correntes e poupança.</CardDescription>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Conta
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
                {accounts.map(account => (
                    <li key={account.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <p className="font-medium">{account.name}</p>
                            <p className="text-sm text-muted-foreground">Saldo: {account.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </li>
                ))}
            </ul>
          </CardContent>

          <Separator className="my-6" />

           <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Cartões de Crédito</CardTitle>
                    <CardDescription>Gerencie seus cartões de crédito.</CardDescription>
                </div>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Cartão
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
                {cards.map(card => (
                    <li key={card.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <p className="font-medium">{card.name}</p>
                            <p className="text-sm text-muted-foreground">Limite: {card.limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} | Vencimento: dia {card.dueDay}</p>
                        </div>
                         <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="categories">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <CardTitle>Categorias de Receita</CardTitle>
                         <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar
                        </Button>
                    </div>
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
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Categorias de Despesa</CardTitle>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar
                        </Button>
                    </div>
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
      </TabsContent>
    </Tabs>
  );
}
