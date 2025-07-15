
'use client';

import { useContext, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { PlusCircle, Edit, Trash2, Moon, Sun, AlertTriangle, ArrowLeft, MoreHorizontal, Mail, Cake, Check, Camera } from 'lucide-react';
import { FinanceContext } from '@/contexts/finance-context';
import { Label } from '@/components/ui/label';

const pastelColors = [
    { name: 'Amarelo', value: '45 95% 55%' },
    { name: 'Verde', value: '145 63% 49%' },
    { name: 'Azul', value: '210 89% 64%' },
    { name: 'Rosa', value: '340 82% 76%' },
    { name: 'Roxo', value: '260 82% 76%' },
    { name: 'Laranja', value: '25 95% 65%' },
]

type Theme = 'light' | 'dark' | 'system';

const defaultProfileImage = "https://placehold.co/600x800.png";

export default function ProfilePage() {
  const { 
    accounts,
    cards,
    resetAllData
  } = useContext(FinanceContext);

  const [theme, setTheme] = useState<Theme>('system');
  const [selectedColor, setSelectedColor] = useState(pastelColors[0].value);
  const [profileImage, setProfileImage] = useState<string>(defaultProfileImage);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const storedTheme = localStorage.getItem('app-theme') as Theme | null;
    const storedColor = localStorage.getItem('app-color');
    const storedImage = localStorage.getItem('app-profile-image');

    if (storedTheme) {
        setTheme(storedTheme);
    }
    if (storedColor) {
        setSelectedColor(storedColor);
    }
    if (storedImage) {
        setProfileImage(storedImage);
    }
  }, []);

  useEffect(() => {
    if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', systemTheme === 'dark');
    } else {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (selectedColor) {
        document.documentElement.style.setProperty('--primary', selectedColor);
        document.documentElement.style.setProperty('--accent', selectedColor);
        document.documentElement.style.setProperty('--ring', selectedColor);
        localStorage.setItem('app-color', selectedColor);
    }
  }, [selectedColor]);

  useEffect(() => {
    if (profileImage && profileImage !== defaultProfileImage) {
      localStorage.setItem('app-profile-image', profileImage);
    }
  }, [profileImage]);
  
  const handleColorChange = (colorValue: string) => {
    setSelectedColor(colorValue);
  }

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="space-y-8 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6">
        {/* Profile Header */}
        <div className="relative w-full h-[50vh] md:h-[40vh] text-white">
            <Image 
                src={profileImage}
                alt="Foto do casal" 
                layout="fill" 
                objectFit="cover"
                className="brightness-90"
                data-ai-hint="couple photo"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />

            <div className="absolute top-6 left-4 right-4 flex justify-between z-20">
                <Button variant="ghost" size="icon" className="bg-black/20 hover:bg-black/40 rounded-full" onClick={() => window.history.back()}>
                    <ArrowLeft />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="bg-black/20 hover:bg-black/40 rounded-full">
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={handleImageClick}>
                           <Camera className="mr-2 h-4 w-4" />
                           Trocar Foto
                        </DropdownMenuItem>
                        <DropdownMenuItem>Editar Nomes</DropdownMenuItem>
                        <DropdownMenuItem>Editar Data</DropdownMenuItem>
                        <DropdownMenuItem>Editar E-mails</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-6 z-10">
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold">Kenned & Nicoli</h1>
                    <p className="text-lg text-white/80">Juntos há 2 anos</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-foreground">
                    <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 rounded-xl space-y-1 border border-white/20">
                        <div className="flex items-center gap-2 text-sm text-white/80">
                            <Cake className="w-4 h-4" />
                            <span>Aniversário de Namoro</span>
                        </div>
                        <p className="text-xl font-semibold text-white">15 de Agosto</p>
                        <p className="text-sm text-white/80">de 2022</p>
                    </div>
                     <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 rounded-xl space-y-1 border border-white/20">
                        <div className="flex items-center gap-2 text-sm text-white/80">
                            <Mail className="w-4 h-4" />
                            <span>E-mails</span>
                        </div>
                        <p className="font-semibold truncate text-white">kenned@example.com</p>
                        <p className="font-semibold truncate text-white">nicoli@example.com</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="px-4 sm:px-6 space-y-8">
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
                                    onClick={() => handleColorChange(color.value)}
                                    style={{ backgroundColor: `hsl(${color.value})`}}
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
    </div>
  );
}
