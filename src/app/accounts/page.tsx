
'use client';

// This file is now a placeholder. The Vouchers functionality has been merged into the /cards page.
// The file is kept to avoid breaking navigation links until they can be updated.
// You can safely remove this file and update any links pointing to /accounts.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function VouchersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cards');
  }, [router]);

  return (
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl h-full">
        <CardContent className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center">
            <Loader2 className="h-12 w-12 mb-4 text-primary animate-spin"/>
            <h2 className="text-2xl font-bold">Redirecionando...</h2>
            <p className="text-muted-foreground mt-2">A seção de Vales agora faz parte da página de Cartões.</p>
        </CardContent>
    </Card>
  );
}
