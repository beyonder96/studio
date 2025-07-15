
'use client';

import { useContext, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PlusCircle, Edit, Trash2, Moon, Sun, AlertTriangle, Check } from 'lucide-react';
import { FinanceContext } from '@/contexts/finance-context';
import { Label } from '@/components/ui/label';

const pastelColors = [
  { name: 'Amarelo', value: '45 95% 55%' },
  { name: 'Verde', value: '145 63% 49%' },
  { name: 'Azul', value: '210 89% 64%' },
  { name: 'Rosa', value: '340 82% 76%' },
  { name: 'Roxo', value: '260 82% 76%' },
  { name: 'Laranja', value: '25 95% 65%' },
];

type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('app-theme') as Theme) || 'light';
};

const getInitialColor = (): string => {
    if (typeof window === 'undefined') return pastelColors[0].value;
    return localStorage.getItem('app-color') || pastelColors[0].value;
};


export default function SettingsPage() {
  const { 
    accounts,
    cards,
    resetAllData
  } = useContext(FinanceContext);

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [selectedColor, setSelectedColor] = useState<string>(getInitialColor);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', selectedColor);
    document.documentElement.style.setProperty('--accent', selectedColor);
    document.documentElement.style.setProperty('--ring', selectedColor);
    localStorage.setItem('app-color', selectedColor);
  }, [selectedColor]);


  return (
    <div className="space-y-8">
      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>Personalize a aparência do aplicativo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="block mb-2 font-medium">Tema</Label>
            <div className="flex gap-2">
              <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" /> Claro
              </Button>
              <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" /> Escuro
              </Button>
            </div>
          </div>
          <div>
            <Label className="block mb-2 font-medium">Cor de Destaque</Label>
            <div className="flex flex-wrap gap-3">
              {pastelColors.map(color => (
                <Button
                  key={color.name}
                  variant="outline"
                  size="icon"
                  className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${selectedColor === color.value ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setSelectedColor(color.value)}
                  style={{ backgroundColor: `hsl(${color.value})` }}
                  aria-label={`Selecionar cor ${color.name}`}
                >
                  {selectedColor === color.value && <Check className="h-5 w-5 text-primary-foreground" />}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts & Cards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contas e Cartões</CardTitle>
              <CardDescription>Gerencie suas contas e cartões de crédito.</CardDescription>
            </div>
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
        <CardFooter>
          <Button variant="outline" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Conta ou Cartão
          </Button>
        </CardFooter>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>Ações nesta área são permanentes e não podem ser desfeitas.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Limpar Todos os Dados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação é irreversível. Todos os dados de transações, contas,
                  cartões, categorias e listas de compras serão permanentemente
                  excluídos. Suas personalizações de aparência serão mantidas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={resetAllData}
                >
                  Sim, limpar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
