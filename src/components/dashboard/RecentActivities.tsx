import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import {
  FileText, AlertTriangle, Shield, Calendar,
  MessageSquareWarning, Zap, ListChecks,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';

interface Activity {
  id: string;
  type: 'created' | 'updated';
  title: string;
  description: string;
  updated_at: string;
  module: string;
  status?: string;
}

// Threshold: se updated_at > created_at + 60s, é uma atualização real
const isUpdate = (created_at: string, updated_at: string): boolean => {
  const diff = new Date(updated_at).getTime() - new Date(created_at).getTime();
  return diff > 60_000;
};

const getIcon = (module: string) => {
  switch (module) {
    case 'riscos':      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case 'controles':   return <Shield className="h-4 w-4 text-primary" />;
    case 'documentos':  return <FileText className="h-4 w-4 text-info" />;
    case 'auditorias':  return <Calendar className="h-4 w-4 text-warning" />;
    case 'denuncias':   return <MessageSquareWarning className="h-4 w-4 text-orange-500" />;
    case 'incidentes':  return <Zap className="h-4 w-4 text-destructive" />;
    case 'planos_acao': return <ListChecks className="h-4 w-4 text-primary" />;
    default:            return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
};

const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "neutral"; label: string }> = {
  critico:              { variant: 'destructive', label: 'Crítico' },
  alto:                 { variant: 'destructive', label: 'Alto' },
  medio:                { variant: 'warning',     label: 'Médio' },
  médio:                { variant: 'warning',     label: 'Médio' },
  baixo:                { variant: 'success',     label: 'Baixo' },
  ativo:                { variant: 'success',     label: 'Ativo' },
  inativo:              { variant: 'neutral',     label: 'Inativo' },
  vencido:              { variant: 'destructive', label: 'Vencido' },
  em_avaliacao:         { variant: 'warning',     label: 'Em Avaliação' },
  pendente:             { variant: 'warning',     label: 'Pendente' },
  pendente_aprovacao:   { variant: 'warning',     label: 'Pendente Aprovação' },
  aprovado:             { variant: 'success',     label: 'Aprovado' },
  rejeitado:            { variant: 'destructive', label: 'Rejeitado' },
  planejada:            { variant: 'warning',     label: 'Planejada' },
  em_andamento:         { variant: 'info',        label: 'Em Andamento' },
  em_analise:           { variant: 'info',        label: 'Em Análise' },
  em_investigacao:      { variant: 'info',        label: 'Em Investigação' },
  concluida:            { variant: 'success',     label: 'Concluída' },
  concluído:            { variant: 'success',     label: 'Concluído' },
  concluido:            { variant: 'success',     label: 'Concluído' },
  cancelada:            { variant: 'neutral',     label: 'Cancelada' },
  nova:                 { variant: 'info',        label: 'Nova' },
  resolvida:            { variant: 'success',     label: 'Resolvida' },
  arquivada:            { variant: 'neutral',     label: 'Arquivada' },
  aberto:               { variant: 'destructive', label: 'Aberto' },
  investigacao:         { variant: 'warning',     label: 'Investigação' },
  resolvido:            { variant: 'success',     label: 'Resolvido' },
  critica:              { variant: 'destructive', label: 'Crítica' },
  alta:                 { variant: 'destructive', label: 'Alta' },
  media:                { variant: 'warning',     label: 'Média' },
};

const getStatusBadge = (status?: string) => {
  if (!status) return null;
  const key = status.toLowerCase().trim();
  const info = statusMap[key] || { variant: 'outline' as const, label: status.charAt(0).toUpperCase() + status.slice(1) };
  return (
    <Badge variant={info.variant} className="text-[10px] px-1.5 py-0 whitespace-nowrap">
      {info.label}
    </Badge>
  );
};

async function fetchActivities(empresaId: string, t: any): Promise<Activity[]> {
  const activities: Activity[] = [];

  const [riscosRes, controlesRes, documentosRes, auditoriasRes, denunciasRes, incidentesRes, planosRes] =
    await Promise.all([
      supabase.from('riscos')
        .select('id, nome, nivel_risco_inicial, created_at, updated_at')
        .eq('empresa_id', empresaId)
        .order('updated_at', { ascending: false }).limit(4),

      supabase.from('controles')
        .select('id, nome, status, created_at, updated_at')
        .eq('empresa_id', empresaId)
        .order('updated_at', { ascending: false }).limit(3),

      supabase.from('documentos')
        .select('id, nome, status, created_at, updated_at')
        .eq('empresa_id', empresaId)
        .order('updated_at', { ascending: false }).limit(3),

      supabase.from('auditorias')
        .select('id, nome, status, created_at, updated_at')
        .eq('empresa_id', empresaId)
        .order('updated_at', { ascending: false }).limit(2),

      supabase.from('denuncias')
        .select('id, titulo, status, created_at, updated_at')
        .eq('empresa_id', empresaId)
        .order('updated_at', { ascending: false }).limit(2),

      supabase.from('incidentes')
        .select('id, titulo, criticidade, status, created_at, updated_at')
        .eq('empresa_id', empresaId)
        .order('updated_at', { ascending: false }).limit(3),

      supabase.from('planos_acao')
        .select('id, titulo, status, prioridade, created_at, updated_at')
        .eq('empresa_id', empresaId)
        .order('updated_at', { ascending: false }).limit(3),
    ]);

  riscosRes.data?.forEach(r => {
    const updated = isUpdate(r.created_at, r.updated_at);
    activities.push({
      id: `risco-${r.id}`,
      type: updated ? 'updated' : 'created',
      title: r.nome,
      description: updated ? t('activities.updatedRisk') : t('activities.newRisk'),
      updated_at: r.updated_at,
      module: 'riscos',
      status: r.nivel_risco_inicial,
    });
  });

  controlesRes.data?.forEach(c => {
    const updated = isUpdate(c.created_at, c.updated_at);
    activities.push({
      id: `controle-${c.id}`,
      type: updated ? 'updated' : 'created',
      title: c.nome,
      description: updated ? t('activities.updatedControl') : t('activities.newControl'),
      updated_at: c.updated_at,
      module: 'controles',
      status: c.status,
    });
  });

  documentosRes.data?.forEach(d => {
    const updated = isUpdate(d.created_at, d.updated_at);
    activities.push({
      id: `documento-${d.id}`,
      type: updated ? 'updated' : 'created',
      title: d.nome,
      description: updated ? t('activities.documentUpdated') : t('activities.documentAdded'),
      updated_at: d.updated_at,
      module: 'documentos',
      status: d.status,
    });
  });

  auditoriasRes.data?.forEach(a => {
    const updated = isUpdate(a.created_at, a.updated_at);
    activities.push({
      id: `auditoria-${a.id}`,
      type: updated ? 'updated' : 'created',
      title: a.nome,
      description: updated ? t('activities.updatedAudit') : t('activities.newAudit'),
      updated_at: a.updated_at,
      module: 'auditorias',
      status: a.status,
    });
  });

  denunciasRes.data?.forEach(d => {
    const updated = isUpdate(d.created_at, d.updated_at);
    activities.push({
      id: `denuncia-${d.id}`,
      type: updated ? 'updated' : 'created',
      title: d.titulo,
      description: updated ? t('activities.updatedComplaint') : t('activities.newComplaint'),
      updated_at: d.updated_at,
      module: 'denuncias',
      status: d.status,
    });
  });

  incidentesRes.data?.forEach(i => {
    const updated = isUpdate(i.created_at, i.updated_at);
    activities.push({
      id: `incidente-${i.id}`,
      type: updated ? 'updated' : 'created',
      title: i.titulo,
      description: updated ? t('activities.updatedIncident') : t('activities.newIncident'),
      updated_at: i.updated_at,
      module: 'incidentes',
      status: i.criticidade || i.status,
    });
  });

  planosRes.data?.forEach(p => {
    const updated = isUpdate(p.created_at, p.updated_at);
    activities.push({
      id: `plano-${p.id}`,
      type: updated ? 'updated' : 'created',
      title: p.titulo,
      description: updated ? t('activities.updatedActionPlan') : t('activities.newActionPlan'),
      updated_at: p.updated_at,
      module: 'planos_acao',
      status: p.status,
    });
  });

  return activities
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 12);
}

export function RecentActivities({ className }: { className?: string }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { t, locale } = useLanguage();
  const empresaId = profile?.empresa_id;

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['recent-activities', empresaId],
    queryFn: () => fetchActivities(empresaId!, t),
    enabled: !!empresaId,
    staleTime: 5 * 60 * 1000,
  });

  const routeMap: Record<string, string> = {
    riscos:      '/riscos',
    controles:   '/governanca?tab=controles',
    documentos:  '/documentos',
    auditorias:  '/governanca?tab=auditorias',
    denuncias:   '/denuncia',
    incidentes:  '/incidentes',
    planos_acao: '/planos-acao',
  };

  const handleActivityClick = (activity: Activity) => {
    const route = routeMap[activity.module];
    if (route) navigate(route);
  };

  return (
    <Card className={`w-full min-w-0 ${className || ''}`}>
      <CardHeader>
        <CardTitle>{t('dashboard.recentActivities')}</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg border bg-card/50 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleActivityClick(activity)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleActivityClick(activity)}
              >
                <div className="flex-shrink-0 mt-1 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  {getIcon(activity.module)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                    {getStatusBadge(activity.status)}
                    {activity.type === 'updated' && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                        atualizado
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {formatDistanceToNow(new Date(activity.updated_at), {
                      addSuffix: true,
                      locale: locale === 'pt' ? ptBR : enUS,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
              <Calendar className="h-12 w-12" />
            </div>
            <p className="text-muted-foreground">{t('dashboard.noActivities')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
