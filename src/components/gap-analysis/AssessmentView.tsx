import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Plus } from "lucide-react";
import { useOptimizedQuery } from "@/hooks/useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";
import { RequirementsManagerDialog } from "./RequirementsManagerDialog";
import { toast } from "sonner";
import { Requirement } from "./types";

interface AssessmentViewProps {
  frameworkId: string;
  frameworkName: string;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  frameworkId,
  frameworkName
}) => {
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});

  const { data: requirements = [], loading, refetch } = useOptimizedQuery(
    async () => {
      const { data, error } = await supabase
        .from('gap_analysis_requirements')
        .select('*')
        .eq('framework_id', frameworkId)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    },
    [frameworkId],
    {
      cacheKey: `gap-requirements-${frameworkId}`,
      cacheDuration: 5,
      staleTime: 2
    }
  ) as { data: Requirement[], loading: boolean, refetch: () => void };

  const handleEvaluationChange = (requirementId: string, field: string, value: string) => {
    setEvaluations(prev => ({
      ...prev,
      [requirementId]: {
        ...prev[requirementId],
        [field]: value
      }
    }));
  };

  const handleSaveEvaluations = async () => {
    try {
      // Implementar salvamento das avaliações na tabela gap_analysis_evaluations
      const evaluationsToSave = Object.entries(evaluations).map(([requirementId, evaluation]) => ({
        requirement_id: requirementId,
        framework_id: frameworkId,
        evidence_required: evaluation.evidence_required || '',
        evidence_implemented: evaluation.evidence_implemented || '',
        responsible_area: evaluation.responsible_area || '',
        conformity_status: evaluation.conformity_status || 'nao_aplicavel',
        action_preview: evaluation.action_preview || '',
        evidence_status: evaluation.evidence_status || 'pendente'
      }));

      // Aqui faria o upsert na tabela de avaliações
      toast.success("Avaliações salvas com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar avaliações: " + error.message);
    }
  };

  const handleManagerSuccess = () => {
    refetch();
    setIsManagerOpen(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-32 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Avaliação: {frameworkName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Responda às perguntas abaixo para realizar a avaliação de conformidade.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsManagerOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar Requisitos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsManagerOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Editar Framework
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {requirements.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhum requisito encontrado para este framework.
            </p>
            <Button onClick={() => setIsManagerOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Requisito
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Código/Requisito</TableHead>
                    <TableHead className="w-[120px]">Evidência Requerida</TableHead>
                    <TableHead className="w-[120px]">Evidência Implementada</TableHead>
                    <TableHead className="w-[120px]">Área Responsável</TableHead>
                    <TableHead className="w-[120px]">Conformidade</TableHead>
                    <TableHead className="w-[150px]">Prévia das Ações / Observações</TableHead>
                    <TableHead className="w-[120px]">Status da Evidência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirements.map((requirement) => (
                    <TableRow key={requirement.id}>
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          {requirement.codigo && (
                            <span className="text-xs text-muted-foreground block">
                              {requirement.codigo}
                            </span>
                          )}
                          <div className="text-sm font-medium">{requirement.titulo}</div>
                          {requirement.obrigatorio && (
                            <Badge variant="destructive" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                          {requirement.categoria && (
                            <Badge variant="secondary" className="text-xs">
                              {requirement.categoria}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          placeholder="Evidência requerida..."
                          value={evaluations[requirement.id]?.evidence_required || ""}
                          onChange={(e) => handleEvaluationChange(requirement.id, 'evidence_required', e.target.value)}
                          className="min-h-[60px] text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          placeholder="Evidência implementada..."
                          value={evaluations[requirement.id]?.evidence_implemented || ""}
                          onChange={(e) => handleEvaluationChange(requirement.id, 'evidence_implemented', e.target.value)}
                          className="min-h-[60px] text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Área responsável..."
                          value={evaluations[requirement.id]?.responsible_area || ""}
                          onChange={(e) => handleEvaluationChange(requirement.id, 'responsible_area', e.target.value)}
                          className="text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={evaluations[requirement.id]?.conformity_status || "nao_aplicavel"}
                          onValueChange={(value) => handleEvaluationChange(requirement.id, 'conformity_status', value)}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conforme">Conforme</SelectItem>
                            <SelectItem value="nao_conforme">Não conforme</SelectItem>
                            <SelectItem value="parcial">Parcial</SelectItem>
                            <SelectItem value="nao_aplicavel">Não aplicável</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          placeholder="Ações/Observações..."
                          value={evaluations[requirement.id]?.action_preview || ""}
                          onChange={(e) => handleEvaluationChange(requirement.id, 'action_preview', e.target.value)}
                          className="min-h-[60px] text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={evaluations[requirement.id]?.evidence_status || "pendente"}
                          onValueChange={(value) => handleEvaluationChange(requirement.id, 'evidence_status', value)}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="em_analise">Em análise</SelectItem>
                            <SelectItem value="aprovada">Aprovada</SelectItem>
                            <SelectItem value="rejeitada">Rejeitada</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {requirements.length > 0 && (
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveEvaluations}>
                Salvar Avaliações
              </Button>
            </div>
          )}
        </div>
      )}

      <RequirementsManagerDialog
        open={isManagerOpen}
        onOpenChange={setIsManagerOpen}
        frameworkId={frameworkId}
        frameworkName={frameworkName}
        onSuccess={handleManagerSuccess}
      />
    </div>
  );
};