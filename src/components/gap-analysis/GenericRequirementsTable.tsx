import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/hooks/useEmpresaId";
import { toast } from "sonner";
import { FrameworkConfig, NIST_PILLAR_NAMES } from "@/lib/framework-configs";
import { NISTRequirementDetailDialog } from "./nist/NISTRequirementDetailDialog";
import { saveScoreHistory } from "@/hooks/useScoreHistory";

interface Requirement {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  categoria: string;
  area_responsavel: string | null;
  peso: number | null;
  conformity_status?: string | null;
  evidence_status?: string | null;
  evidence_files?: any[];
  observacoes?: string | null;
  plano_acao?: string | null;
  prazo_implementacao?: string | null;
  responsavel_avaliacao?: string | null;
}

interface GenericRequirementsTableProps {
  frameworkId: string;
  frameworkName: string;
  config: FrameworkConfig;
  onStatusChange?: () => void;
}

type StatusFilter = 'all' | 'conforme' | 'parcial' | 'nao_conforme' | 'nao_avaliado' | 'nao_aplicavel';

export const GenericRequirementsTable: React.FC<GenericRequirementsTableProps> = ({
  frameworkId,
  frameworkName,
  config,
  onStatusChange,
}) => {
  const { empresaId, loading: loadingEmpresa } = useEmpresaId();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [activeSection, setActiveSection] = useState<string>(config.sections?.[0]?.id || '');
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Novos filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const loadRequirements = async () => {
    if (!empresaId) return;

    try {
      setLoading(true);

      const { data: reqs, error: reqError } = await supabase
        .from('gap_analysis_requirements')
        .select('*')
        .eq('framework_id', frameworkId)
        .order('ordem', { ascending: true });

      if (reqError) throw reqError;

      const { data: evals, error: evalError } = await supabase
        .from('gap_analysis_evaluations')
        .select('id, requirement_id, conformity_status')
        .eq('framework_id', frameworkId)
        .eq('empresa_id', empresaId);

      if (evalError) throw evalError;

      const evalMap = new Map(
        evals?.map(e => [e.requirement_id, { id: e.id, conformity_status: e.conformity_status }]) || []
      );

      const merged = (reqs || []).map(req => {
        const evaluation = evalMap.get(req.id);
        return {
          ...req,
          codigo: req.codigo || '',
          descricao: req.descricao || '',
          categoria: req.categoria || 'Outros',
          conformity_status: evaluation?.conformity_status || 'nao_avaliado',
          evaluation_id: evaluation?.id || null,
        };
      });

      setRequirements(merged);
    } catch (error: any) {
      console.error('Erro ao carregar requisitos:', error);
      toast.error('Erro ao carregar requisitos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, [frameworkId, empresaId]);

  const handleStatusChange = async (requirementId: string, newStatus: string) => {
    if (!empresaId) {
      console.error('❌ empresaId não disponível - usuário pode não estar autenticado corretamente');
      toast.error('Erro: Empresa não identificada. Por favor, faça login novamente.');
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('gap_analysis_evaluations')
        .select('id')
        .eq('requirement_id', requirementId)
        .eq('framework_id', frameworkId)
        .eq('empresa_id', empresaId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('gap_analysis_evaluations')
          .update({ conformity_status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('gap_analysis_evaluations')
          .insert({
            framework_id: frameworkId,
            requirement_id: requirementId,
            empresa_id: empresaId,
            conformity_status: newStatus,
          });

        if (error) throw error;
      }

      await loadRequirements();
      
      // Salvar histórico do score após mudança
      const totalReqs = requirements.length;
      const evaluatedReqs = requirements.filter(r => r.conformity_status && r.conformity_status !== 'nao_aplicavel').length;
      const score = calculateScore(requirements);
      await saveScoreHistory(frameworkId, empresaId, score, totalReqs, evaluatedReqs);
      
      onStatusChange?.();
      toast.success('Status atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  // Função auxiliar para calcular score
  const calculateScore = (reqs: Requirement[]): number => {
    const applicable = reqs.filter(r => r.conformity_status !== 'nao_aplicavel');
    if (applicable.length === 0) return 0;

    let totalWeight = 0;
    let weightedScore = 0;

    applicable.forEach(req => {
      const weight = req.peso || 1;
      const statusScore = config.statusScores[req.conformity_status || 'nao_conforme'] || 0;
      totalWeight += weight;
      weightedScore += statusScore * weight;
    });

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  };

  // Helper para traduzir categorias (usado para NIST)
  const translateCategory = (cat: string) => {
    if (frameworkName.toLowerCase().includes('nist')) {
      return NIST_PILLAR_NAMES[cat] || cat;
    }
    return cat;
  };

  const handleRowClick = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setDetailDialogOpen(true);
  };

  const handleDetailDialogClose = () => {
    setDetailDialogOpen(false);
    setSelectedRequirement(null);
    loadRequirements();
    onStatusChange?.();
  };

  const getStatusBadge = (status?: string | null) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
      conforme: { label: 'Conforme', variant: 'success' },
      parcial: { label: 'Parcial', variant: 'warning' },
      nao_conforme: { label: 'Não Conforme', variant: 'destructive' },
      nao_aplicavel: { label: 'N/A', variant: 'outline' },
      nao_avaliado: { label: 'Não Avaliado', variant: 'outline' },
    };

    const s = statusMap[status || 'nao_avaliado'];
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  // Filtrar por busca e status
  const applyFilters = (reqs: Requirement[]) => {
    let filtered = reqs;

    // Filtro por busca (código, título, descrição)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.codigo?.toLowerCase().includes(term) ||
        r.titulo?.toLowerCase().includes(term) ||
        r.descricao?.toLowerCase().includes(term)
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.conformity_status === statusFilter);
    }

    return filtered;
  };

  const categories = [...new Set(requirements.map(r => r.categoria || 'Outros'))].sort();
  
  // Aplicar filtros de categoria, busca e status
  const getFilteredRequirements = (baseReqs: Requirement[]) => {
    let filtered = activeTab === 'all' 
      ? baseReqs 
      : baseReqs.filter(r => (r.categoria || 'Outros') === activeTab);
    
    return applyFilters(filtered);
  };

  const filteredRequirements = getFilteredRequirements(requirements);

  // Paginação
  const totalPages = Math.ceil(filteredRequirements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequirements = filteredRequirements.slice(startIndex, endIndex);

  // Reset page quando mudar filtro ou items per page
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeSection, itemsPerPage, searchTerm, statusFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchTerm.trim() !== '' || statusFilter !== 'all';

  const SearchAndFilterBar = () => (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Campo de Busca */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por código, título ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setSearchTerm('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filtro por Status */}
      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          <SelectItem value="conforme">Conforme</SelectItem>
          <SelectItem value="parcial">Parcial</SelectItem>
          <SelectItem value="nao_conforme">Não Conforme</SelectItem>
          <SelectItem value="nao_avaliado">Não Avaliado</SelectItem>
          <SelectItem value="nao_aplicavel">N/A</SelectItem>
        </SelectContent>
      </Select>

      {/* Botão Limpar Filtros */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}

      {/* Contagem de resultados */}
      <span className="text-sm text-muted-foreground ml-auto">
        {filteredRequirements.length} de {requirements.length} requisitos
      </span>
    </div>
  );

  const PaginationControls = () => (
    <div className="flex items-center justify-between mt-4 px-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Itens por página:</span>
        <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages || 1} ({filteredRequirements.length} itens)
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTable = (reqs: Requirement[]) => {
    const filtered = applyFilters(reqs);
    const paginated = filtered.slice(startIndex, endIndex);
    const pages = Math.ceil(filtered.length / itemsPerPage);

    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Código</TableHead>
              <TableHead>Requisito</TableHead>
              <TableHead className="w-48">Área</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-48">Avaliação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {hasActiveFilters 
                    ? 'Nenhum requisito encontrado com os filtros aplicados'
                    : 'Nenhum requisito disponível'
                  }
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(req => (
                <TableRow 
                  key={req.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(req)}
                >
                  <TableCell className="font-mono text-sm">{req.codigo}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{req.titulo}</p>
                      {req.descricao && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {req.descricao}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{req.area_responsavel || '-'}</TableCell>
                  <TableCell>{getStatusBadge(req.conformity_status)}</TableCell>
                  <TableCell>
                    <Select
                      value={req.conformity_status || 'nao_avaliado'}
                      onValueChange={(value) => handleStatusChange(req.id, value)}
                      disabled={loadingEmpresa || !empresaId}
                    >
                      <SelectTrigger onClick={(e) => e.stopPropagation()}>
                        <SelectValue placeholder={loadingEmpresa ? "Carregando..." : "Selecione..."} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conforme">Conforme</SelectItem>
                        <SelectItem value="parcial">Parcial</SelectItem>
                        <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                        <SelectItem value="nao_aplicavel">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {pages > 0 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Itens por página:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {pages} ({filtered.length} itens)
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
                  disabled={currentPage === pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se framework tem seções, usar tabs por seção
  if (config.sections && config.sections.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Requisitos do {frameworkName}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Barra de busca e filtros */}
          <SearchAndFilterBar />

          <Tabs value={activeSection} onValueChange={(v) => { setActiveSection(v); setActiveTab('all'); setCurrentPage(1); }}>
            <TabsList className="mb-4">
              {config.sections.map(section => (
                <TabsTrigger key={section.id} value={section.id}>
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {config.sections.map(section => {
              const sectionReqs = requirements.filter(r => section.filter(r.codigo));
              const sectionCategories = [...new Set(sectionReqs.map(r => r.categoria || 'Outros'))].sort();

              return (
                <TabsContent key={section.id} value={section.id}>
                  <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
                    <TabsList className="mb-4 flex-wrap h-auto gap-1">
                      <TabsTrigger value="all">Todos</TabsTrigger>
                      {sectionCategories.map(cat => (
                        <TabsTrigger key={cat} value={cat}>{translateCategory(cat)}</TabsTrigger>
                      ))}
                    </TabsList>

                    <TabsContent value={activeTab}>
                      {renderTable(activeTab === 'all' ? sectionReqs : sectionReqs.filter(r => (r.categoria || 'Outros') === activeTab))}
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              );
            })}
          </Tabs>

          {selectedRequirement && (
            <NISTRequirementDetailDialog
              open={detailDialogOpen}
              onOpenChange={setDetailDialogOpen}
              requirement={selectedRequirement}
              frameworkId={frameworkId}
              onClose={handleDetailDialogClose}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  // Caso padrão: tabs por categoria
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requisitos do {frameworkName}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Barra de busca e filtros */}
        <SearchAndFilterBar />

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="all">Todos ({requirements.length})</TabsTrigger>
            {categories.map(cat => {
              const count = requirements.filter(r => (r.categoria || 'Outros') === cat).length;
              return (
                <TabsTrigger key={cat} value={cat}>
                  {translateCategory(cat)} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeTab}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Código</TableHead>
                  <TableHead>Requisito</TableHead>
                  <TableHead className="w-48">Área</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-48">Avaliação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRequirements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {hasActiveFilters 
                        ? 'Nenhum requisito encontrado com os filtros aplicados'
                        : 'Nenhum requisito disponível'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRequirements.map(req => (
                    <TableRow 
                      key={req.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(req)}
                    >
                      <TableCell className="font-mono text-sm">{req.codigo}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{req.titulo}</p>
                          {req.descricao && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {req.descricao}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{req.area_responsavel || '-'}</TableCell>
                      <TableCell>{getStatusBadge(req.conformity_status)}</TableCell>
                      <TableCell>
                        <Select
                          value={req.conformity_status || 'nao_avaliado'}
                          onValueChange={(value) => handleStatusChange(req.id, value)}
                          disabled={loadingEmpresa || !empresaId}
                        >
                          <SelectTrigger onClick={(e) => e.stopPropagation()}>
                            <SelectValue placeholder={loadingEmpresa ? "Carregando..." : "Selecione..."} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conforme">Conforme</SelectItem>
                            <SelectItem value="parcial">Parcial</SelectItem>
                            <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                            <SelectItem value="nao_aplicavel">N/A</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            <PaginationControls />
          </TabsContent>
        </Tabs>

        {selectedRequirement && (
          <NISTRequirementDetailDialog
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
            requirement={selectedRequirement}
            frameworkId={frameworkId}
            onClose={handleDetailDialogClose}
          />
        )}
      </CardContent>
    </Card>
  );
};
