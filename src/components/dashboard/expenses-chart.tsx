"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { name: "Alimentação", total: Math.floor(Math.random() * 2000) + 100 },
  { name: "Moradia", total: Math.floor(Math.random() * 2000) + 100 },
  { name: "Transporte", total: Math.floor(Math.random() * 2000) + 100 },
  { name: "Lazer", total: Math.floor(Math.random() * 2000) + 100 },
  { name: "Saúde", total: Math.floor(Math.random() * 2000) + 100 },
  { name: "Educação", total: Math.floor(Math.random() * 2000) + 100 },
  { name: "Outros", total: Math.floor(Math.random() * 2000) + 100 },
]

export function ExpensesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
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
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
              content={<ChartTooltipContent 
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
              />}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
