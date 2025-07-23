import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface RiskScoreData {
  month: string;
  score: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
}

export function RiskScoreTimeline() {
  const { profile } = useAuth();
  const [data, setData] = useState<RiskScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentScore, setCurrentScore] = useState(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    if (profile) {
      fetchRiskScoreData();
    }
  }, [profile]);

  const calculateRiskScore = (criticalRisks: number, highRisks: number, mediumRisks: number, lowRisks: number) => {
    // Score baseado na distribuição de riscos (0-100)
    const totalRisks = criticalRisks + highRisks + mediumRisks + lowRisks;
    if (totalRisks === 0) return 100;

    const weightedScore = (
      (criticalRisks * 0) +
      (highRisks * 25) +
      (mediumRisks * 60) +
      (lowRisks * 100)
    ) / totalRisks;

    return Math.round(weightedScore);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Moderado';
    return 'Crítico';
  };

  const fetchRiskScoreData = async () => {
    try {
      // Buscar dados dos últimos 12 meses
      const months = [];
      const now = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
        
        // Buscar riscos criados até esse mês
        const { data: riscosData } = await supabase
          .from('riscos')
          .select('nivel_risco_inicial, created_at')
          .lte('created_at', new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString());

        const riscos = riscosData || [];
        const criticalRisks = riscos.filter(r => r.nivel_risco_inicial === 'Crítico').length;
        const highRisks = riscos.filter(r => r.nivel_risco_inicial === 'Alto' || r.nivel_risco_inicial === 'Muito Alto').length;
        const mediumRisks = riscos.filter(r => r.nivel_risco_inicial === 'Médio' || r.nivel_risco_inicial === 'Moderado').length;
        const lowRisks = riscos.filter(r => r.nivel_risco_inicial === 'Baixo' || r.nivel_risco_inicial === 'Muito Baixo').length;

        const score = calculateRiskScore(criticalRisks, highRisks, mediumRisks, lowRisks);

        months.push({
          month: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          score,
          criticalRisks,
          highRisks,
          mediumRisks,
          lowRisks
        });
      }

      setData(months);
      
      // Calcular score atual e tendência
      if (months.length >= 2) {
        const current = months[months.length - 1].score;
        const previous = months[months.length - 2].score;
        setCurrentScore(current);
        
        if (current > previous + 5) setTrend('up');
        else if (current < previous - 5) setTrend('down');
        else setTrend('stable');
      }
    } catch (error) {
      console.error('Erro ao carregar dados de score de risco:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Score de Segurança ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Score de Segurança ao Longo do Tempo</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className={`text-2xl font-bold ${getScoreColor(currentScore)}`}>
                  {currentScore}
                </span>
                {trend === 'up' && <TrendingUp className="h-5 w-5 text-green-600" />}
                {trend === 'down' && <TrendingDown className="h-5 w-5 text-red-600" />}
                {trend === 'stable' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
              </div>
              <Badge variant={currentScore >= 60 ? 'default' : 'destructive'}>
                {getScoreLabel(currentScore)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-sm text-muted-foreground"
              />
              <YAxis 
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                className="text-sm text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => [
                  `${value} - ${getScoreLabel(value)}`,
                  'Score de Segurança'
                ]}
                labelFormatter={(label) => `Período: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="url(#scoreGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Críticos</p>
            <p className="text-lg font-semibold text-red-600">
              {data[data.length - 1]?.criticalRisks || 0}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Altos</p>
            <p className="text-lg font-semibold text-orange-600">
              {data[data.length - 1]?.highRisks || 0}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Médios</p>
            <p className="text-lg font-semibold text-yellow-600">
              {data[data.length - 1]?.mediumRisks || 0}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Baixos</p>
            <p className="text-lg font-semibold text-green-600">
              {data[data.length - 1]?.lowRisks || 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}