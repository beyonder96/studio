import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

type SummaryCardProps = {
  type: "income" | "expenses";
};

export function SummaryCard({ type }: SummaryCardProps) {
  const isIncome = type === "income";
  const title = isIncome ? "Receitas no Mês" : "Despesas no Mês";
  const amount = "R$ 0,00";
  const icon = isIncome ? (
    <ArrowUpCircle className="h-5 w-5 text-muted-foreground" />
  ) : (
    <ArrowDownCircle className="h-5 w-5 text-muted-foreground" />
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
            </CardTitle>
            <div className="rounded-full bg-gray-100 p-2">
              {icon}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <span className="block text-3xl font-bold tracking-tight">{amount}</span>
      </CardContent>
    </Card>
  );
}
