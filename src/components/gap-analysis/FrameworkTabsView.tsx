import React, { useState } from "react";
import { Plus, Settings, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useOptimizedQuery } from "@/hooks/useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";
import { RequirementsManager } from "./RequirementsManager";
import { AssessmentsList } from "./AssessmentsList";
import { FrameworkDialog } from "./FrameworkDialog";
import { toast } from "sonner";

interface Framework {
  id: string;
  nome: string;
  versao: string;
  tipo_framework: string;
  descricao?: string;
  assessment_count?: number;
}

interface FrameworkTabsViewProps {
  onCreateFramework: () => void;
}

export const FrameworkTabsView: React.FC<FrameworkTabsViewProps> = ({
  onCreateFramework
}) => {
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [isFrameworkDialogOpen, setIsFrameworkDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("new");

  const { data: frameworks = [], loading: isLoading, refetch, error } = useOptimizedQuery(
    async () => {
      const { data, error } = await supabase
        .from('gap_analysis_frameworks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    },
    [],
    {
      cacheKey: 'gap-frameworks-tabs',
      cacheDuration: 5,
      staleTime: 2
    }
  ) as { data: Framework[], loading: boolean, refetch: () => void, error: any };

  const handleFrameworkSuccess = () => {
    refetch();
    setIsFrameworkDialogOpen(false);
    toast.success("Framework salvo com sucesso!");
  };

  const handleDeleteFramework = async (framework: Framework) => {
    if (!confirm(`Tem certeza que deseja excluir o framework "${framework.nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('gap_analysis_frameworks')
        .delete()
        .eq('id', framework.id);

      if (error) throw error;

      toast.success("Framework excluído com sucesso!");
      refetch();
      
      if (activeTab === framework.id) {
        setActiveTab("new");
      }
    } catch (error: any) {
      toast.error("Erro ao excluir framework: " + error.message);
    }
  };

  const handleEditFramework = (framework: Framework) => {
    setSelectedFramework(framework);
    setIsFrameworkDialogOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedFramework(null);
    setIsFrameworkDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-muted rounded"></div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <p className="text-muted-foreground">Erro ao carregar frameworks</p>
        <Button onClick={() => refetch()} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Análise de Conformidade</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
          <TabsTrigger
            value="new"
            className="flex items-center gap-2 h-10 px-4 rounded-t-md border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Plus className="h-4 w-4" />
            Novo Framework
          </TabsTrigger>
          
          {frameworks.map((framework: Framework) => (
            <TabsTrigger
              key={framework.id}
              value={framework.id}
              className="flex items-center gap-2 h-10 px-4 rounded-t-md border-b-2 border-transparent data-[state=active]:border-primary group"
            >
              <span>{framework.nome}</span>
              <Badge variant="secondary" className="text-xs">
                {framework.versao}
              </Badge>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditFramework(framework);
                  }}
                >
                  <Settings className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFramework(framework);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="new" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Framework</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-6">
                Clique no botão abaixo para criar um novo framework de conformidade.
              </p>
              <Button onClick={handleCreateNew} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Criar Framework
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {frameworks.map((framework: Framework) => (
          <TabsContent key={framework.id} value={framework.id} className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <span>{framework.nome}</span>
                      <Badge className="ml-2">{framework.versao}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditFramework(framework)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Editar Framework
                      </Button>
                    </div>
                  </CardTitle>
                  {framework.descricao && (
                    <p className="text-muted-foreground">{framework.descricao}</p>
                  )}
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Requisitos do Framework</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RequirementsManager
                      frameworkId={framework.id}
                      frameworkName={framework.nome}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Avaliações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Avaliações do framework disponíveis em breve.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <FrameworkDialog
        open={isFrameworkDialogOpen}
        onOpenChange={setIsFrameworkDialogOpen}
        onSuccess={handleFrameworkSuccess}
        framework={selectedFramework}
      />
    </div>
  );
};