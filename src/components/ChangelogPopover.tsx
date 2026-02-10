import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Shield, BarChart3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChangelogEntry {
  date: string;
  version: string;
  items: {
    type: 'feature' | 'improvement' | 'fix';
    text: string;
  }[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    date: '10 Fev 2026',
    version: 'v2.8',
    items: [
      { type: 'feature', text: 'Busca global com Cmd+K' },
      { type: 'feature', text: 'Changelog de novidades' },
      { type: 'improvement', text: 'Dashboard com KPIs expandidos' },
      { type: 'improvement', text: 'Sidebar com animações refinadas' },
      { type: 'improvement', text: 'Notificações priorizadas por severidade' },
    ],
  },
  {
    date: '03 Fev 2026',
    version: 'v2.7',
    items: [
      { type: 'feature', text: 'Módulo de Políticas corporativas' },
      { type: 'feature', text: 'Planos de Ação com visão Kanban' },
      { type: 'improvement', text: 'Avaliação de Aderência com IA' },
      { type: 'fix', text: 'Correções de performance no Gap Analysis' },
    ],
  },
];

const typeConfig = {
  feature: { label: 'Novo', variant: 'default' as const, icon: Sparkles },
  improvement: { label: 'Melhoria', variant: 'secondary' as const, icon: Zap },
  fix: { label: 'Correção', variant: 'outline' as const, icon: Shield },
};

export function ChangelogPopover() {
  const [hasNew, setHasNew] = useState(true);

  return (
    <Popover onOpenChange={(open) => { if (open) setHasNew(false); }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Sparkles className="h-4 w-4" />
          {hasNew && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold text-sm">Novidades</h4>
          <p className="text-xs text-muted-foreground">Últimas atualizações da plataforma</p>
        </div>
        <ScrollArea className="h-80">
          <div className="p-4 space-y-6">
            {CHANGELOG.map((entry) => (
              <div key={entry.version} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono">{entry.version}</Badge>
                  <span className="text-xs text-muted-foreground">{entry.date}</span>
                </div>
                <ul className="space-y-2">
                  {entry.items.map((item, i) => {
                    const config = typeConfig[item.type];
                    return (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Badge variant={config.variant} className="text-[10px] px-1.5 py-0 shrink-0 mt-0.5">
                          {config.label}
                        </Badge>
                        <span className="text-muted-foreground">{item.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
