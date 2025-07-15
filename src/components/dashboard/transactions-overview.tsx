import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function TransactionsOverview() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
        <p className="text-sm text-muted-foreground">Suas últimas 5 movimentações.</p>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          Nenhuma transação ainda.
        </div>
      </CardContent>
    </Card>
  );
}
