
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
import { Input } from '@/components/ui/input';

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
    pantryCategories,
    addPantryCategory,
    deletePantryCategory,
    resetAllData
  } = useContext(FinanceContext);

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [selectedColor, setSelectedColor] = useState<string>(getInitialColor);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

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

  const handleAddCategory = () => {
    if(newCategoryName.trim()) {
        addPantryCategory(newCategoryName.trim());
        setNewCategoryName('');
    }
  }
  
  const handleDeleteCategoryConfirm = () => {
    if(categoryToDelete) {
        deletePantryCategory(categoryToDelete);
        setCategoryToDelete(null);
    }
  }


  return (
    <>
        <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
            <CardContent className="p-4 sm:p-6">
                <div className="space-y-8">
                {/* Appearance Settings */}
                <Card className="bg-transparent">
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
                
                {/* Pantry Categories */}
                 <Card className="bg-transparent">
                    <CardHeader>
                        <CardTitle>Categorias da Despensa</CardTitle>
                        <CardDescription>Gerencie as categorias dos itens da sua despensa.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {pantryCategories.map(category => (
                                <li key={category} className="flex items-center justify-between p-3 rounded-lg border">
                                    <p>{category}</p>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" disabled><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setCategoryToDelete(category)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                     <CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                        <Input
                            placeholder="Nome da nova categoria"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                        />
                        <Button onClick={handleAddCategory} className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar
                        </Button>
                    </CardFooter>
                </Card>


                {/* Accounts & Cards */}
                <Card className="bg-transparent">
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
                <Card className="border-destructive/50 bg-transparent">
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
            </CardContent>
        </Card>
         <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja excluir a categoria <span className="font-semibold">"{categoryToDelete}"</span>?
                        Itens nesta categoria serão movidos para "Outros". Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCategoryConfirm} className="bg-destructive hover:bg-destructive/90">
                        Sim, excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
