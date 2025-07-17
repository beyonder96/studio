
'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FinanceProvider } from '@/contexts/finance-context';
import { Spotlight } from '@/components/ui/spotlight';
import { FloatingNav } from '@/components/floating-nav';
import { usePathname } from 'next/navigation';
import Header from '@/components/header';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isFullScreenPage = ['/profile', '/discover'].includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Vida a 2</title>
        <meta name="description" content="Sua visão geral do Vida a Dois." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn('min-h-screen bg-background font-sans antialiased')}
      >
        <Spotlight />
        <FinanceProvider>
            <div className="flex flex-col min-h-screen">
                 {!isFullScreenPage && <Header />}
                 <main className={cn(
                    "flex-1 w-full max-w-5xl mx-auto",
                    !isFullScreenPage && "p-4 sm:p-6"
                 )}>
                    {children}
                </main>
                <FloatingNav />
            </div>
        </FinanceProvider>
        <Toaster />
      </body>
    </html>
  );
}
