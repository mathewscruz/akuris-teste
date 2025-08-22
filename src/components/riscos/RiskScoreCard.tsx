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
            <div className="space-y-2">
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

  // Calcular tendência real baseada na efetividade dos tratamentos
  const treatmentEfficiency = stats.total > 0 ? (stats.tratados / stats.total) * 100 : 0;
  const acceptanceRate = stats.total > 0 ? (stats.aceitos / stats.total) * 100 : 0;
  const criticalityScore = 100 - (criticalPercentage * 0.5 + highPercentage * 0.3 + mediumPercentage * 0.15 + lowPercentage * 0.05);
  
  // Tendência baseada na combinação de fatores (pode ser positiva ou negativa)
  const trendValue = Math.round((treatmentEfficiency + acceptanceRate + criticalityScore) / 3 - 50);
  const isPositiveTrend = trendValue >= 0;

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
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositiveTrend ? 'text-success' : 'text-destructive'}`}>
            <TrendingUp className={`h-3 w-3 ${!isPositiveTrend ? 'rotate-180' : ''}`} />
            <span>{isPositiveTrend ? '+' : ''}{trendValue}%</span>
          </div>
        </div>

        {/* Barras Horizontais Dinâmicas */}
        <div className="space-y-2">
          {/* Crítico */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium text-foreground">CRÍTICO</span>
            </div>
            <div className="flex items-center gap-2 flex-1 ml-2">
              <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-destructive h-full rounded-full transition-all duration-300" 
                  style={{ width: `${criticalPercentage}%` }}
                />
              </div>
              <span className="text-xs font-bold text-foreground min-w-[2rem] text-right">{criticalPercentage}%</span>
            </div>
          </div>

          {/* Alto */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium text-foreground">ALTO</span>
            </div>
            <div className="flex items-center gap-2 flex-1 ml-2">
              <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-warning h-full rounded-full transition-all duration-300" 
                  style={{ width: `${highPercentage}%` }}
                />
              </div>
              <span className="text-xs font-bold text-foreground min-w-[2rem] text-right">{highPercentage}%</span>
            </div>
          </div>

          {/* Médio */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium text-foreground">MÉDIO</span>
            </div>
            <div className="flex items-center gap-2 flex-1 ml-2">
              <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-info h-full rounded-full transition-all duration-300" 
                  style={{ width: `${mediumPercentage}%` }}
                />
              </div>
              <span className="text-xs font-bold text-foreground min-w-[2rem] text-right">{mediumPercentage}%</span>
            </div>
          </div>

          {/* Baixo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium text-foreground">BAIXO</span>
            </div>
            <div className="flex items-center gap-2 flex-1 ml-2">
              <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-success h-full rounded-full transition-all duration-300" 
                  style={{ width: `${lowPercentage}%` }}
                />
              </div>
              <span className="text-xs font-bold text-foreground min-w-[2rem] text-right">{lowPercentage}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}