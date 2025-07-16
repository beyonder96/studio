
'use client';

import { useContext } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { FinanceContext, FinanceProvider } from '@/contexts/finance-context';
import { usePathname } from 'next/navigation';
import { UserNav } from '@/components/user-nav';
import { Spotlight } from '@/components/ui/spotlight';
import { MobileNav } from '@/components/mobile-nav';
import { useIsMobile } from '@/hooks/use-mobile';


// We can't export metadata from a client component.
// export const metadata: Metadata = {
//   title: 'Vida a 2',
//   description: 'Sua visão geral do Vida a Dois.',
// };

function Header() {
  const pathname = usePathname();
  const { isSensitiveDataVisible, toggleSensitiveDataVisibility } = useContext(FinanceContext);
  const isMobile = useIsMobile();

  const isDashboard = pathname === '/';
  
  if (pathname === '/profile' || pathname === '/calendar' || pathname === '/discover') {
    return null;
  }
  
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
        case '/discover':
            return { title: 'Descobrir', description: 'Encontre lugares incríveis para visitar.' };
        default:
            return { title: 'Vida a 2', description: '' };
    }
  }
  
  const { title, description } = getPageTitle();


  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-4">
        {!isMobile && <SidebarTrigger />}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isProfilePage = pathname === '/profile';
  const isCalendarPage = pathname === '/calendar';
  const isDiscoverPage = pathname === '/discover';
  const isMobile = useIsMobile();


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Vida a 2</title>
        <meta name="description" content="Sua visão geral do Vida a Dois." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn('min-h-screen bg-background font-sans antialiased')}
      >
        <Spotlight />
        <FinanceProvider>
            <SidebarProvider>
            <AppSidebar />
             {isProfilePage || isCalendarPage || isDiscoverPage ? (
                <main className="flex-1 bg-background">{children}</main>
            ) : (
                <SidebarInset>
                    <Header />
                    <main className={cn(
                        "flex-1 overflow-auto p-4 sm:p-6",
                        isMobile && "pb-24" // Add padding to the bottom on mobile to avoid content being hidden by the mobile nav
                    )}>
                        {children}
                    </main>
                </SidebarInset>
            )}
            <MobileNav />
            </SidebarProvider>
        </FinanceProvider>
        <Toaster />
      </body>
    </html>
  );
}
