import { AlertCircle } from "lucide-react";

export function AIDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-md bg-muted/50 border border-border ${className}`}>
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <span>
        AI-generated content may be inaccurate. Always review before sending or acting on it.
      </span>
    </div>
  );
}
