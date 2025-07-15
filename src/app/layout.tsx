
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

// We can't export metadata from a client component.
// export const metadata: Metadata = {
//   title: 'Vida a 2',
//   description: 'Sua visão geral do Vida a Dois.',
// };

function Header() {
  const pathname = usePathname();
  const { isSensitiveDataVisible, toggleSensitiveDataVisibility } = useContext(FinanceContext);

  const isDashboard = pathname === '/';
  
  if (pathname === '/profile') {
    return null;
  }

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-2xl font-bold">Painel Principal</h1>
          <p className="text-muted-foreground">Sua visão geral do Vida á Dois.</p>
        </div>
      </div>
      {isDashboard && (
        <Button variant="ghost" size="icon" onClick={toggleSensitiveDataVisibility}>
          {isSensitiveDataVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </Button>
      )}
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
        className={cn('min-h-screen bg-background font-body antialiased')}
      >
        <FinanceProvider>
            <SidebarProvider>
            <AppSidebar />
             {isProfilePage ? (
                <main className="flex-1">{children}</main>
            ) : (
                <SidebarInset>
                    <Header />
                    <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
                </SidebarInset>
            )}
            </SidebarProvider>
        </FinanceProvider>
        <Toaster />
      </body>
    </html>
  );
}

    