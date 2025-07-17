
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Banknote,
  ShoppingBasket,
  Gift,
  MoreHorizontal,
  Compass,
  Wallet,
  ArrowRightLeft,
  Carrot,
  CheckSquare,
  Calendar,
  Settings,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Separator } from './ui/separator';

const mainNavItems = [
  { href: '/', icon: LayoutDashboard, label: 'Painel' },
  { href: '/finance', icon: Banknote, label: 'Finanças' },
  { href: '/purchases', icon: ShoppingBasket, label: 'Compras' },
  { href: '/wishes', icon: Gift, label: 'Desejos' },
];

const moreNavItems = [
    { href: '/discover', icon: Compass, label: 'Descobrir' },
    { href: '/accounts', icon: Wallet, label: 'Categorias' },
    { href: '/recurrences', icon: ArrowRightLeft, label: 'Recorrências' },
    { href: '/pantry', icon: Carrot, label: 'Despensa' },
    { href: '/tasks', icon: CheckSquare, label: 'Tarefas' },
    { href: '/calendar', icon: Calendar, label: 'Calendário' },
    { href: '/settings', icon: Settings, label: 'Ajustes' },
    { href: '/profile', icon: User, label: 'Perfil' },
];

export function FloatingNav() {
  const pathname = usePathname();
  
  const isActive = (href: string) => pathname === href;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg md:max-w-md">
      <div className="bg-background/80 backdrop-blur-lg border p-2 rounded-2xl shadow-2xl">
        <div className="flex justify-around items-center">
          {mainNavItems.map((item) => (
            <Link href={item.href} key={item.href} className="flex-1">
              <div
                className={cn(
                  'flex flex-col items-center justify-center h-14 rounded-lg transition-colors',
                  isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[11px] font-medium mt-1">{item.label}</span>
              </div>
            </Link>
          ))}
          <Sheet>
            <SheetTrigger asChild>
              <div
                className={cn(
                  'flex flex-1 flex-col items-center justify-center h-14 rounded-lg transition-colors text-muted-foreground cursor-pointer hover:bg-muted/50'
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[11px] font-medium mt-1">Mais</span>
              </div>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
              <SheetHeader className="text-left mb-4">
                <SheetTitle>Todas as Ferramentas</SheetTitle>
              </SheetHeader>
              <Separator />
              <div className="grid grid-cols-4 gap-2 py-4">
                {moreNavItems.map((item) => (
                    <Link href={item.href} key={item.href}>
                        <div
                            className={cn(
                                'flex flex-col items-center justify-center text-center gap-2 p-3 rounded-lg aspect-square',
                                isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                            )}
                        >
                            <item.icon className="h-6 w-6" />
                            <span className="text-xs">{item.label}</span>
                        </div>
                    </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
