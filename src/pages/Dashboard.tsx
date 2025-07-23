
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, TrendingUp, Bell, Activity, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { MatrizVisualizacao } from '@/components/riscos/MatrizVisualizacao';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { RiskScoreTimeline } from '@/components/dashboard/RiskScoreTimeline';

interface DashboardStats {
  securityScore: number;
  criticalAlerts: number;
  complianceRate: number;
  monthlyTrend: number;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    securityScore: 0,
    criticalAlerts: 0,
    complianceRate: 0,
    monthlyTrend: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardStats();
    }
  }, [profile]);

  const fetchDashboardStats = async () => {
    try {
      // Buscar riscos
      const { data: riscos } = await supabase
        .from('riscos')
        .select('nivel_risco_inicial');

      // Buscar denúncias pendentes
      const { data: denuncias } = await supabase
        .from('denuncias')
        .select('status')
        .in('status', ['nova', 'em_investigacao']);

      // Buscar controles vencidos
      const { data: controles } = await supabase
        .from('controles')
        .select('proxima_avaliacao')
        .lt('proxima_avaliacao', new Date().toISOString());

      // Buscar auditorias pendentes
      const { data: auditorias } = await supabase
        .from('auditorias')
        .select('status')
        .eq('status', 'planejamento');

      // Calcular score de segurança baseado na distribuição de riscos
      const totalRiscos = riscos?.length || 0;
      const riscosAltos = riscos?.filter(r => 
        r.nivel_risco_inicial === 'Alto' || 
        r.nivel_risco_inicial === 'Crítico' || 
        r.nivel_risco_inicial === 'Muito Alto'
      ).length || 0;

      const securityScore = totalRiscos > 0 
        ? Math.round(((totalRiscos - riscosAltos) / totalRiscos) * 100)
        : 100;

      // Alertas críticos
      const criticalAlerts = 
        (denuncias?.length || 0) + 
        (controles?.length || 0) + 
        (auditorias?.length || 0) + 
        riscosAltos;

      // Taxa de conformidade (simplificada)
      const complianceRate = Math.max(0, 100 - (riscosAltos * 10));

      // Tendência mensal (simulada - seria calculada com dados históricos)
      const monthlyTrend = securityScore > 70 ? 5 : securityScore > 50 ? 0 : -3;

      const newStats: DashboardStats = {
        securityScore,
        criticalAlerts,
        complianceRate,
        monthlyTrend
      };

      setStats(newStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl space-y-6">
      {/* Saudação personalizada */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Olá, {profile?.nome || 'Usuário'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo da sua situação de segurança e conformidade
        </p>
      </div>

      {/* 1ª Linha - KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Global de Segurança</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.securityScore}%</div>
            <div className="flex items-center mt-2">
              <TrendingUp className={`h-4 w-4 mr-1 ${stats.monthlyTrend >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-xs ${stats.monthlyTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.monthlyTrend >= 0 ? '+' : ''}{stats.monthlyTrend}% este mês
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalAlerts}</div>
            <div className="flex items-center mt-2">
              <Badge variant={stats.criticalAlerts > 5 ? "destructive" : stats.criticalAlerts > 0 ? "outline" : "default"}>
                {stats.criticalAlerts > 5 ? 'Atenção urgente' : stats.criticalAlerts > 0 ? 'Monitorar' : 'Tudo ok'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformidade Regulatória</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complianceRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              Taxa de conformidade atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendência Mensal</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.monthlyTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.monthlyTrend >= 0 ? '+' : ''}{stats.monthlyTrend}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Variação do score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2ª Linha - Matriz de Risco e Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MatrizVisualizacao />
        <RecentActivities />
      </div>

      {/* 3ª Linha - Timeline do Score de Risco */}
      <RiskScoreTimeline />
    </div>
  );
}
