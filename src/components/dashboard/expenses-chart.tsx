
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { useContext } from "react";
import { FinanceContext } from "@/contexts/finance-context";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { category: "Alimentação", expenses: 1860.75, fill: "var(--color-food)" },
  { category: "Moradia", expenses: 800.50, fill: "var(--color-housing)" },
  { category: "Transporte", expenses: 500.00, fill: "var(--color-transport)" },
  { category: "Lazer", expenses: 300.80, fill: "var(--color-leisure)" },
  { category: "Outros", expenses: 200.00, fill: "var(--color-others)" },
];

const chartConfig = {
  expenses: {
    label: "Despesas",
  },
  food: {
    label: "Alimentação",
    color: "hsl(var(--chart-1))",
  },
  housing: {
    label: "Moradia",
    color: "hsl(var(--chart-2))",
  },
  transport: {
    label: "Transporte",
    color: "hsl(var(--chart-3))",
  },
  leisure: {
    label: "Lazer",
    color: "hsl(var(--chart-4))",
  },
  others: {
    label: "Outros",
    color: "hsl(var(--chart-5))",
  },
}

export function ExpensesChart() {
  const { isSensitiveDataVisible, formatCurrency } = useContext(FinanceContext);

  const customTooltipFormatter = (value: number) => {
    if (!isSensitiveDataVisible) return 'R$ ••••••';
    return `R$ ${Number(value).toLocaleString('pt-BR')}`;
  };
  
  const customTickFormatter = (value: number) => {
    if (!isSensitiveDataVisible) return '•';
     return `R$ ${value}`;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Despesas por Categoria (Mês Atual)</CardTitle>
        <CardDescription>As 5 maiores categorias de despesa no mês.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-60 w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
             <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickFormatter={customTickFormatter}
              tickLine={false}
              axisLine={false}
              width={80}
              hide={!isSensitiveDataVisible}
            />
             <Tooltip
              cursor={false}
              content={<ChartTooltipContent
                formatter={customTooltipFormatter}
                indicator="dot"
              />}
            />
            <Bar dataKey={isSensitiveDataVisible ? "expenses" : ""} radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
