
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  className?: string;
}

export function KPICard({ title, value, subtitle, icon, trend, className }: KPICardProps) {
  return (
    <Card className={cn("relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center text-sm font-medium",
                trend.positive ? "text-green-600" : "text-red-600"
              )}>
                <span className={cn(
                  "inline-block w-2 h-2 rounded-full mr-2",
                  trend.positive ? "bg-green-500" : "bg-red-500"
                )}>
                </span>
                {trend.positive ? '+' : ''}{trend.value}% {trend.label}
              </div>
            )}
          </div>
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
