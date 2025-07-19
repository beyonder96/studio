
'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FinanceProvider } from '@/contexts/finance-context';
import { usePathname } from 'next/navigation';
import { Spotlight } from '@/components/ui/spotlight';
import { SideNav } from '@/components/side-nav';
import { AnimatePresence, motion } from 'framer-motion';
import { SpecialDayAnimation } from '@/components/special-day-animation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

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
        className={cn(
          'min-h-screen bg-gradient-to-br from-rose-100 via-purple-100 to-cyan-100 dark:from-gray-900 dark:via-purple-900/50 dark:to-gray-900 font-sans antialiased',
        )}
      >
        <SpecialDayAnimation />
        <Spotlight />
        <FinanceProvider>
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
        </FinanceProvider>
        <SideNav />
        <Toaster />
      </body>
    </html>
  );
}
