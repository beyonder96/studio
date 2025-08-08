
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Weight } from 'lucide-react';
import { HealthInfo } from '@/contexts/finance-context';
import { cn } from '@/lib/utils';

type BMICardProps = {
  title: string;
  healthInfo?: HealthInfo;
};

const getBmiInfo = (bmi: number) => {
    if (bmi < 18.5) return { classification: 'Abaixo do peso', color: 'text-blue-500' };
    if (bmi < 24.9) return { classification: 'Peso saudável', color: 'text-green-500' };
    if (bmi < 29.9) return { classification: 'Sobrepeso', color: 'text-yellow-500' };
    return { classification: 'Obesidade', color: 'text-red-500' };
};

export function BMICard({ title, healthInfo }: BMICardProps) {

  const { bmi, latestWeight, height } = useMemo(() => {
    const weightRecords = healthInfo?.weightRecords || [];
    const heightInCm = healthInfo?.height || 0;
    
    if (weightRecords.length === 0 || heightInCm <= 0) {
      return { bmi: 0, latestWeight: 0, height: 0 };
    }

    const sortedRecords = [...weightRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestWeight = sortedRecords[0].weight;
    const heightInMeters = heightInCm / 100;
    const bmiValue = latestWeight / (heightInMeters * heightInMeters);

    return { bmi: bmiValue, latestWeight, height: heightInCm };
  }, [healthInfo]);

  const bmiInfo = getBmiInfo(bmi);

  return (
    <Card className="bg-transparent">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>
          Índice de Massa Corporal
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bmi > 0 ? (
          <div className="flex flex-col items-center justify-center text-center">
             <div className="flex items-baseline gap-2">
                <p className="text-5xl font-bold">{bmi.toFixed(1)}</p>
                <span className="text-muted-foreground">kg/m²</span>
             </div>
             <Badge variant="outline" className={cn("mt-2", bmiInfo.color, bmiInfo.color.replace('text-', 'border-'))}>
                {bmiInfo.classification}
             </Badge>
          </div>
        ) : (
          <p className="text-sm text-center text-muted-foreground py-8">
            Adicione peso e altura para calcular o IMC.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
