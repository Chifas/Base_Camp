import { Loader2 } from "lucide-react";

export default function SessionLoading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-lg font-medium text-muted-foreground">
        Conectando a la sesión...
      </p>
    </div>
  );
}
