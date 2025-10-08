import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedStatCardProps {
  title: string;
  value: number;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

export function AnimatedStatCard({ title, value, description, icon, variant = 'default' }: AnimatedStatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000; // 1 segundo
    const steps = 30;
    const stepValue = value / steps;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(stepValue * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  const variantStyles = {
    default: 'border-border',
    destructive: 'border-destructive/50 bg-destructive/5',
    success: 'border-success/50 bg-success/5',
    warning: 'border-warning/50 bg-warning/5'
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium leading-none">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{displayValue}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
