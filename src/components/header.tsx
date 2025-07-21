

'use client';

import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import { FinanceContext } from '@/contexts/finance-context';
import { UserNav } from '@/components/user-nav';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/dashboard/logo';

export default function Header() {
  const pathname = usePathname();
  const { isSensitiveDataVisible, toggleSensitiveDataVisibility } = useContext(FinanceContext);

  const isDashboard = pathname === '/';
  
  const getPageTitle = () => {
    switch (pathname) {
        case '/':
            return { title: 'Painel Principal', description: 'Sua visão geral do Vida a Dois.' };
        case '/finance':
            return { title: 'Finanças', description: 'Gerencie suas transações.' };
        case '/accounts':
            return { title: 'Categorias', description: 'Gerencie suas categorias de receita e despesa.' };
        case '/recurrences':
            return { title: 'Recorrências', description: 'Visualize suas transações recorrentes.' };
        case '/purchases':
            return { title: 'Compras', description: 'Crie e gerencie suas listas de compras.' };
        case '/pantry':
            return { title: 'Despensa', description: 'Veja o que você tem em casa.' };
        case '/tasks':
            return { title: 'Tarefas', description: 'Gerencie suas tarefas do dia a dia.' };
        case '/wishes':
            return { title: 'Lista de Desejos', description: 'Realizem seus sonhos juntos.' };
        case '/settings':
            return { title: 'Ajustes', description: 'Personalize o aplicativo e gerencie seus dados.' };
        default:
            return { title: 'Vida a 2', description: '' };
    }
  }
  
  const { title, description } = getPageTitle();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 px-4 backdrop-blur-sm sm:h-20 sm:px-6">
        <div className="flex-1">
            <div className="md:hidden">
                <Logo />
            </div>
            <div className="hidden md:block">
                 <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
                 <p className="hidden text-sm text-muted-foreground sm:block">{description}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            {isDashboard && (
                <Button variant="ghost" size="icon" onClick={toggleSensitiveDataVisibility}>
                {isSensitiveDataVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </Button>
            )}
            <UserNav />
        </div>
    </header>
  );
}

