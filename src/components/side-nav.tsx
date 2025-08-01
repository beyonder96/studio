
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
  CreditCard,
  Home,
  Landmark,
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
import { LogoIcon } from './dashboard/logo';

const navItems = [
  { href: '/finance', icon: Banknote, label: 'Finanças' },
  { href: '/accounts', icon: Landmark, label: 'Contas' },
  { href: '/cards', icon: CreditCard, label: 'Cartões & Vales' },
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

  // Don't render the nav if user is not logged in or on dashboard
  if (!user || pathname === '/login' || pathname === '/signup') {
    return null;
  }
  
  const NavButton = () => (
     <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black/5 backdrop-blur-lg border border-white/10 shadow-lg text-white/80 p-4 rounded-[20px] transition-transform hover:scale-105 flex items-center justify-center"
        aria-label="Abrir navegação"
    >
        <LayoutDashboard className="h-6 w-6" />
    </button>
  );
  
  if (pathname === '/') {
    // Mobile-only FAB for dashboard
     return (
        <div className="fixed bottom-6 right-6 z-40 md:hidden">
            <NavButton />
            <NavPanel isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
    );
  }

  // Persistent Home button for all other pages
  return (
    <>
        <div className="fixed top-6 left-6 z-40">
             <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/">
                            <button
                                className="bg-black/5 backdrop-blur-lg border border-white/10 shadow-lg text-white/80 p-3 rounded-2xl transition-transform hover:scale-105"
                                aria-label="Voltar para o Painel"
                            >
                                <Home className="h-5 w-5" />
                            </button>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>Painel Principal</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <div className="fixed bottom-6 right-6 z-40">
             <NavButton />
            <NavPanel isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
    </>
  );
}


const NavPanel = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) => {
    const pathname = usePathname();
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
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
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
              className="fixed bottom-20 right-6 w-64 bg-background/80 backdrop-blur-md border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                 <h2 className="text-lg font-semibold">Navegação</h2>
                 <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-muted">
                    <X className="h-5 w-5"/>
                 </button>
              </div>

              <nav className="flex-1 p-2 overflow-y-auto max-h-[60vh]">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    return (
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
                    )
                  })}
                </ul>
              </nav>
               <nav className="p-2 border-t">
                 <ul className="space-y-1">
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
    )
}
