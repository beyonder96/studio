import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowUpRight } from "lucide-react";

export function BalanceCard() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Balanço Combinado
            </CardTitle>
            <span className="text-3xl font-bold tracking-tight">R$ 25.480,55</span>
          </div>
          <Wallet className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Ver Contas <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
