import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Banknote } from "lucide-react";

export function BalanceCard() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Combinado
            </CardTitle>
            <span className="text-3xl font-bold tracking-tight">R$ 0,00</span>
          </div>
          <div className="rounded-full bg-gray-100 p-2">
            <Banknote className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
         <p className="text-xs text-muted-foreground">Excluindo parcelas futuras</p>
      </CardContent>
    </Card>
  );
}
