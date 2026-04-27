import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Plus, AlertTriangle, TrendingUp, CheckCircle, Shield, Settings, Tag, X, Clock, FileText, Download, MoreHorizontal, Edit, Trash2, History, ShieldCheck, Paperclip, ChevronRight, LayoutList, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatCard } from '@/components/ui/stat-card';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatStatus, getRiscoStatusColor, getNivelRiscoColor } from '@/lib/text-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useRiscosStats } from '@/hooks/useRiscosStats';
import { useToast } from '@/hooks/use-toast';
import { formatDateOnly } from '@/lib/date-utils';
import { differenceInDays } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ConfirmDialog from '@/components/ConfirmDialog';
import { RiscoDialog } from '@/components/riscos/RiscoDialog';
import { TratamentosDialog } from '@/components/riscos/TratamentosDialog';
import { MatrizDialog } from '@/components/riscos/MatrizDialog';
import { CategoriasDialog } from '@/components/riscos/CategoriasDialog';
import { RiscoAnexosIcone } from '@/components/riscos/RiscoAnexosIcone';
import { RiskScoreCard } from '@/components/riscos/RiskScoreCard';

import { TrilhaAuditoriaRiscos } from '@/components/riscos/TrilhaAuditoriaRiscos';
import { HistoricoAvaliacoesDialog } from '@/components/riscos/HistoricoAvaliacoesDialog';
import { AprovacaoRiscoDialog } from '@/components/riscos/AprovacaoRiscoDialog';
import { exportRiscosPDF, exportRiscosCSV } from '@/components/riscos/ExportRiscosPDF';
import { MatrizVisualizacao } from '@/components/riscos/MatrizVisualizacao';
import { useLanguage } from '@/contexts/LanguageContext';

interface Risco {
  id: string;
  nome: string;
  descricao?: string;
  matriz_id?: string;
  categoria_id?: string;
  probabilidade_inicial?: string;
  impacto_inicial?: string;
  probabilidade_residual?: string;
  impacto_residual?: string;
  nivel_risco_inicial: string;
  nivel_risco_residual?: string;
  status: string;
  responsavel?: string;
  responsavel_nome?: string;
  responsavel_foto?: string;
  controles_existentes?: string;
  causas?: string;
  consequencias?: string;
  aceito: boolean;
  justificativa_aceite?: string;
  categoria?: { nome: string; cor?: string };
  matriz?: { nome: string };
  created_at: string;
  tratamentos_count?: number;
  data_proxima_revisao?: string;
  status_aprovacao?: string;
  aprovador_id?: string;
  historico_aprovacao?: any;
  created_by?: string;
  tratamentos_concluidos_count?: number;
}


interface MatrizConfig {
  niveis_risco: Array<{ min: number; max: number; nivel: string; cor?: string }>;
}

export function Riscos() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const location = useLocation();
  const { data: stats, refetch: refetchStats } = useRiscosStats();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [nivelFilter, setNivelFilter] = useState<string>('');
  const [aceitoFilter, setAceitoFilter] = useState<string>('');
  const [idsFilter, setIdsFilter] = useState<string[]>([]);
  const [riscoDialogOpen, setRiscoDialogOpen] = useState(false);
  const [matrizDialogOpen, setMatrizDialogOpen] = useState(false);
  const [editingRisco, setEditingRisco] = useState<Risco | null>(null);
  const [tratamentosDialogOpen, setTratamentosDialogOpen] = useState(false);
  const [tratamentosRisco, setTratamentosRisco] = useState<Risco | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [riscoToDelete, setRiscoToDelete] = useState<Risco | null>(null);
  const [categoriasDialogOpen, setCategoriasDialogOpen] = useState(false);
  
  // Novos estados para dialogs
  const [auditRisco, setAuditRisco] = useState<Risco | null>(null);
  const [historicoRisco, setHistoricoRisco] = useState<Risco | null>(null);
  const [aprovacaoRisco, setAprovacaoRisco] = useState<Risco | null>(null);
  
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');

  // React Query for riscos
  const { data: riscos = [], isLoading: loading } = useQuery({
    queryKey: ['riscos', profile?.empresa_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('riscos')
        .select(`
          id, nome, descricao, matriz_id, categoria_id,
          probabilidade_inicial, impacto_inicial,
          probabilidade_residual, impacto_residual,
          nivel_risco_inicial, nivel_risco_residual,
          status, responsavel, controles_existentes,
          causas, consequencias, aceito, justificativa_aceite,
          created_at, data_proxima_revisao,
          status_aprovacao, aprovador_id, historico_aprovacao,
          categoria:riscos_categorias(nome, cor),
          matriz:riscos_matrizes(nome)
        `)
        .eq('empresa_id', profile!.empresa_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Buscar contagem de tratamentos
      const riscoIds = data?.map(r => r.id) || [];
      let tratamentosCount: Record<string, number> = {};
      
      if (riscoIds.length > 0) {
        const { data: tratamentos } = await supabase
          .from('riscos_tratamentos')
          .select('risco_id, status')
          .in('risco_id', riscoIds);

        const countsMap = (tratamentos || []).reduce((acc, t) => {
          if (!acc[t.risco_id]) acc[t.risco_id] = { total: 0, concluidos: 0 };
          acc[t.risco_id].total++;
          const s = (t.status || '').toLowerCase().trim();
          if (s === 'concluído' || s === 'concluido' || s === 'concluída' || s === 'concluida') {
            acc[t.risco_id].concluidos++;
          }
          return acc;
        }, {} as Record<string, { total: number; concluidos: number }>);

        // Converte para o formato legado (número total) mais o novo campo de concluídos
        tratamentosCount = Object.fromEntries(
          Object.entries(countsMap).map(([id, v]) => [id, v.total])
        ) as unknown as Record<string, number>;

        // Armazena contagem de concluídos separadamente para uso nas colunas
        (tratamentosCount as any).__concluidos = countsMap;
      }
      
      if (data && data.length > 0) {
        const normalizedData = data.map(risco => ({
          ...risco,
          categoria: Array.isArray(risco.categoria) && risco.categoria.length > 0 
            ? risco.categoria[0] 
            : risco.categoria,
          tratamentos_count: tratamentosCount[risco.id] || 0
        }));

        const responsavelIds = normalizedData
          .map(r => r.responsavel)
          .filter(r => r && r.trim() !== '');
        
        if (responsavelIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, nome, foto_url')
            .in('user_id', responsavelIds);
          
          const profileMap = new Map(
            profiles?.map(p => [p.user_id, { nome: p.nome, foto_url: p.foto_url }]) || []
          );
          
          const concluidosMap = (tratamentosCount as any).__concluidos as Record<string, { total: number; concluidos: number }> | undefined;
          return normalizedData.map(risco => {
            const profileData = (risco.responsavel && risco.responsavel.trim() !== '')
              ? profileMap.get(risco.responsavel)
              : null;
            return {
              ...risco,
              responsavel_nome: profileData?.nome || null,
              responsavel_foto: profileData?.foto_url || null,
              tratamentos_concluidos_count: concluidosMap?.[risco.id]?.concluidos || 0,
            };
          });
        }
        
        return normalizedData;
      }
      
      return data || [];
    },
    enabled: !!profile?.empresa_id,
    staleTime: 1000 * 60 * 2,
  });

  // React Query for matriz config
  const { data: matrizConfig = null } = useQuery({
    queryKey: ['riscos-matriz-config', profile?.empresa_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('riscos_matriz_configuracao')
        .select('niveis_risco')
        .limit(1)
        .single();

      if (data) {
        return {
          niveis_risco: data.niveis_risco as Array<{ min: number; max: number; nivel: string; cor?: string }>
        } as MatrizConfig;
      }
      return null;
    },
    enabled: !!profile?.empresa_id,
    staleTime: 1000 * 60 * 5,
  });

  const invalidateRiscos = () => {
    queryClient.invalidateQueries({ queryKey: ['riscos'] });
    refetchStats();
  };

  useEffect(() => {
    const itemId = location.state?.itemId;
    if (itemId && riscos.length > 0) {
      const risco = riscos.find(r => r.id === itemId);
      if (risco) {
        setEditingRisco(risco as Risco);
        setRiscoDialogOpen(true);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, riscos]);

  useEffect(() => {
    const ids = searchParams.get('ids');
    if (ids) {
      setIdsFilter(ids.split(','));
    }
  }, [searchParams]);

  const filteredRiscos = riscos.filter(risco => {
    const matchesSearch = risco.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risco.responsavel?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || statusFilter === 'all' || risco.status === statusFilter;
    const matchesNivel = !nivelFilter || nivelFilter === 'all' || risco.nivel_risco_inicial === nivelFilter;
    const matchesAceito = !aceitoFilter || aceitoFilter === 'all' || 
                         (aceitoFilter === 'aceito' && risco.aceito) ||
                         (aceitoFilter === 'nao_aceito' && !risco.aceito);
    const matchesIds = idsFilter.length === 0 || idsFilter.includes(risco.id);

    return matchesSearch && matchesStatus && matchesNivel && matchesAceito && matchesIds;
  });

  const clearIdsFilter = () => {
    setIdsFilter([]);
    setSearchParams({});
  };

  const handleEdit = (risco: Risco) => {
    setEditingRisco(risco);
    setRiscoDialogOpen(true);
  };

  const openTratamentosDialog = (risco: Risco) => {
    setTratamentosRisco(risco);
    setTratamentosDialogOpen(true);
  };

  const openDeleteDialog = (risco: Risco) => {
    setRiscoToDelete(risco);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!riscoToDelete) return;

    try {
      const { error } = await supabase
        .from('riscos')
        .delete()
        .eq('id', riscoToDelete.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Risco excluído com sucesso!",
      });
      setDeleteDialogOpen(false);
      setRiscoToDelete(null);
      invalidateRiscos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir risco: " + error.message,
        variant: "destructive",
      });
    }
  };

  const openCreateDialog = () => {
    setEditingRisco(null);
    setRiscoDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    setRiscoDialogOpen(false);
    setEditingRisco(null);
    invalidateRiscos();
  };

  const handleMatrizDialogSuccess = () => {
    setMatrizDialogOpen(false);
    invalidateRiscos();
    queryClient.invalidateQueries({ queryKey: ['riscos-matriz-config'] });
  };

  const handleCategoriasDialogSuccess = () => {
    setCategoriasDialogOpen(false);
    invalidateRiscos();
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRiscos = [...filteredRiscos].sort((a, b) => {
    let aValue: any = a[sortField as keyof Risco];
    let bValue: any = b[sortField as keyof Risco];
    
    if (sortField === 'categoria') {
      aValue = a.categoria?.nome || '';
      bValue = b.categoria?.nome || '';
    }
    
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';
    
    if (typeof aValue === 'string') {
      const comparison = aValue.localeCompare(bValue, 'pt-BR', { sensitivity: 'base' });
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getRevisaoBadge = (dataRevisao?: string) => {
    if (!dataRevisao) return null;
    const dias = differenceInDays(new Date(dataRevisao), new Date());
    if (dias < 0) {
      return <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px] px-1.5 py-0">Vencida</Badge>;
    }
    if (dias <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-[10px] px-1.5 py-0">{dias}d</Badge>;
    }
    return null;
  };

  const getAprovacaoBadge = (status?: string) => {
    switch (status) {
      case 'aprovado': return <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] px-1.5 py-0">Aprovado</Badge>;
      case 'rejeitado': return <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px] px-1.5 py-0">Rejeitado</Badge>;
      case 'pendente': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-[10px] px-1.5 py-0">Pendente</Badge>;
      default: return null;
    }
  };

  // Função para calcular variação percentual
  const calcTrend = (atual: number, antigo: number | null | undefined): { value: number; direction: 'up' | 'down' | 'neutral' } | undefined => {
    if (antigo === null || antigo === undefined || antigo === 0) return undefined;
    const diff = ((atual - antigo) / antigo) * 100;
    const rounded = Math.round(Math.abs(diff));
    if (rounded === 0) return undefined;
    return { value: rounded, direction: diff > 0 ? 'up' : 'down' };
  };

  // ─── Borda colorida por nível de risco ──────────────────────────────────
  const getRiscoRowClass = (nivel: string): string => {
    const n = (nivel || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (n.includes('critico') || n.includes('muito alto')) return 'border-l-[3px] border-l-destructive';
    if (n.includes('alto'))                                 return 'border-l-[3px] border-l-orange-500';
    if (n.includes('medio') || n.includes('moderado'))     return 'border-l-[3px] border-l-yellow-500';
    if (n.includes('baixo'))                               return 'border-l-[3px] border-l-green-500';
    return 'border-l-[3px] border-l-transparent';
  };

  // ─── Barra de distribuição por nível ────────────────────────────────────
  const RiskDistributionBar = ({ riscos }: { riscos: Risco[] }) => {
    const total = riscos.length;
    if (total === 0) return null;

    const segments = [
      {
        key: 'critico', label: 'Crítico/M.Alto',
        color: 'bg-destructive',
        count: riscos.filter(r => {
          const n = (r.nivel_risco_inicial || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
          return n.includes('critico') || n.includes('muito alto');
        }).length,
      },
      {
        key: 'alto', label: 'Alto',
        color: 'bg-orange-500',
        count: riscos.filter(r => {
          const n = (r.nivel_risco_inicial || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
          return n === 'alto';
        }).length,
      },
      {
        key: 'medio', label: 'Médio',
        color: 'bg-yellow-500',
        count: riscos.filter(r => {
          const n = (r.nivel_risco_inicial || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
          return n.includes('medio') || n.includes('moderado');
        }).length,
      },
      {
        key: 'baixo', label: 'Baixo',
        color: 'bg-green-500',
        count: riscos.filter(r => {
          const n = (r.nivel_risco_inicial || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
          return n.includes('baixo');
        }).length,
      },
    ].filter(s => s.count > 0);

    return (
      <div className="space-y-1.5">
        {/* Barra empilhada */}
        <div className="flex h-3 rounded-full overflow-hidden gap-px">
          {segments.map(s => (
            <div
              key={s.key}
              className={`${s.color} transition-all duration-500`}
              style={{ width: `${(s.count / total) * 100}%` }}
              title={`${s.label}: ${s.count}`}
            />
          ))}
        </div>
        {/* Legenda inline */}
        <div className="flex items-center gap-3 flex-wrap">
          {segments.map(s => (
            <div key={s.key} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.color}`} />
              <span className="text-xs text-muted-foreground">
                {s.label}: <span className="font-semibold text-foreground">{s.count}</span>
              </span>
            </div>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">
            {total} total
          </span>
        </div>
      </div>
    );
  };

  // Mini sparkline SVG component
  const MiniSparkline = ({ trend, color }: { trend?: { direction: 'up' | 'down' | 'neutral' }; color: string }) => {
    const upPath = "M0,14 L4,12 L8,10 L12,8 L16,11 L20,7 L24,5 L28,3";
    const downPath = "M0,3 L4,5 L8,7 L12,5 L16,8 L20,10 L24,12 L28,14";
    const flatPath = "M0,8 L4,9 L8,7 L12,8 L16,9 L20,7 L24,8 L28,8";
    const path = trend?.direction === 'up' ? upPath : trend?.direction === 'down' ? downPath : flatPath;
    return (
      <svg width="32" height="16" viewBox="0 0 28 16" className="opacity-60">
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-4 w-24 mb-3" /><Skeleton className="h-8 w-16 mb-2" /><Skeleton className="h-4 w-32" /></CardContent></Card>
          ))}
        </div>
        <Card className="rounded-lg border overflow-hidden">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const riscoColumns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    className?: string;
    render?: (value: any, risco: Risco) => React.ReactNode;
  }> = [
    {
      key: 'nome',
      label: 'Nome',
      sortable: true,
      render: (value: any) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'categoria',
      label: 'Categoria',
      render: (value: any) => value ? (
        <div className="flex items-center gap-2">
          {value.cor && <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: value.cor }} />}
          <span className="text-sm">{value.nome}</span>
        </div>
      ) : <span className="text-muted-foreground text-sm">—</span>
    },
    {
      // Coluna unificada: Nível Inicial → Residual na mesma célula
      key: 'nivel_risco_inicial',
      label: 'Nível',
      render: (_value: string, risco: Risco) => (
        <div className="flex items-center gap-1 flex-wrap">
          <Badge className={`${getNivelRiscoColor(risco.nivel_risco_inicial)} border whitespace-nowrap text-xs`}>
            {risco.nivel_risco_inicial}
          </Badge>
          {risco.nivel_risco_residual ? (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <Badge className={`${getNivelRiscoColor(risco.nivel_risco_residual)} border whitespace-nowrap text-xs`}>
                {risco.nivel_risco_residual}
              </Badge>
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground italic ml-1">sem residual</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge className={`${getRiscoStatusColor(value)} border whitespace-nowrap`}>{formatStatus(value)}</Badge>
      )
    },
    {
      key: 'tags',
      label: 'Flags',
      render: (_value: any, risco: Risco) => {
        const tags: React.ReactNode[] = [];
        const aprovBadge = getAprovacaoBadge(risco.status_aprovacao);
        if (aprovBadge) tags.push(aprovBadge);
        if (risco.aceito) tags.push(
          <Badge key="aceito" className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] px-1.5 py-0">Aceito</Badge>
        );
        const revBadge = getRevisaoBadge(risco.data_proxima_revisao);
        if (revBadge) tags.push(revBadge);

        if (tags.length === 0) return <span className="text-muted-foreground text-sm">—</span>;

        const visible = tags.slice(0, 2);
        const extra = tags.length - 2;
        return (
          <div className="flex items-center gap-1 flex-wrap">
            {visible}
            {extra > 0 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{extra}</Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'tratamentos_count',
      label: 'Tratamentos',
      className: 'w-[110px]',
      render: (value: number, risco: Risco) => {
        const total     = value || 0;
        const concluidos = risco.tratamentos_concluidos_count || 0;
        const pct       = total > 0 ? Math.round((concluidos / total) * 100) : 0;
        const barColor  = pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-primary' : 'bg-muted-foreground/20';

        return (
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-0.5 h-auto py-1 px-2 w-full"
            onClick={() => openTratamentosDialog(risco)}
          >
            <span className="text-xs font-medium text-foreground">
              {total === 0 ? '—' : `${concluidos}/${total}`}
            </span>
            {total > 0 && (
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </Button>
        );
      }
    },
    {
      key: 'responsavel',
      label: 'Resp.',
      render: (_value: string, risco: Risco) => {
        if (risco.responsavel_nome) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-7 w-7 cursor-pointer">
                    {risco.responsavel_foto && (
                      <AvatarImage src={risco.responsavel_foto} alt={risco.responsavel_nome} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                      {risco.responsavel_nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent><p>{risco.responsavel_nome}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        return <span className="text-muted-foreground text-sm">—</span>;
      }
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'w-[60px]',
      render: (_value: any, risco: Risco) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(risco)}>
              <Edit className="mr-2 h-4 w-4" />Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openTratamentosDialog(risco)}>
              <Shield className="mr-2 h-4 w-4" />Tratamentos ({risco.tratamentos_count || 0})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAprovacaoRisco(risco)}>
              <ShieldCheck className="mr-2 h-4 w-4" />Aprovação
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setHistoricoRisco(risco)}>
              <Clock className="mr-2 h-4 w-4" />Histórico Avaliações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAuditRisco(risco)}>
              <History className="mr-2 h-4 w-4" />Trilha de Auditoria
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openDeleteDialog(risco)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'identificado', label: 'Identificado' },
        { value: 'analisado', label: 'Analisado' },
        { value: 'em_tratamento', label: 'Em Tratamento' },
        { value: 'tratado', label: 'Tratado' },
        { value: 'monitorado', label: 'Monitorado' },
        { value: 'aceito', label: 'Aceito' }
      ],
      value: statusFilter,
      onChange: (value: string) => setStatusFilter(value === 'all' ? '' : value)
    },
    {
      key: 'nivel',
      label: 'Nível',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'Crítico', label: 'Crítico' },
        { value: 'Muito Alto', label: 'Muito Alto' },
        { value: 'Alto', label: 'Alto' },
        { value: 'Médio', label: 'Médio' },
        { value: 'Baixo', label: 'Baixo' },
        { value: 'Muito Baixo', label: 'Muito Baixo' }
      ],
      value: nivelFilter,
      onChange: (value: string) => setNivelFilter(value === 'all' ? '' : value)
    },
    {
      key: 'aceito',
      label: 'Aceito',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'aceito', label: 'Aceitos' },
        { value: 'nao_aceito', label: 'Não Aceitos' }
      ],
      value: aceitoFilter,
      onChange: (value: string) => setAceitoFilter(value === 'all' ? '' : value)
    }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <PageHeader
          title={t('modules.riscos.title')}
          description={t('modules.riscos.description')}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => {
            const totalTrend = calcTrend(stats?.total || 0, stats?.total_7d_atras);
            const tratConcTrend = calcTrend(stats?.tratamentos_concluidos || 0, stats?.tratamentos_concluidos_7d_atras);
            const aceitosTrend = calcTrend(stats?.aceitos || 0, stats?.aceitos_7d_atras);
            return (
              <>
                <StatCard
                  title={t('modules.riscos.total')}
                  value={stats?.total || 0}
                  description={`${stats?.criticos || 0} críticos, ${stats?.altos || 0} altos`}
                  icon={
                    <div className="flex flex-col items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      <MiniSparkline trend={totalTrend} color="hsl(var(--destructive))" />
                    </div>
                  }
                  variant={stats?.criticos ? "destructive" : "default"}
                  loading={!stats}
                  trend={totalTrend ? { value: totalTrend.value, direction: totalTrend.direction, period: '7d' } : undefined}
                />
                <StatCard
                  title="Tratamentos Concluídos"
                  value={stats?.tratamentos_concluidos || 0}
                  description={`${stats?.tratamentos_andamento || 0} em andamento`}
                  icon={
                    <div className="flex flex-col items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <MiniSparkline trend={tratConcTrend} color="hsl(var(--success))" />
                    </div>
                  }
                  variant="success"
                  loading={!stats}
                  trend={tratConcTrend ? { value: tratConcTrend.value, direction: tratConcTrend.direction, period: '7d' } : undefined}
                />
                <StatCard
                  title="Riscos Aceitos"
                  value={stats?.aceitos || 0}
                  description="Aceitos formalmente"
                  icon={
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <MiniSparkline trend={aceitosTrend} color="hsl(var(--warning))" />
                    </div>
                  }
                  variant="warning"
                  loading={!stats}
                  trend={aceitosTrend ? { value: aceitosTrend.value, direction: aceitosTrend.direction, period: '7d' } : undefined}
                />
                <RiskScoreCard stats={stats} loading={!stats} />
              </>
            );
          })()}
        </div>

        {/* Barra de distribuição por nível */}
        {sortedRiscos.length > 0 && (
          <Card className="rounded-lg border">
            <CardContent className="px-4 py-3">
              <RiskDistributionBar riscos={sortedRiscos} />
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Lista / Matriz */}
            <div className="flex items-center rounded-md border overflow-hidden">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none h-8 px-3"
                onClick={() => setViewMode('table')}
                title="Visualização em lista"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'matrix' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none h-8 px-3 border-l"
                onClick={() => setViewMode('matrix')}
                title="Visualização em matriz"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>

            {idsFilter.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
                Filtro da Matriz ({idsFilter.length})
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-transparent" onClick={clearIdsFilter}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportRiscosCSV(sortedRiscos)}>
                  <FileText className="mr-2 h-4 w-4" />Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportRiscosPDF(sortedRiscos, stats)}>
                  <FileText className="mr-2 h-4 w-4" />Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={() => setCategoriasDialogOpen(true)} className="whitespace-nowrap">
              <Tag className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Categorias</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMatrizDialogOpen(true)} className="whitespace-nowrap">
              <Settings className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Config. Matriz</span>
            </Button>
            <Button size="sm" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Novo Risco</span>
            </Button>
          </div>
        </div>

        {/* Vista da Matriz */}
        {viewMode === 'matrix' && (
          <MatrizVisualizacao />
        )}

        {/* DataTable — só renderiza quando viewMode === 'table' */}
        {viewMode === 'table' && (
        <Card className="rounded-lg border overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              data={sortedRiscos}
              columns={riscoColumns as Column<Risco>[]}
              loading={loading}
              searchable
              searchPlaceholder="Buscar riscos..."
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filters}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              rowClassName={(risco: Risco) => getRiscoRowClass(risco.nivel_risco_inicial)}
              emptyState={{
                icon: <AlertTriangle className="h-8 w-8" />,
                title: searchTerm || statusFilter !== '' || nivelFilter !== '' || aceitoFilter !== ''
                  ? 'Nenhum risco encontrado'
                  : 'Nenhum risco cadastrado',
                description: searchTerm || statusFilter !== '' || nivelFilter !== '' || aceitoFilter !== ''
                  ? 'Tente ajustar os filtros para encontrar o que procura.'
                  : 'Comece identificando e cadastrando os riscos da sua organização.',
                action: !searchTerm && statusFilter === '' && nivelFilter === '' && aceitoFilter === '' ? {
                  label: 'Cadastrar Primeiro Risco',
                  onClick: openCreateDialog
                } : undefined
              }}
            />
          </CardContent>
        </Card>
        )}
        
        {/* Dialogs */}
        <RiscoDialog
          open={riscoDialogOpen}
          onOpenChange={setRiscoDialogOpen}
          risco={editingRisco}
          onSuccess={handleDialogSuccess}
        />

        <TratamentosDialog
          open={tratamentosDialogOpen}
          onOpenChange={setTratamentosDialogOpen}
          risco={tratamentosRisco}
          onSuccess={invalidateRiscos}
        />

        <MatrizDialog
          open={matrizDialogOpen}
          onOpenChange={setMatrizDialogOpen}
          onSuccess={handleMatrizDialogSuccess}
        />

        <CategoriasDialog
          open={categoriasDialogOpen}
          onOpenChange={setCategoriasDialogOpen}
          onSuccess={handleCategoriasDialogSuccess}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Excluir Risco"
          description={`Tem certeza que deseja excluir o risco "${riscoToDelete?.nome}"? Esta ação não pode ser desfeita.`}
          onConfirm={handleDelete}
        />

        {/* Novos Dialogs */}
        {auditRisco && (
          <TrilhaAuditoriaRiscos
            open={!!auditRisco}
            onOpenChange={(open) => !open && setAuditRisco(null)}
            riscoId={auditRisco.id}
            riscoNome={auditRisco.nome}
          />
        )}

        {historicoRisco && (
          <HistoricoAvaliacoesDialog
            open={!!historicoRisco}
            onOpenChange={(open) => !open && setHistoricoRisco(null)}
            riscoId={historicoRisco.id}
            riscoNome={historicoRisco.nome}
          />
        )}

        {aprovacaoRisco && (
          <AprovacaoRiscoDialog
            open={!!aprovacaoRisco}
            onOpenChange={(open) => !open && setAprovacaoRisco(null)}
            risco={aprovacaoRisco}
            onSuccess={() => { setAprovacaoRisco(null); invalidateRiscos(); }}
          />
        )}

      </div>
    </TooltipProvider>
  );
}
