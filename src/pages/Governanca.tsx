import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Shield, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ControlesContent from "@/components/governanca/ControlesContent";
import AuditoriasContent from "@/components/governanca/AuditoriasContent";

export default function Governanca() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Detectar a aba inicial baseado no path ou query param
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'auditorias') return 'auditorias';
    
    const path = location.pathname;
    if (path.includes('/auditorias') || location.state?.tab === 'auditorias') {
      return 'auditorias';
    }
    return 'controles';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  
  // Atualizar aba quando a rota muda
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'auditorias') {
      setActiveTab('auditorias');
    } else {
      const path = location.pathname;
      if (path === '/governanca/auditorias') {
        setActiveTab('auditorias');
      } else if (path === '/governanca/controles' || path === '/governanca') {
        setActiveTab('controles');
      }
    }
  }, [location.pathname, searchParams]);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'controles': return 'Controles Internos';
      case 'auditorias': return 'Auditorias';
      default: return 'Governança';
    }
  };

  const getPageDescription = () => {
    switch (activeTab) {
      case 'controles': return 'Gerencie os controles internos da organização';
      case 'auditorias': return 'Gerencie auditorias e acompanhe evidências';
      default: return '';
    }
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title={getPageTitle()}
        description={getPageDescription()}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="controles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Controles
          </TabsTrigger>
          <TabsTrigger value="auditorias" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Auditorias
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="controles" className="mt-6">
          <ControlesContent />
        </TabsContent>
        
        <TabsContent value="auditorias" className="mt-6">
          <AuditoriasContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
