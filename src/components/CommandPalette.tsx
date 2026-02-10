import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  HardDrive,
  AlertTriangle,
  Shield,
  FileText,
  Bug,
  Eye,
  Users,
  FileCheck,
  Scale,
  Target,
  BarChart3,
  Settings,
  Megaphone,
  ClipboardList,
  Key,
  MonitorSmartphone,
  ScrollText,
} from 'lucide-react';

const MODULES = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, keywords: ['inicio', 'home', 'painel'] },
  { name: 'Gestão de Riscos', path: '/riscos', icon: AlertTriangle, keywords: ['risco', 'ameaca', 'vulnerabilidade'] },
  { name: 'Governança', path: '/governanca', icon: Shield, keywords: ['controle', 'auditoria', 'compliance'] },
  { name: 'Gap Analysis', path: '/gap-analysis', icon: Target, keywords: ['framework', 'conformidade', 'iso', 'nist', 'lgpd'] },
  { name: 'Frameworks', path: '/gap-analysis/frameworks', icon: Target, keywords: ['iso 27001', 'nist', 'lgpd', 'sox'] },
  { name: 'Ativos', path: '/ativos', icon: HardDrive, keywords: ['ativo', 'dispositivo', 'hardware', 'software'] },
  { name: 'Licenças', path: '/ativos/licencas', icon: Key, keywords: ['licenca', 'software', 'renovacao'] },
  { name: 'Chaves Criptográficas', path: '/ativos/chaves', icon: Key, keywords: ['chave', 'criptografia', 'certificado'] },
  { name: 'Documentos', path: '/documentos', icon: FileText, keywords: ['documento', 'politica', 'procedimento'] },
  { name: 'Contratos', path: '/contratos', icon: Scale, keywords: ['contrato', 'fornecedor', 'sla'] },
  { name: 'Incidentes', path: '/incidentes', icon: Bug, keywords: ['incidente', 'seguranca', 'breach'] },
  { name: 'Privacidade (LGPD)', path: '/privacidade', icon: Eye, keywords: ['lgpd', 'dados', 'ropa', 'titular'] },
  { name: 'Contas Privilegiadas', path: '/contas-privilegiadas', icon: Users, keywords: ['conta', 'privilegio', 'admin', 'acesso'] },
  { name: 'Revisão de Acessos', path: '/revisao-acessos', icon: FileCheck, keywords: ['revisao', 'acesso', 'review'] },
  { name: 'Due Diligence', path: '/due-diligence', icon: ClipboardList, keywords: ['due diligence', 'fornecedor', 'terceiro'] },
  { name: 'Canal de Denúncias', path: '/denuncia', icon: Megaphone, keywords: ['denuncia', 'canal', 'ouvidoria'] },
  { name: 'Políticas', path: '/politicas', icon: ScrollText, keywords: ['politica', 'norma', 'regulamento'] },
  { name: 'Planos de Ação', path: '/planos-acao', icon: ClipboardList, keywords: ['plano', 'acao', 'tarefa'] },
  { name: 'Relatórios', path: '/relatorios', icon: BarChart3, keywords: ['relatorio', 'report', 'exportar'] },
  { name: 'Configurações', path: '/configuracoes', icon: Settings, keywords: ['config', 'empresa', 'usuario', 'integracao'] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    navigate(path);
  }, [navigate]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar módulos, páginas..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Módulos">
          {MODULES.map((module) => (
            <CommandItem
              key={module.path}
              value={`${module.name} ${module.keywords.join(' ')}`}
              onSelect={() => handleSelect(module.path)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <module.icon className="h-4 w-4 text-muted-foreground" />
              <span>{module.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
