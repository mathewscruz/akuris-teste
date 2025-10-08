import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, AlertTriangle, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Risco {
  id: string;
  nome: string;
  descricao?: string;
  nivel_risco_inicial: string;
  nivel_risco_residual?: string;
  status: string;
  responsavel?: string;
  categoria?: { nome: string; cor?: string };
  created_at: string;
  aceito: boolean;
}

interface RiscosCardViewProps {
  riscos: Risco[];
  onEdit: (risco: Risco) => void;
  onDelete: (risco: Risco) => void;
  getNivelBadgeVariant: (nivel: string) => any;
  getNivelBadgeStyle: (nivel: string) => any;
  getStatusBadgeVariant: (status: string) => any;
}

export function RiscosCardView({ 
  riscos, 
  onEdit, 
  onDelete,
  getNivelBadgeVariant,
  getNivelBadgeStyle,
  getStatusBadgeVariant
}: RiscosCardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {riscos.map((risco) => (
        <Card key={risco.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <CardTitle className="text-base line-clamp-2">{risco.nome}</CardTitle>
                {risco.categoria && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {risco.categoria.cor && (
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: risco.categoria.cor }}
                      />
                    )}
                    <span>{risco.categoria.nome}</span>
                  </div>
                )}
              </div>
              <Badge 
                variant={getNivelBadgeVariant(risco.nivel_risco_inicial)}
                style={getNivelBadgeStyle(risco.nivel_risco_inicial)}
                className="shrink-0"
              >
                {risco.nivel_risco_inicial}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {risco.descricao && (
              <CardDescription className="line-clamp-3">
                {risco.descricao}
              </CardDescription>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusBadgeVariant(risco.status)}>
                {risco.status}
              </Badge>
              {risco.nivel_risco_residual && (
                <Badge 
                  variant="outline"
                  style={getNivelBadgeStyle(risco.nivel_risco_residual)}
                >
                  Residual: {risco.nivel_risco_residual}
                </Badge>
              )}
              {risco.aceito && (
                <Badge variant="secondary">
                  Aceito
                </Badge>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {risco.responsavel && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{risco.responsavel}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(risco.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(risco)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(risco)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
