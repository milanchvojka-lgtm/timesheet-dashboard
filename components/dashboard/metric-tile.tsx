import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export type MetricVariant = "default" | "internal" | "ops" | "rnd" | "guiding" | "pr" | "ux"

export interface MetricTileProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    label?: string
  }
  variant?: MetricVariant
  className?: string
}

const variantColors: Record<MetricVariant, string> = {
  default: "text-foreground",
  internal: "text-[#3b82f6]",
  ops: "text-[#10b981]",
  rnd: "text-[#f59e0b]",
  guiding: "text-[#8b5cf6]",
  pr: "text-[#ec4899]",
  ux: "text-[#06b6d4]",
}

export function MetricTile({
  title,
  value,
  subtitle,
  trend,
  variant = "default",
  className,
}: MetricTileProps) {
  const valueColor = variantColors[variant]

  const getTrendIcon = () => {
    if (!trend) return null

    if (trend.value > 0) {
      return <ArrowUp className="h-4 w-4 text-green-500" />
    } else if (trend.value < 0) {
      return <ArrowDown className="h-4 w-4 text-red-500" />
    } else {
      return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return ""

    if (trend.value > 0) return "text-green-500"
    if (trend.value < 0) return "text-red-500"
    return "text-muted-foreground"
  }

  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className={cn("text-2xl font-bold", valueColor)}>
            {value}
          </div>

          {(subtitle || trend) && (
            <div className="flex items-center gap-2 text-xs">
              {trend && (
                <div className={cn("flex items-center gap-1", getTrendColor())}>
                  {getTrendIcon()}
                  <span>
                    {Math.abs(trend.value)}% {trend.label || ""}
                  </span>
                </div>
              )}

              {subtitle && (
                <span className="text-muted-foreground">{subtitle}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
