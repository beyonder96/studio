
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
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

const mainNavItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
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
];

export function MobileNav() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }
  
  const isActive = (href: string) => pathname === href;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-background/80 backdrop-blur-sm border-t p-2 mx-4 mb-4 rounded-2xl shadow-lg">
        <div className="flex justify-around items-center">
          {mainNavItems.map((item) => (
            <Link href={item.href} key={item.href}>
              <div
                className={cn(
                  'flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-colors',
                  isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </div>
            </Link>
          ))}
          <Sheet>
            <SheetTrigger asChild>
              <div
                className={cn(
                  'flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-colors text-muted-foreground cursor-pointer'
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[10px] font-medium mt-1">Mais</span>
              </div>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader className="text-left mb-4">
                <SheetTitle>Mais Opções</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-4 gap-4">
                {moreNavItems.map((item) => (
                    <Link href={item.href} key={item.href}>
                        <div
                            className={cn(
                                'flex flex-col items-center justify-center gap-2 p-2 rounded-lg',
                                isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                            )}
                        >
                            <item.icon className="h-6 w-6" />
                            <span className="text-xs text-center">{item.label}</span>
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
