import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  BarChart3 
} from 'lucide-react';

interface ContasDashboardProps {
  contas: any[];
  sistemas: any[];
}

export default function ContasDashboard({ contas, sistemas }: ContasDashboardProps) {
  // Calcular métricas
  const contasAtivas = contas.filter(c => c.status === 'ativo').length;
  const contasExpiradas = contas.filter(c => c.status === 'expirado').length;
  const contasPendentes = contas.filter(c => c.status === 'pendente_aprovacao').length;
  
  // Contas que vencem nos próximos 30 dias
  const hoje = new Date();
  const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
  const contasVencendo = contas.filter(c => {
    const dataExpiracao = new Date(c.data_expiracao);
    return dataExpiracao <= em30Dias && dataExpiracao >= hoje && c.status === 'ativo';
  }).length;

  // Distribuição por nível de privilégio
  const nivelPrivilegio = contas.reduce((acc, conta) => {
    acc[conta.nivel_privilegio] = (acc[conta.nivel_privilegio] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Distribuição por sistema
  const contasPorSistema = contas.reduce((acc, conta) => {
    const nomeSystem = conta.sistemas_privilegiados?.nome_sistema || 'Não definido';
    acc[nomeSystem] = (acc[nomeSystem] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Taxa de conformidade (contas ativas vs total)
  const taxaConformidade = contas.length > 0 ? (contasAtivas / contas.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contas.length}</div>
            <p className="text-xs text-muted-foreground">
              Contas privilegiadas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{contasAtivas}</div>
            <p className="text-xs text-muted-foreground">
              Com acesso vigente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencendo em 30 dias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{contasVencendo}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{contasPendentes}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Nível de Privilégio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Distribuição por Nível de Privilégio
            </CardTitle>
            <CardDescription>
              Contas ativas organizadas por nível de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(nivelPrivilegio).map(([nivel, quantidade]) => {
              const porcentagem = contas.length > 0 ? (Number(quantidade) / contas.length) * 100 : 0;
              const corNivel = {
                'critico': 'bg-red-500',
                'alto': 'bg-orange-500',
                'medio': 'bg-yellow-500',
                'baixo': 'bg-green-500',
              }[nivel] || 'bg-gray-500';

              return (
                <div key={nivel} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${corNivel}`} />
                      <span className="text-sm font-medium capitalize">{nivel}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {String(quantidade)} ({porcentagem.toFixed(0)}%)
                    </div>
                  </div>
                  <Progress value={porcentagem} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Sistemas com mais contas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sistemas com Mais Contas
            </CardTitle>
            <CardDescription>
              Top sistemas por número de contas privilegiadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(contasPorSistema)
              .sort(([,a], [,b]) => Number(b) - Number(a))
              .slice(0, 5)
              .map(([sistema, quantidade]) => {
                const porcentagem = contas.length > 0 ? (Number(quantidade) / contas.length) * 100 : 0;
                
                return (
                  <div key={sistema} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{String(sistema)}</span>
                      <div className="text-sm text-muted-foreground">
                        {String(quantidade)} contas
                      </div>
                    </div>
                    <Progress value={porcentagem} className="h-2" />
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      {/* Conformidade e alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Taxa de Conformidade
            </CardTitle>
            <CardDescription>
              Porcentagem de contas em estado ativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {taxaConformidade.toFixed(1)}%
            </div>
            <Progress value={taxaConformidade} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {contasAtivas} de {contas.length} contas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sistemas Cadastrados
            </CardTitle>
            <CardDescription>
              Total de sistemas monitorados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{sistemas.length}</div>
            <div className="space-y-1">
              {['critica', 'alta', 'media', 'baixa'].map(criticidade => {
                const count = sistemas.filter(s => s.criticidade === criticidade).length;
                if (count === 0) return null;
                
                return (
                  <div key={criticidade} className="flex justify-between text-sm">
                    <span className="capitalize">{criticidade}:</span>
                    <span>{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Importantes
            </CardTitle>
            <CardDescription>
              Itens que requerem atenção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {contasExpiradas > 0 && (
              <div className="flex items-center gap-2 p-2 rounded bg-red-50 border border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">
                  {contasExpiradas} conta(s) expirada(s)
                </span>
              </div>
            )}
            
            {contasVencendo > 0 && (
              <div className="flex items-center gap-2 p-2 rounded bg-yellow-50 border border-yellow-200">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {contasVencendo} conta(s) vencendo em 30 dias
                </span>
              </div>
            )}
            
            {contasPendentes > 0 && (
              <div className="flex items-center gap-2 p-2 rounded bg-blue-50 border border-blue-200">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  {contasPendentes} conta(s) pendente(s)
                </span>
              </div>
            )}

            {contasExpiradas === 0 && contasVencendo === 0 && contasPendentes === 0 && (
              <div className="flex items-center gap-2 p-2 rounded bg-green-50 border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Tudo em conformidade
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}