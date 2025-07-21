
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Banknote,
  ShoppingBasket,
  Gift,
  Target,
  Carrot,
  CheckSquare,
  Calendar,
  Settings,
  User,
  PanelRightOpen,
  X,
  Sparkles,
  GalleryVerticalEnd,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Painel' },
  { href: '/finance', icon: Banknote, label: 'Finanças' },
  { href: '/goals', icon: Target, label: 'Metas' },
  { href: '/wishes', icon: Gift, label: 'Desejos' },
  { href: '/purchases', icon: ShoppingBasket, label: 'Compras' },
  { href: '/pantry', icon: Carrot, label: 'Despensa' },
  { href: '/tasks', icon: CheckSquare, label: 'Tarefas' },
  { href: '/calendar', icon: Calendar, label: 'Calendário' },
  { href: '/timeline', icon: GalleryVerticalEnd, label: 'Linha do Tempo' },
  { href: '/discover', icon: Sparkles, label: 'Descobrir' },
];

const bottomNavItems = [
    { href: '/settings', icon: Settings, label: 'Ajustes' },
    { href: '/profile', icon: User, label: 'Perfil' },
]

export function SideNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render the nav if user is not logged in
  if (!user) {
    return null;
  }

  const isActive = (href: string) => pathname === href;

  const handleLinkClick = () => {
    setIsOpen(false);
  };
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
        setIsOpen(false);
    }
  };

  const panelVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="fixed top-1/2 right-0 -translate-y-1/2 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background border-l border-t border-b border-border p-2 rounded-l-2xl shadow-lg transition-transform hover:scale-105"
          aria-label="Abrir navegação"
        >
          <PanelRightOpen className="h-6 w-6 text-muted-foreground" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBackdropClick}
            />
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-64 bg-background border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                 <h2 className="text-lg font-semibold">Navegação</h2>
                 <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-muted">
                    <X className="h-5 w-5"/>
                 </button>
              </div>

              <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                  {navItems.map((item) => {
                    const Component = item.disabled ? 'div' : Link;
                    return (
                        <li key={item.href}>
                        <Component href={item.href} onClick={!item.disabled ? handleLinkClick : undefined} className={cn(item.disabled && "cursor-not-allowed")}>
                            <div
                            className={cn(
                                'flex items-center gap-4 p-3 rounded-lg transition-colors text-foreground',
                                isActive(item.href) && !item.disabled
                                ? 'bg-primary/20 text-primary font-semibold'
                                : 'hover:bg-muted',
                                item.disabled && "opacity-50"
                            )}
                            >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                            </div>
                        </Component>
                        </li>
                    )
                  })}
                </ul>
              </nav>
               <nav className="p-4 border-t">
                 <ul className="space-y-2">
                    {bottomNavItems.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href} onClick={handleLinkClick}>
                                <div
                                className={cn(
                                    'flex items-center gap-4 p-3 rounded-lg transition-colors text-foreground',
                                    isActive(item.href)
                                    ? 'bg-primary/20 text-primary font-semibold'
                                    : 'hover:bg-muted'
                                )}
                                >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                                </div>
                            </Link>
                        </li>
                    ))}
                 </ul>
               </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
