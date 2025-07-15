import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ExpensesChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Despesas por Categoria (Mês Atual)</CardTitle>
        <CardDescription>As 5 maiores categorias de despesa no mês.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-60 items-center justify-center text-muted-foreground">
          Nenhuma despesa este mês.
        </div>
      </CardContent>
    </Card>
  )
}
