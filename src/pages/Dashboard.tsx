import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, AlertTriangle, FileCheck, Shield, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const Dashboard = () => {
  const { profile } = useAuth();

  const stats = [
    {
      title: 'Ativos Cadastrados',
      value: '127',
      description: 'Total de ativos na plataforma',
      icon: Database,
      trend: '+5.2%',
    },
    {
      title: 'Riscos Identificados',
      value: '23',
      description: 'Riscos em monitoramento',
      icon: AlertTriangle,
      trend: '+2.1%',
    },
    {
      title: 'Controles Ativos',
      value: '89',
      description: 'Controles implementados',
      icon: FileCheck,
      trend: '+8.3%',
    },
    {
      title: 'Incidentes Abertos',
      value: '5',
      description: 'Requer atenção',
      icon: Shield,
      trend: '-12.5%',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {profile?.nome}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 mr-1 text-success" />
                <span className="text-xs text-success">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Ações Recentes</CardTitle>
            <CardDescription>
              Últimas atividades na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">Novo ativo cadastrado</p>
                  <p className="text-muted-foreground">Servidor WEB-01 adicionado ao inventário</p>
                  <p className="text-xs text-muted-foreground mt-1">2 horas atrás</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">Risco atualizado</p>
                  <p className="text-muted-foreground">Vulnerabilidade de segurança identificada</p>
                  <p className="text-xs text-muted-foreground mt-1">4 horas atrás</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">Auditoria concluída</p>
                  <p className="text-muted-foreground">Controles de acesso validados</p>
                  <p className="text-xs text-muted-foreground mt-1">1 dia atrás</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Resumo de Conformidade</CardTitle>
            <CardDescription>
              Status geral dos controles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Controles Implementados</span>
                <span className="text-sm text-success">89%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Riscos Mitigados</span>
                <span className="text-sm text-primary">76%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '76%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Documentação Atualizada</span>
                <span className="text-sm text-warning">62%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-warning h-2 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;