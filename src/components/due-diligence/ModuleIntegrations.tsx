import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, FileText, Plus, TrendingUp, BarChart3, Users, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IntegrationRule {
  id: string;
  tipo: 'criar_risco' | 'atualizar_contrato' | 'gerar_documento';
  condicao: 'score_baixo' | 'nao_respondido' | 'categoria_especifica';
  valor_condicao: string;
  acao: string;
  ativo: boolean;
}

interface IntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: IntegrationRule;
  onSuccess: () => void;
}

function IntegrationDialog({ open, onOpenChange, rule, onSuccess }: IntegrationDialogProps) {
  const [formData, setFormData] = useState({
    tipo: 'criar_risco' as IntegrationRule['tipo'],
    condicao: 'score_baixo' as IntegrationRule['condicao'],
    valor_condicao: '60',
    acao: 'Criar risco de fornecedor com score baixo',
    ativo: true
  });
  const { toast } = useToast();

  useEffect(() => {
    if (rule) {
      setFormData({
        tipo: rule.tipo,
        condicao: rule.condicao,
        valor_condicao: rule.valor_condicao,
        acao: rule.acao,
        ativo: rule.ativo
      });
    }
  }, [rule, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const ruleData = {
        tipo: formData.tipo,
        condicao: formData.condicao,
        valor_condicao: formData.valor_condicao,
        acao: formData.acao,
        ativo: formData.ativo
      };

      if (rule) {
        // Atualizar regra existente (simular)
        console.log('Atualizando regra:', ruleData);
      } else {
        // Criar nova regra (simular)
        console.log('Criando nova regra:', ruleData);
      }

      toast({
        title: rule ? "Regra atualizada" : "Regra criada",
        description: "A regra de integração foi configurada com sucesso."
      });

      onSuccess();
      onOpenChange(false);

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {rule ? 'Editar Regra de Integração' : 'Nova Regra de Integração'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Ação</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as IntegrationRule['tipo'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="criar_risco">Criar Risco</SelectItem>
                  <SelectItem value="atualizar_contrato">Atualizar Contrato</SelectItem>
                  <SelectItem value="gerar_documento">Gerar Documento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Condição</Label>
              <Select 
                value={formData.condicao} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, condicao: value as IntegrationRule['condicao'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score_baixo">Score Baixo</SelectItem>
                  <SelectItem value="nao_respondido">Não Respondido</SelectItem>
                  <SelectItem value="categoria_especifica">Categoria Específica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Valor da Condição</Label>
            <Input
              value={formData.valor_condicao}
              onChange={(e) => setFormData(prev => ({ ...prev, valor_condicao: e.target.value }))}
              placeholder={
                formData.condicao === 'score_baixo' ? 'Ex: 60 (pontos)' :
                formData.condicao === 'categoria_especifica' ? 'Ex: seguranca' :
                'Ex: 7 (dias)'
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição da Ação</Label>
            <Input
              value={formData.acao}
              onChange={(e) => setFormData(prev => ({ ...prev, acao: e.target.value }))}
              placeholder="Descreva o que será feito quando a condição for atendida"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {rule ? 'Atualizar' : 'Criar'} Regra
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ModuleIntegrations() {
  const [integrations, setIntegrations] = useState<IntegrationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<IntegrationRule | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      
      // Mock data para demonstração
      const mockIntegrations: IntegrationRule[] = [
        {
          id: '1',
          tipo: 'criar_risco',
          condicao: 'score_baixo',
          valor_condicao: '60',
          acao: 'Criar risco automaticamente para fornecedores com score abaixo de 60%',
          ativo: true
        },
        {
          id: '2',
          tipo: 'atualizar_contrato',
          condicao: 'categoria_especifica',
          valor_condicao: 'seguranca',
          acao: 'Marcar contrato como "requer revisão" para assessments de segurança',
          ativo: true
        },
        {
          id: '3',
          tipo: 'gerar_documento',
          condicao: 'nao_respondido',
          valor_condicao: '7',
          acao: 'Gerar relatório de fornecedores inadimplentes após 7 dias',
          ativo: false
        }
      ];

      setIntegrations(mockIntegrations);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar integrações",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (id: string) => {
    try {
      setIntegrations(prev => 
        prev.map(rule => 
          rule.id === id ? { ...rule, ativo: !rule.ativo } : rule
        )
      );

      toast({
        title: "Status atualizado",
        description: "A integração foi atualizada com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (rule: IntegrationRule) => {
    setEditingRule(rule);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingRule(undefined);
    setDialogOpen(true);
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'criar_risco': return <AlertTriangle className="h-4 w-4" />;
      case 'atualizar_contrato': return <FileText className="h-4 w-4" />;
      case 'gerar_documento': return <BarChart3 className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (tipo: string) => {
    const labels = {
      'criar_risco': 'Criar Risco',
      'atualizar_contrato': 'Atualizar Contrato',
      'gerar_documento': 'Gerar Documento'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getConditionLabel = (condicao: string) => {
    const labels = {
      'score_baixo': 'Score Baixo',
      'nao_respondido': 'Não Respondido',
      'categoria_especifica': 'Categoria Específica'
    };
    return labels[condicao as keyof typeof labels] || condicao;
  };

  if (loading) {
    return <div className="text-center p-8">Carregando integrações...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Integrações com Outros Módulos</h2>
          <p className="text-muted-foreground">
            Configure ações automáticas baseadas nos resultados de due diligence
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Integração
        </Button>
      </div>

      {/* Estatísticas de integrações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Regras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Regras Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {integrations.filter(r => r.ativo).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ações Executadas (Mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de integrações */}
      <div className="space-y-4">
        {integrations.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getTypeIcon(rule.tipo)}
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {getTypeLabel(rule.tipo)}
                      <Badge variant={rule.ativo ? 'default' : 'secondary'}>
                        {rule.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {rule.acao}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(rule)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleIntegration(rule.id)}
                  >
                    {rule.ativo ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  <strong>Condição:</strong> {getConditionLabel(rule.condicao)}
                </span>
                <span>
                  <strong>Valor:</strong> {rule.valor_condicao}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {integrations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma integração configurada</h3>
            <p className="text-muted-foreground mb-4">
              Configure integrações para automatizar ações baseadas nos resultados de due diligence
            </p>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Integração
            </Button>
          </CardContent>
        </Card>
      )}

      <IntegrationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={editingRule}
        onSuccess={() => {
          fetchIntegrations();
          setDialogOpen(false);
        }}
      />
    </div>
  );
}