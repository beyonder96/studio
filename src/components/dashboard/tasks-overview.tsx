import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const tasks = [
  { id: "task1", label: "Pagar fatura do cartão de crédito", done: true },
  { id: "task2", label: "Declarar Imposto de Renda", done: false },
  { id: "task3", label: "Reavaliar investimentos", done: false },
  { id: "task4", label: "Pagar aluguel", done: true },
];

export function TasksOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarefas Financeiras</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-3">
              <Checkbox id={task.id} checked={task.done} />
              <Label
                htmlFor={task.id}
                className={`flex-1 text-sm ${
                  task.done ? "text-muted-foreground line-through" : ""
                }`}
              >
                {task.label}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
