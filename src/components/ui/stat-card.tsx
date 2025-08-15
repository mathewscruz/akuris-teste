import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const statCardVariants = cva(
  "relative overflow-hidden transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border",
        success: "border-success/20 bg-success/5",
        warning: "border-warning/20 bg-warning/5", 
        destructive: "border-destructive/20 bg-destructive/5",
        info: "border-info/20 bg-info/5",
        primary: "border-primary/20 bg-primary/5",
      },
      interactive: {
        true: "hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
)

interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label?: string
    period?: string
  }
  badge?: {
    label: string
    variant?: "default" | "secondary" | "destructive" | "success" | "warning" | "info"
  }
  actions?: React.ReactNode
  loading?: boolean
}

export function StatCard({
  className,
  variant,
  interactive,
  title,
  value,
  description,
  icon,
  trend,
  badge,
  actions,
  loading = false,
  ...props
}: StatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null
    
    if (trend.value > 0) return <TrendingUp className="h-3 w-3" />
    if (trend.value < 0) return <TrendingDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  const getTrendColor = () => {
    if (!trend) return ""
    
    if (trend.value > 0) return "text-success"
    if (trend.value < 0) return "text-destructive"
    return "text-muted-foreground"
  }

  if (loading) {
    return (
      <Card className={cn(statCardVariants({ variant, interactive }), className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            {badge && <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />}
          </div>
          <div className="h-5 w-5 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(statCardVariants({ variant, interactive }), className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium leading-none">{title}</CardTitle>
          {badge && (
            <Badge variant={badge.variant} size="sm">
              {badge.label}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/50">
              {icon}
            </div>
          )}
          {actions}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold leading-none">{value}</div>
          <div className="flex items-center justify-between text-xs">
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className={cn("flex items-center gap-1 font-medium", getTrendColor())}>
                {getTrendIcon()}
                <span>
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                  {trend.label && ` ${trend.label}`}
                </span>
                {trend.period && (
                  <span className="text-muted-foreground ml-1">
                    vs {trend.period}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Decorative gradient overlay for visual appeal */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-br from-primary/20 to-transparent" />
      </div>
    </Card>
  )
}

export default StatCard