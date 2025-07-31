
'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FinanceProvider } from '@/contexts/finance-context';
import { usePathname } from 'next/navigation';
import { SideNav } from '@/components/side-nav';
import { AnimatePresence, motion } from 'framer-motion';
import { SpecialDayAnimation } from '@/components/special-day-animation';
import { AuthProvider } from '@/contexts/auth-context';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    // Apply theme and color on initial load
    const storedTheme = localStorage.getItem('app-theme') || 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(storedTheme);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Vida a 2</title>
        <meta name="description" content="Sua visão geral do Vida a Dois." />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
        )}
      >
        <AuthProvider>
            <FinanceProvider>
              <SpecialDayAnimation />
              <div className="flex flex-col min-h-screen">
                  <main className="flex-1 w-full p-4 sm:p-6 md:p-8">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {children}
                      </motion.div>
                    </AnimatePresence>
                  </main>
              </div>
              {!isAuthPage && <SideNav />}
            </FinanceProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
