
'use client';

import { useContext, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { PlusCircle, Edit, Trash2, Camera, Palette, Moon, Sun, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { FinanceContext } from '@/contexts/finance-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const pastelColors = [
    { name: 'Amarelo', value: '45 95% 55%' },
    { name: 'Verde', value: '145 63% 49%' },
    { name: 'Azul', value: '210 89% 64%' },
    { name: 'Rosa', value: '340 82% 76%' },
    { name: 'Roxo', value: '260 82% 76%' },
    { name: 'Laranja', value: '25 95% 65%' },
]

export default function ProfilePage() {
  const { 
    accounts,
    cards,
  } = useContext(FinanceContext);
  const [theme, setTheme] = useState('system');
  const [selectedColor, setSelectedColor] = useState(pastelColors[0].value);
  
  const handleColorChange = (colorValue: string) => {
    setSelectedColor(colorValue);
    // This is where you would apply the theme color change
    document.documentElement.style.setProperty('--primary', colorValue);
    document.documentElement.style.setProperty('--accent', colorValue);
    document.documentElement.style.setProperty('--ring', colorValue);
  }

  return (
    <div className="space-y-8">
        {/* Profile Header */}
        <div className="relative flex flex-col items-center">
            <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                    <AvatarImage src="https://placehold.co/128x128.png" data-ai-hint="profile picture woman"/>
                    <AvatarFallback>KN</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="icon" className="absolute bottom-1 right-1 rounded-full h-9 w-9 bg-background/80 backdrop-blur-sm">
                    <Camera className="h-5 w-5" />
                    <span className="sr-only">Trocar foto</span>
                </Button>
            </div>
            <div className="mt-4 text-center">
                <h1 className="text-3xl font-bold">Kenned & Nicoli</h1>
                <p className="text-muted-foreground">Juntos há 2 anos</p>
            </div>
        </div>

        {/* Personal Info */}
        <Card>
            <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Gerencie seus dados e de seu parceiro(a).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="your-email">Seu E-mail</Label>
                        <Input id="your-email" type="email" defaultValue="kenned@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="partner-email">E-mail do Parceiro(a)</Label>
                        <Input id="partner-email" type="email" defaultValue="nicoli@example.com" />
                    </div>
                </div>
                 <Button>Salvar Alterações</Button>
            </CardContent>
        </Card>

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
                                className={`h-10 w-10 rounded-full border-2 ${selectedColor === color.value ? 'border-primary' : 'border-transparent'}`}
                                onClick={() => handleColorChange(color.value)}
                                style={{ backgroundColor: `hsl(${color.value})`}}
                                aria-label={`Selecionar cor ${color.name}`}
                            >
                                {selectedColor === color.value && <div className="h-4 w-4 rounded-full bg-primary-foreground" />}
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
                            listas de compras e outras informações inseridas serão permanentemente
                            excluídos. Sua conta de usuário não será deletada.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => console.log('Dados Limpos!')} // Add reset logic here
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
