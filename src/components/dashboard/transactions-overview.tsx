import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const transactions = [
  { name: "Netflix", category: "Assinatura", amount: -39.9, initial: "N" },
  { name: "Salário", category: "Renda", amount: 8500, initial: "S" },
  { name: "Almoço", category: "Alimentação", amount: -45.5, initial: "A" },
  { name: "Padaria", category: "Alimentação", amount: -22.3, initial: "P" },
  { name: "Gasolina", category: "Transporte", amount: -150.0, initial: "G" },
];

export function TransactionsOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <div key={index} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/20 text-primary-foreground">{transaction.initial}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{transaction.name}</p>
                <p className="text-sm text-muted-foreground">{transaction.category}</p>
              </div>
              <div className={`ml-auto font-medium ${transaction.amount > 0 ? "text-green-500" : ""}`}>
                {transaction.amount > 0 ? "+" : ""}R$ {transaction.amount.toFixed(2).replace('.', ',')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
