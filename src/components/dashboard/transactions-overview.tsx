import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Car,
  Utensils,
  Home,
  HeartPulse,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "../ui/badge";

const transactions = [
  {
    icon: <Utensils className="h-5 w-5" />,
    category: "Alimentação",
    description: "iFood",
    amount: -45.9,
    type: "expense",
  },
  {
    icon: <Car className="h-5 w-5" />,
    category: "Transporte",
    description: "Uber",
    amount: -22.5,
    type: "expense",
  },
  {
    icon: <Home className="h-5 w-5" />,
    category: "Moradia",
    description: "Aluguel",
    amount: -800,
    type: "expense",
  },
  {
    icon: <HeartPulse className="h-5 w-5" />,
    category: "Saúde",
    description: "Farmácia",
    amount: -75.0,
    type: "expense",
  },
  {
    icon: <MoreHorizontal className="h-5 w-5" />,
    category: "Outros",
    description: "Salário Nicoli",
    amount: 2500,
    type: "income",
  },
];

export function TransactionsOverview() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
        <CardDescription>
          Suas últimas 5 movimentações.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <div key={index} className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {transaction.icon}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.category}
                </p>
              </div>
              <Badge
                variant={transaction.type === "income" ? "default" : "secondary"}
                className={
                  transaction.type === 'income'
                    ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50'
                    : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50'
                }
              >
                {transaction.amount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
