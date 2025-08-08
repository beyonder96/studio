
'use client';

import { useState, useMemo, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Weight, Plus, LineChart, Trash2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { WeightRecord, FinanceContext } from '@/contexts/finance-context';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AddWeightRecordDialog } from './add-weight-record-dialog';

type WeightTrackerCardProps = {
  title: string;
  personKey: 'healthInfo1' | 'healthInfo2';
  weightRecords: WeightRecord[];
  onAddWeight: (data: { date: string, weight: number }) => void;
};

export function WeightTrackerCard({ title, personKey, weightRecords, onAddWeight }: WeightTrackerCardProps) {
  const { deleteWeightRecord } = useContext(FinanceContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = (data: { date: string, weight: number }) => {
    onAddWeight(data);
    setIsDialogOpen(false);
  };
  
  const sortedRecords = useMemo(() => {
    if(!weightRecords) return [];
    return [...weightRecords].sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [weightRecords]);

  const chartData = useMemo(() => {
    return sortedRecords.slice(-10).map(record => ({
      date: format(parseISO(record.date), "dd/MM", { locale: ptBR }),
      weight: record.weight,
      id: record.id,
    }));
  }, [sortedRecords]);
  
  const currentWeight = sortedRecords.length > 0 ? sortedRecords[sortedRecords.length - 1].weight : 0;

  return (
    <>
      <Card className="bg-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
          <CardDescription>
            {currentWeight > 0 ? `${currentWeight.toFixed(1)} kg` : 'Nenhum registro'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']}/>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                Peso
                                            </span>
                                            <span className="font-bold text-muted-foreground">
                                                {payload[0].value} kg
                                            </span>
                                        </div>
                                    </div>
                                    </div>
                                )
                                }
                                return null
                            }}
                        />
                         <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={true} fill="url(#colorWeight)" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-center text-muted-foreground pt-4">
              Adicione o primeiro registro para ver o gráfico.
            </p>
          )}
        </CardContent>
      </Card>
      <AddWeightRecordDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
