import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo() {
  return (
    <div className="flex items-center gap-3 group-data-[state=collapsed]:justify-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
        <Heart className="h-6 w-6 text-primary-foreground" />
      </div>
      <div className={cn("group-data-[state=collapsed]:hidden")}>
        <h1 className="text-lg font-bold text-foreground">Vida a 2</h1>
      </div>
    </div>
  );
}
