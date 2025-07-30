
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function AccountsPage() {
  const router = useRouter();

  useEffect(() => {
    // This page is deprecated and redirects to settings
    router.replace('/settings');
  }, [router]);

  return (
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl h-full">
      <CardContent className="p-4 sm:p-6 h-full">
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg">Redirecionando para os Ajustes...</p>
        </div>
      </CardContent>
    </Card>
  );
}
