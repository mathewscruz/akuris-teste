import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, FileWarning, Flame, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AlertDetail {
  id: string;
  title: string;
  description?: string;
  type: 'risco' | 'denuncia' | 'controle' | 'incidente';
}

interface AlertsDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alertDetails: AlertDetail[];
  riscosAltos: number;
  denunciasPendentes: number;
  controlesVencendo: number;
  incidentesCriticos: number;
}

const AlertsDetailDialog = ({
  open,
  onOpenChange,
  alertDetails,
  riscosAltos,
  denunciasPendentes,
  controlesVencendo,
  incidentesCriticos
}: AlertsDetailDialogProps) => {
  const navigate = useNavigate();

  const getTypeConfig = (type: AlertDetail['type']) => {
    switch (type) {
      case 'risco':
        return {
          icon: AlertTriangle,
          label: 'Risco',
          variant: 'destructive' as const,
          route: '/riscos'
        };
      case 'denuncia':
        return {
          icon: FileWarning,
          label: 'Denúncia',
          variant: 'warning' as const,
          route: '/denuncia'
        };
      case 'controle':
        return {
          icon: Shield,
          label: 'Controle',
          variant: 'secondary' as const,
          route: '/governanca?tab=controles'
        };
      case 'incidente':
        return {
          icon: Flame,
          label: 'Incidente',
          variant: 'destructive' as const,
          route: '/incidentes'
        };
    }
  };

  const handleNavigate = (type: AlertDetail['type']) => {
    const config = getTypeConfig(type);
    onOpenChange(false);
    navigate(config.route);
  };

  const groupedAlerts = {
    risco: alertDetails.filter(a => a.type === 'risco'),
    denuncia: alertDetails.filter(a => a.type === 'denuncia'),
    controle: alertDetails.filter(a => a.type === 'controle'),
    incidente: alertDetails.filter(a => a.type === 'incidente')
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Detalhamento de Alertas Críticos
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-destructive/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-destructive">{riscosAltos}</p>
            <p className="text-xs text-muted-foreground">Riscos Altos</p>
          </div>
          <div className="bg-warning/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-warning">{denunciasPendentes}</p>
            <p className="text-xs text-muted-foreground">Denúncias</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-secondary-foreground">{controlesVencendo}</p>
            <p className="text-xs text-muted-foreground">Controles</p>
          </div>
          <div className="bg-destructive/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-destructive">{incidentesCriticos}</p>
            <p className="text-xs text-muted-foreground">Incidentes</p>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {/* Riscos */}
            {groupedAlerts.risco.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Riscos Altos/Críticos
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleNavigate('risco')}
                    className="text-xs"
                  >
                    Ver todos <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {groupedAlerts.risco.slice(0, 5).map(alert => (
                    <div 
                      key={alert.id} 
                      className="p-3 bg-muted/50 rounded-lg border-l-4 border-destructive"
                    >
                      <p className="font-medium text-sm">{alert.title}</p>
                      {alert.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {alert.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {groupedAlerts.risco.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{groupedAlerts.risco.length - 5} riscos adicionais
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Denúncias */}
            {groupedAlerts.denuncia.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileWarning className="h-4 w-4 text-warning" />
                    Denúncias Pendentes
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleNavigate('denuncia')}
                    className="text-xs"
                  >
                    Ver todas <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {groupedAlerts.denuncia.slice(0, 5).map(alert => (
                    <div 
                      key={alert.id} 
                      className="p-3 bg-muted/50 rounded-lg border-l-4 border-warning"
                    >
                      <p className="font-medium text-sm">{alert.title}</p>
                      {alert.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {alert.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {groupedAlerts.denuncia.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{groupedAlerts.denuncia.length - 5} denúncias adicionais
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Controles */}
            {groupedAlerts.controle.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-secondary-foreground" />
                    Controles Vencendo (30 dias)
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleNavigate('controle')}
                    className="text-xs"
                  >
                    Ver todos <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {groupedAlerts.controle.slice(0, 5).map(alert => (
                    <div 
                      key={alert.id} 
                      className="p-3 bg-muted/50 rounded-lg border-l-4 border-secondary"
                    >
                      <p className="font-medium text-sm">{alert.title}</p>
                      {alert.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {alert.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {groupedAlerts.controle.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{groupedAlerts.controle.length - 5} controles adicionais
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Incidentes */}
            {groupedAlerts.incidente.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Flame className="h-4 w-4 text-destructive" />
                    Incidentes Críticos
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleNavigate('incidente')}
                    className="text-xs"
                  >
                    Ver todos <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {groupedAlerts.incidente.slice(0, 5).map(alert => (
                    <div 
                      key={alert.id} 
                      className="p-3 bg-muted/50 rounded-lg border-l-4 border-destructive"
                    >
                      <p className="font-medium text-sm">{alert.title}</p>
                      {alert.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {alert.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {groupedAlerts.incidente.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{groupedAlerts.incidente.length - 5} incidentes adicionais
                    </p>
                  )}
                </div>
              </div>
            )}

            {alertDetails.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum alerta crítico no momento.</p>
                <p className="text-sm">Todos os indicadores estão dentro do esperado.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AlertsDetailDialog;
