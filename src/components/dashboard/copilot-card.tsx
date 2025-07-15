import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowUpRight } from "lucide-react";

export function CopilotCard() {
  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-800 dark:to-gray-900 flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          <CardTitle className="text-base font-semibold text-accent-foreground/90">
            Copiloto Financeiro
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-foreground/80">
          Você gastou 15% a mais em restaurantes este mês. Que tal tentar cozinhar em casa em alguns dias da semana para economizar?
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full bg-transparent border-accent text-accent hover:bg-accent/10 hover:text-accent">
          Ver Insights <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
