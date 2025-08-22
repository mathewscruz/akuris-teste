import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { RiscosStats } from "@/hooks/useRiscosStats";

interface RiskScoreCardProps {
  stats: RiscosStats | undefined;
  loading?: boolean;
}

export function RiskScoreCard({ stats, loading }: RiskScoreCardProps) {
  if (loading || !stats) {
    return (
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium leading-none">Score de Riscos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            <div className="h-2 w-full bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scorePercentage = stats.total > 0 ? Math.round((stats.tratados / stats.total) * 100) : 0;
  const criticalPercentage = stats.total > 0 ? Math.round((stats.criticos / stats.total) * 100) : 0;
  const highPercentage = stats.total > 0 ? Math.round((stats.altos / stats.total) * 100) : 0;
  const mediumPercentage = stats.total > 0 ? Math.round((stats.medios / stats.total) * 100) : 0;
  const lowPercentage = stats.total > 0 ? Math.round((stats.baixos / stats.total) * 100) : 0;

  return (
    <Card className="bg-card border border-border shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium leading-none text-foreground">
          Score de Riscos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Principal */}
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-foreground">{scorePercentage}%</div>
          <div className="flex items-center gap-1 text-success text-sm font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>+5.7%</span>
          </div>
        </div>

        {/* Barra de Progresso Segmentada */}
        <div className="w-full bg-muted rounded-full h-2 flex overflow-hidden">
          {stats.criticos > 0 && (
            <div 
              className="bg-destructive h-full" 
              style={{ width: `${criticalPercentage}%` }}
            />
          )}
          {stats.altos > 0 && (
            <div 
              className="bg-warning h-full" 
              style={{ width: `${highPercentage}%` }}
            />
          )}
          {stats.medios > 0 && (
            <div 
              className="bg-info h-full" 
              style={{ width: `${mediumPercentage}%` }}
            />
          )}
          {stats.baixos > 0 && (
            <div 
              className="bg-success h-full" 
              style={{ width: `${lowPercentage}%` }}
            />
          )}
        </div>

        {/* Distribuição por Criticidade */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 bg-destructive rounded-full mb-1" />
            <span className="text-muted-foreground">Crítico</span>
            <span className="font-medium text-foreground">{criticalPercentage}%</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 bg-warning rounded-full mb-1" />
            <span className="text-muted-foreground">Alto</span>
            <span className="font-medium text-foreground">{highPercentage}%</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 bg-info rounded-full mb-1" />
            <span className="text-muted-foreground">Médio</span>
            <span className="font-medium text-foreground">{mediumPercentage}%</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 bg-success rounded-full mb-1" />
            <span className="text-muted-foreground">Baixo</span>
            <span className="font-medium text-foreground">{lowPercentage}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}