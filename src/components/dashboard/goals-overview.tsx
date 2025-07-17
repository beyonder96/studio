import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const goals = [
  { name: "Viagem para a Europa", progress: 75, target: 15000, current: 11250 },
  { name: "Novo Celular", progress: 40, target: 5000, current: 2000 },
  { name: "Reserva de Emergência", progress: 90, target: 20000, current: 18000 },
];

export function GoalsOverview() {
  return (
    <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none">
      <CardHeader>
        <CardTitle>Metas e Desejos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal) => (
            <div key={goal.name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{goal.name}</span>
                <span className="text-sm text-muted-foreground">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">R$ {goal.current.toLocaleString('pt-BR')}</span>
                <span className="text-xs text-muted-foreground">R$ {goal.target.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
