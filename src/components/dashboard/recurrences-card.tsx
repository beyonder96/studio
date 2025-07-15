import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Repeat } from "lucide-react";

export function RecurrencesCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
                Recorrências
            </CardTitle>
            <div className="rounded-full bg-gray-100 p-2">
              <Repeat className="h-5 w-5 text-muted-foreground" />
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <span className="block text-3xl font-bold tracking-tight">0</span>
        <p className="text-xs text-muted-foreground">Ativas e parceladas</p>
      </CardContent>
    </Card>
  );
}
