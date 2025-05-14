import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  isConnected: boolean;
}

export default function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        isConnected ? "bg-success text-gray-900" : "bg-destructive text-white"
      )}
    >
      <span className={cn(
        "w-2 h-2 mr-1.5 rounded-full",
        isConnected ? "bg-gray-900 animate-pulse" : "bg-white"
      )}></span>
      {isConnected ? "Connected" : "Reconnecting..."}
    </Badge>
  );
}
