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
import { EyeOff } from 'lucide-react';
import { FinanceProvider } from '@/contexts/finance-context';

export const metadata: Metadata = {
  title: 'Vida a 2',
  description: 'Sua visão geral do Vida a Dois.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
            <SidebarInset>
                <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="md:hidden" />
                    <div>
                    <h1 className="text-2xl font-bold">Painel Principal</h1>
                    <p className="text-muted-foreground">Sua visão geral do Vida á Dois.</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <EyeOff className="h-5 w-5" />
                </Button>
                </header>
                <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
            </SidebarInset>
            </SidebarProvider>
        </FinanceProvider>
        <Toaster />
      </body>
    </html>
  );
}
