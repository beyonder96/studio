
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function DiscoverPage() {
  return (
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl h-full">
      <CardContent className="p-4 sm:p-6 h-full">
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
            <Sparkles className="mx-auto h-16 w-16 text-primary/50" />
            <h1 className="mt-6 text-3xl font-bold text-foreground">Em Breve</h1>
            <p className="mt-2 text-lg">
                Estamos preparando um assistente de recomendações personalizado para vocês.
            </p>
            <p className="mt-1 text-sm">Aguarde novidades!</p>
        </div>
      </CardContent>
    </Card>
  );
}
