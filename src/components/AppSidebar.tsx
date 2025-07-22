import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  FileCheck, 
  Lock, 
  CheckSquare, 
  Settings,
  ChevronDown,
  Database,
  FileText,
  Handshake,
  BookOpen,
  Users,
  AlertCircle,
  HardDrive,
  MessageSquare,
  Search,
  LogOut
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import logoImage from '@/assets/governaii-logo.png';

const menuItems = [
  {
    title: 'Gestão de Ativos',
    url: '/ativos',
    icon: Database,
  },
  {
    title: 'Gestão de Riscos',
    url: '/riscos',
    icon: AlertTriangle,
  },
  {
    title: 'Controles Internos',
    icon: FileCheck,
    subItems: [
      { title: 'Auditorias', url: '/auditorias', icon: Search },
      { title: 'Contratos', url: '/contratos', icon: Handshake },
      { title: 'Documentos', url: '/documentos', icon: FileText },
    ],
  },
  {
    title: 'Segurança e Privacidade',
    icon: Lock,
    subItems: [
      { title: 'Contas Privilegiadas', url: '/contas-privilegiadas', icon: Users },
      { title: 'Incidentes', url: '/incidentes', icon: AlertCircle },
      { title: 'Dados', url: '/dados', icon: HardDrive },
    ],
  },
  {
    title: 'Compliance',
    icon: CheckSquare,
    subItems: [
      { title: 'Due Diligence', url: '/due-diligence', icon: BookOpen },
      { title: 'Canal de Denúncia', url: '/denuncia', icon: MessageSquare },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const [openGroups, setOpenGroups] = useState<string[]>(['Controles Internos', 'Segurança e Privacidade', 'Compliance']);
  
  const isCollapsed = state === 'collapsed';

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups(prev => 
      prev.includes(groupTitle) 
        ? prev.filter(title => title !== groupTitle)
        : [...prev, groupTitle]
    );
  };

  const isActive = (path: string) => currentPath === path;
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Sidebar
      className={isCollapsed ? 'w-14' : 'w-60'}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <img 
            src={logoImage} 
            alt="GovernAII" 
            className="h-8 w-8 object-contain"
          />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-sidebar-foreground">GovernAII</span>
              <span className="text-xs text-sidebar-foreground/70">
                {profile?.empresa_id ? 'Empresa conectada' : 'Sem empresa'}
              </span>
            </div>
          )}
        </div>
        <SidebarTrigger className="ml-auto mr-2" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação Principal</SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.subItems ? (
                    <Collapsible
                      open={openGroups.includes(item.title)}
                      onOpenChange={() => toggleGroup(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between hover:bg-sidebar-accent/50">
                          <div className="flex items-center">
                            <item.icon className="h-4 w-4 mr-2" />
                            {!isCollapsed && <span>{item.title}</span>}
                          </div>
                          {!isCollapsed && (
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform ${
                                openGroups.includes(item.title) ? 'transform rotate-180' : ''
                              }`} 
                            />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {!isCollapsed && (
                        <CollapsibleContent className="space-y-1">
                          {item.subItems.map((subItem) => (
                            <SidebarMenuButton key={subItem.title} asChild>
                              <NavLink to={subItem.url} className={getNavCls}>
                                <subItem.icon className="h-4 w-4 mr-2 ml-4" />
                                <span className="text-sm">{subItem.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          ))}
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="h-4 w-4 mr-2" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/configuracoes" className={getNavCls}>
                    <Settings className="h-4 w-4 mr-2" />
                    {!isCollapsed && <span>Configurações</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-2">
          {!isCollapsed && profile && (
            <div className="mb-2 px-2 py-1">
              <div className="text-xs text-sidebar-foreground/70">Conectado como:</div>
              <div className="text-sm font-medium text-sidebar-foreground truncate">
                {profile.nome}
              </div>
              <div className="text-xs text-sidebar-foreground/70 capitalize">
                {profile.role.replace('_', ' ')}
              </div>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!isCollapsed && <span>Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}