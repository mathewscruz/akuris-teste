import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RiscosStats } from "@/hooks/useRiscosStats";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskScoreCardProps {
  stats: RiscosStats | undefined;
  loading?: boolean;
}

const getColor = (score: number): string => {
  if (score >= 80) return "hsl(var(--success))";
  if (score >= 60) return "hsl(var(--primary))";
  if (score >= 40) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
};

const getLabel = (score: number): string => {
  if (score === 0) return "Sem dados";
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Bom";
  if (score >= 40) return "Atenção";
  return "Crítico";
};

/**
 * Converte o scoreAtual (média ponderada de periculosidade, 0–100 onde
 * 100 = todos críticos) para um health score legível (0–100 onde 100 = ótimo).
 *
 * Fórmula anterior era incorreta: misturava riscos baixos (contagem de riscos)
 * com tratamentos concluídos (contagem de tratamentos), podendo ultrapassar 100.
 */
const calcDisplayScore = (stats: RiscosStats): number => {
  if (stats.total === 0) return 0;
  // scoreAtual já usa média ponderada por nível (Crítico=100, Alto=75, …)
  // Invertemos para obter o health score: 0 riscos críticos → score alto
  return Math.max(0, Math.min(100, Math.round(100 - stats.scoreAtual)));
};

export function RiskScoreCard({ stats, loading }: RiskScoreCardProps) {
  if (loading || !stats) {
    return (
      <Card className="bg-card border border-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="pt-2 pb-3">
          <Skeleton className="h-[100px] w-[160px] mx-auto" />
        </CardContent>
      </Card>
    );
  }

  const displayScore = calcDisplayScore(stats);
  const scoreColor   = getColor(displayScore);
  const label        = getLabel(displayScore);

  // variacao7dias: positivo = scoreAtual subiu (piorou) → health caiu (ruim)
  // Invertemos o sinal para mostrar a variação do health score
  const healthVariacao = stats.variacao7dias !== null ? -stats.variacao7dias : null;
  const hasVariation   = healthVariacao !== null && healthVariacao !== 0;
  const isPositive     = healthVariacao !== null && healthVariacao > 0;

  const radius       = 60;
  const circumference = Math.PI * radius;
  const progress     = (displayScore / 100) * circumference;
  const strokeWidth  = 10;

  return (
    <Card className="bg-card border border-border shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-sm font-medium leading-none">
          Score de Risco
        </CardTitle>
        {hasVariation && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isPositive ? "text-success" : "text-destructive"
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {Math.abs(healthVariacao!)}%
            </span>
          </div>
        )}
        {!hasVariation && stats.variacao7dias !== null && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Minus className="h-3 w-3" />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        <div className="flex flex-col items-center">
          {/* Gauge semicircular */}
          <svg width="160" height="90" viewBox="0 0 160 100">
            <path
              d="M 20 90 A 60 60 0 0 1 140 90"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <path
              d="M 20 90 A 60 60 0 0 1 140 90"
              fill="none"
              stroke={scoreColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference}`}
              className="transition-all duration-1000"
            />
            <text
              x="80"
              y="72"
              textAnchor="middle"
              className="fill-foreground"
              fontSize="28"
              fontWeight="bold"
            >
              {displayScore}
            </text>
            <text
              x="80"
              y="92"
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize="11"
            >
              {label}
            </text>
          </svg>

          {/* Faixas de referência */}
          <div className="flex items-center gap-2.5 mt-1">
            {[
              { label: "Crítico", color: "bg-destructive" },
              { label: "Atenção",  color: "bg-warning"     },
              { label: "Bom",      color: "bg-primary"     },
              { label: "Excelente",color: "bg-success"     },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div className={cn("w-2 h-2 rounded-full", item.color)} />
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
