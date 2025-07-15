import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

type SummaryCardProps = {
  type: "income" | "expenses";
};

export function SummaryCard({ type }: SummaryCardProps) {
  const isIncome = type === "income";
  const title = isIncome ? "Renda Mensal" : "Despesas Mensais";
  const amount = isIncome ? "R$ 8.500,00" : "R$ 3.250,75";
  const icon = isIncome ? (
    <ArrowUp className="h-8 w-8 text-green-500" />
  ) : (
    <ArrowDown className="h-8 w-8 text-red-500" />
  );
  const percentageChange = isIncome ? "+12.5%" : "+8.2%";
  const changeColor = isIncome ? "text-green-500" : "text-red-500";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
            </CardTitle>
            {icon}
        </div>
      </CardHeader>
      <CardContent>
        <span className="block text-3xl font-bold tracking-tight">{amount}</span>
        <p className={`text-xs ${changeColor}`}>{percentageChange} do último mês</p>
      </CardContent>
    </Card>
  );
}
