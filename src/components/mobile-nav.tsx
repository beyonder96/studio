
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Banknote,
  ShoppingBasket,
  Gift,
  MoreHorizontal,
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './ui/button';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/finance', icon: Banknote, label: 'Finanças' },
  { href: '/purchases', icon: ShoppingBasket, label: 'Compras' },
  { href: '/wishes', icon: Gift, label: 'Desejos' },
];

export function MobileNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-background/80 backdrop-blur-sm border-t p-2 mx-4 mb-4 rounded-2xl shadow-lg">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link href={item.href} key={item.href}>
                <div
                  className={cn(
                    'flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors',
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium mt-1">{item.label}</span>
                </div>
              </Link>
            );
          })}
          <Button
             variant="ghost"
             onClick={() => setOpenMobile(true)}
             className="flex flex-col items-center justify-center w-16 h-12 text-muted-foreground"
          >
             <MoreHorizontal className="h-5 w-5" />
             <span className="text-[10px] font-medium mt-1">Mais</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
