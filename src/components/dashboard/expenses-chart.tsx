"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { name: "Alimentação", total: Math.floor(Math.random() * 2000) + 100, fill: "hsl(var(--chart-1))" },
  { name: "Moradia", total: Math.floor(Math.random() * 2000) + 100, fill: "hsl(var(--chart-2))" },
  { name: "Transporte", total: Math.floor(Math.random() * 2000) + 100, fill: "hsl(var(--chart-3))" },
  { name: "Lazer", total: Math.floor(Math.random() * 2000) + 100, fill: "hsl(var(--chart-4))" },
  { name: "Saúde", total: Math.floor(Math.random() * 2000) + 100, fill: "hsl(var(--chart-5))" },
  { name: "Educação", total: Math.floor(Math.random() * 2000) + 100, fill: "hsl(var(--chart-1))" },
  { name: "Outros", total: Math.floor(Math.random() * 2000) + 100, fill: "hsl(var(--chart-2))" },
]

const chartConfig = {
  total: {
    label: "Total",
  },
  Alimentação: { label: "Alimentação", color: "hsl(var(--chart-1))" },
  Moradia: { label: "Moradia", color: "hsl(var(--chart-2))" },
  Transporte: { label: "Transporte", color: "hsl(var(--chart-3))" },
  Lazer: { label: "Lazer", color: "hsl(var(--chart-4))" },
  Saúde: { label: "Saúde", color: "hsl(var(--chart-5))" },
  Educação: { label: "Educação", color: "hsl(var(--chart-1))" },
  Outros: { label: "Outros", color: "hsl(var(--chart-2))" },
};


export function ExpensesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={80}
                tickFormatter={(value) => value}
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                content={<ChartTooltipContent 
                  formatter={(value) => `R$ ${typeof value === 'number' ? value.toLocaleString('pt-BR') : value}`}
                  hideLabel
                />}
              />
              <Bar dataKey="total" layout="vertical" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
