import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOptimizedQuery } from "@/hooks/useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";
import { RequirementDialog } from "./RequirementDialog";
import { toast } from "sonner";
import { Requirement } from "./types";

interface RequirementsManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frameworkId: string;
  frameworkName: string;
  onSuccess: () => void;
}

export const RequirementsManagerDialog: React.FC<RequirementsManagerDialogProps> = ({
  open,
  onOpenChange,
  frameworkId,
  frameworkName,
  onSuccess
}) => {
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [isRequirementDialogOpen, setIsRequirementDialogOpen] = useState(false);

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
      cacheKey: `gap-requirements-manager-${frameworkId}`,
      cacheDuration: 5,
      staleTime: 2
    }
  ) as { data: Requirement[], loading: boolean, refetch: () => void };

  const handleEdit = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setIsRequirementDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedRequirement(null);
    setIsRequirementDialogOpen(true);
  };

  const handleDelete = async (requirement: Requirement) => {
    if (!confirm(`Tem certeza que deseja excluir o requisito "${requirement.titulo}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('gap_analysis_requirements')
        .delete()
        .eq('id', requirement.id);

      if (error) throw error;

      toast.success("Requisito excluído com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error("Erro ao excluir requisito: " + error.message);
    }
  };

  const handleRequirementSuccess = () => {
    refetch();
    setIsRequirementDialogOpen(false);
    onSuccess();
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Requisitos - {frameworkName}</DialogTitle>
          </DialogHeader>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Requisitos - {frameworkName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Gerencie os requisitos deste framework. Estes requisitos serão utilizados para criar avaliações de conformidade.
              </p>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Requisito
              </Button>
            </div>

            {requirements.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Nenhum requisito encontrado</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Este framework ainda não possui requisitos.
                  </p>
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Requisito
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Peso</TableHead>
                      <TableHead>Obrigatório</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requirements.map((requirement) => (
                      <TableRow key={requirement.id}>
                        <TableCell className="font-mono text-sm">
                          {requirement.codigo || '-'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{requirement.titulo}</div>
                            {requirement.descricao && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {requirement.descricao}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {requirement.categoria && (
                            <Badge variant="secondary">
                              {requirement.categoria}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {requirement.peso && (
                            <Badge variant="outline">
                              {requirement.peso}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {requirement.obrigatorio ? (
                            <Badge variant="destructive">Sim</Badge>
                          ) : (
                            <Badge variant="secondary">Não</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(requirement)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(requirement)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <RequirementDialog
        open={isRequirementDialogOpen}
        onOpenChange={setIsRequirementDialogOpen}
        onSuccess={handleRequirementSuccess}
        frameworkId={frameworkId}
        requirement={selectedRequirement}
      />
    </>
  );
};