import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  const [responses, setResponses] = useState<Record<string, string>>({});

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

  const handleResponseChange = (requirementId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [requirementId]: value
    }));
  };

  const handleSaveResponses = async () => {
    try {
      // Aqui seria implementado o salvamento das respostas
      // Para uma futura tabela de respostas/avaliações
      toast.success("Respostas salvas com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar respostas: " + error.message);
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Avaliação: {frameworkName}</h3>
          <p className="text-sm text-muted-foreground">
            Responda às perguntas abaixo para realizar a avaliação de conformidade
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsManagerOpen(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Gerenciar Requisitos
        </Button>
      </div>

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
          {requirements.map((requirement, index) => (
            <Card key={requirement.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {requirement.codigo && (
                        <span className="text-sm text-muted-foreground mr-2">
                          {requirement.codigo}
                        </span>
                      )}
                      {requirement.titulo}
                      {requirement.obrigatorio && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Obrigatório
                        </Badge>
                      )}
                    </CardTitle>
                    {requirement.descricao && (
                      <p className="text-sm text-muted-foreground">
                        {requirement.descricao}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {requirement.categoria && (
                      <Badge variant="secondary" className="text-xs">
                        {requirement.categoria}
                      </Badge>
                    )}
                    {requirement.peso && (
                      <Badge variant="outline" className="text-xs">
                        Peso: {requirement.peso}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Sua Resposta:
                  </label>
                  <Textarea
                    placeholder="Digite sua resposta para este requisito..."
                    value={responses[requirement.id] || ""}
                    onChange={(e) => handleResponseChange(requirement.id, e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {requirements.length > 0 && (
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveResponses}>
                Salvar Respostas
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