
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Footprints, Flame, BedDouble, RefreshCw, Loader2 } from 'lucide-react';

type HealthData = {
  steps?: number;
  calories?: number;
  sleepSeconds?: number;
};

type GoogleFitCardProps = {
  onSync: () => void;
  isLoading: boolean;
  data: HealthData | null;
};

export function GoogleFitCard({ onSync, isLoading, data }: GoogleFitCardProps) {
  
  const formatSleep = (seconds: number = 0) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="bg-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Resumo Google Fit (Hoje)</CardTitle>
            <CardDescription className="text-xs">Dados de saúde e atividade</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onSync} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !data ? (
             <div className="flex justify-center items-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
        ) : data ? (
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center gap-1">
                    <Footprints className="h-6 w-6 text-blue-500" />
                    <p className="text-lg font-bold">{data.steps?.toLocaleString('pt-BR') || 0}</p>
                    <p className="text-xs text-muted-foreground">Passos</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Flame className="h-6 w-6 text-orange-500" />
                    <p className="text-lg font-bold">{data.calories?.toLocaleString('pt-BR') || 0}</p>
                    <p className="text-xs text-muted-foreground">Calorias</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <BedDouble className="h-6 w-6 text-indigo-500" />
                    <p className="text-lg font-bold">{formatSleep(data.sleepSeconds)}</p>
                    <p className="text-xs text-muted-foreground">Sono</p>
                </div>
            </div>
        ) : (
            <p className="text-sm text-center text-muted-foreground py-8">
              Sincronize com o Google Fit para ver seus dados de atividade.
            </p>
        )}
      </CardContent>
    </Card>
  );
}
