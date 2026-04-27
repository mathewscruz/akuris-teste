import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle, ListChecks, FileText,
  Shield, MessageSquareWarning, CheckCircle2,
  ChevronRight, Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { subDays } from 'date-fns';

interface ActionItem {
  id: string;
  count: number;
  label: string;
  sublabel: string;
  route: string;
  icon: React.ElementType;
  severity: 'critical' | 'warning' | 'info';
}

async function fetchActionItems(empresaId: string): Promise<ActionItem[]> {
  const now = new Date();
  const sevenDaysAgo  = subDays(now, 7).toISOString();
  const fourteenDaysAgo = subDays(now, 14).toISOString();

  const [riscosRes, planosRes, docsRes, controlesRes, denunciasRes] = await Promise.all([
    // 1. Riscos críticos/altos sem tratamento
    supabase
      .from('riscos')
      .select('id', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .eq('status', 'identificado')
      .in('nivel_risco_inicial', ['Crítico', 'Alto', 'Muito Alto']),

    // 2. Planos de ação com prazo vencido
    supabase
      .from('planos_acao')
      .select('id', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .lt('prazo', now.toISOString())
      .not('status', 'in', '("concluido","cancelado","cancelada")'),

    // 3. Documentos aguardando aprovação há mais de 7 dias
    supabase
      .from('documentos')
      .select('id', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .eq('status', 'pendente_aprovacao')
      .lt('updated_at', sevenDaysAgo),

    // 4. Controles com avaliação vencida
    supabase
      .from('controles')
      .select('id', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .eq('status', 'ativo')
      .not('proxima_avaliacao', 'is', null)
      .lt('proxima_avaliacao', now.toISOString().split('T')[0]),

    // 5. Denúncias abertas sem atualização há mais de 14 dias
    supabase
      .from('denuncias')
      .select('id', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .in('status', ['nova', 'em_investigacao', 'em_analise'])
      .lt('updated_at', fourteenDaysAgo),
  ]);

  const items: ActionItem[] = [];

  const riscosCount = riscosRes.count ?? 0;
  if (riscosCount > 0) {
    items.push({
      id: 'riscos-sem-tratamento',
      count: riscosCount,
      label: riscosCount === 1
        ? '1 risco crítico/alto sem tratamento'
        : `${riscosCount} riscos críticos/altos sem tratamento`,
      sublabel: 'Nenhum tratamento foi definido',
      route: '/riscos',
      icon: AlertTriangle,
      severity: 'critical',
    });
  }

  const planosCount = planosRes.count ?? 0;
  if (planosCount > 0) {
    items.push({
      id: 'planos-vencidos',
      count: planosCount,
      label: planosCount === 1
        ? '1 plano de ação com prazo vencido'
        : `${planosCount} planos de ação com prazo vencido`,
      sublabel: 'Prazo passou sem conclusão',
      route: '/planos-acao',
      icon: ListChecks,
      severity: 'critical',
    });
  }

  const docsCount = docsRes.count ?? 0;
  if (docsCount > 0) {
    items.push({
      id: 'docs-pendentes',
      count: docsCount,
      label: docsCount === 1
        ? '1 documento aguardando aprovação há +7 dias'
        : `${docsCount} documentos aguardando aprovação há +7 dias`,
      sublabel: 'Aprovação em atraso',
      route: '/documentos',
      icon: FileText,
      severity: 'warning',
    });
  }

  const controlesCount = controlesRes.count ?? 0;
  if (controlesCount > 0) {
    items.push({
      id: 'controles-vencidos',
      count: controlesCount,
      label: controlesCount === 1
        ? '1 controle com avaliação vencida'
        : `${controlesCount} controles com avaliação vencida`,
      sublabel: 'Próxima avaliação ultrapassada',
      route: '/governanca?tab=controles',
      icon: Shield,
      severity: 'warning',
    });
  }

  const denunciasCount = denunciasRes.count ?? 0;
  if (denunciasCount > 0) {
    items.push({
      id: 'denuncias-paradas',
      count: denunciasCount,
      label: denunciasCount === 1
        ? '1 denúncia aberta sem atualização há +14 dias'
        : `${denunciasCount} denúncias abertas sem atualização há +14 dias`,
      sublabel: 'Investigação sem progresso',
      route: '/denuncia',
      icon: MessageSquareWarning,
      severity: 'info',
    });
  }

  return items;
}

const severityConfig = {
  critical: {
    iconColor: 'text-destructive',
    bgColor:   'bg-destructive/10',
    badgeVariant: 'destructive' as const,
  },
  warning: {
    iconColor: 'text-warning',
    bgColor:   'bg-warning/10',
    badgeVariant: 'warning' as const,
  },
  info: {
    iconColor: 'text-primary',
    bgColor:   'bg-primary/10',
    badgeVariant: 'info' as const,
  },
};

export function ActionItems() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['action-items', profile?.empresa_id],
    queryFn: () => fetchActionItems(profile!.empresa_id),
    enabled: !!profile?.empresa_id,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Card className="w-full min-w-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          {t('dashboard.actionItems')}
          {items.length > 0 && (
            <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0">
              {items.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <p className="text-sm font-medium text-foreground">{t('dashboard.actionItemsAllClear')}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.actionItemsNone')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const cfg = severityConfig[item.severity];
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.route)}
                  className="group w-full flex items-center gap-3 p-2.5 rounded-lg border bg-card/50 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className={`flex-shrink-0 p-1.5 rounded-md ${cfg.bgColor}`}>
                    <Icon className={`h-3.5 w-3.5 ${cfg.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground leading-snug truncate">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {item.sublabel}
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-foreground/70 flex-shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
