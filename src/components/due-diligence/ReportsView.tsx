import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Users, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ReportsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Relatórios e Análises</h2>
        <p className="text-muted-foreground">
          Análise detalhada dos resultados das avaliações de fornecedores
        </p>
      </div>

      {/* Métricas Gerais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio Geral</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">87.3%</div>
            <p className="text-xs text-muted-foreground">
              +5.2% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Avaliados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              8 novos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              Excelente engajamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2 dias</div>
            <p className="text-xs text-muted-foreground">
              Para conclusão da avaliação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análise por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Categoria</CardTitle>
          <CardDescription>
            Scores médios organizados por categoria de avaliação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-800">Financeiro</Badge>
                <span className="font-medium">94.2%</span>
              </div>
              <Progress value={94.2} className="w-32" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-100 text-blue-800">Compliance</Badge>
                <span className="font-medium">89.7%</span>
              </div>
              <Progress value={89.7} className="w-32" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-100 text-purple-800">Operacional</Badge>
                <span className="font-medium">85.1%</span>
              </div>
              <Progress value={85.1} className="w-32" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-red-100 text-red-800">Segurança</Badge>
                <span className="font-medium">78.9%</span>
              </div>
              <Progress value={78.9} className="w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Fornecedores */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Melhores Fornecedores</CardTitle>
            <CardDescription>
              Top 5 fornecedores por score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { nome: 'TechCorp Solutions', score: 96.8, categoria: 'Tecnologia' },
                { nome: 'SecureData Inc', score: 94.2, categoria: 'Segurança' },
                { nome: 'FinanceMax Ltd', score: 92.7, categoria: 'Financeiro' },
                { nome: 'OptiLogistics', score: 91.3, categoria: 'Logística' },
                { nome: 'CloudServ Pro', score: 89.9, categoria: 'Cloud' }
              ].map((fornecedor, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{fornecedor.nome}</p>
                    <p className="text-sm text-muted-foreground">{fornecedor.categoria}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{fornecedor.score}%</p>
                    <p className="text-xs text-muted-foreground">#{index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fornecedores em Atenção</CardTitle>
            <CardDescription>
              Fornecedores com scores baixos que precisam de atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { nome: 'Basic Services', score: 58.2, categoria: 'Serviços', status: 'Crítico' },
                { nome: 'QuickFix Co', score: 62.1, categoria: 'Manutenção', status: 'Atenção' },
                { nome: 'StandardCorp', score: 67.8, categoria: 'Materiais', status: 'Baixo' }
              ].map((fornecedor, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{fornecedor.nome}</p>
                    <p className="text-sm text-muted-foreground">{fornecedor.categoria}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{fornecedor.score}%</p>
                    <Badge variant="destructive" className="text-xs">
                      {fornecedor.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exportar Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Relatórios</CardTitle>
          <CardDescription>
            Baixe relatórios detalhados em diferentes formatos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Relatório Completo (PDF)
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Scores por Fornecedor (Excel)
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Análise de Tendências (CSV)
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Dashboard Executivo (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}