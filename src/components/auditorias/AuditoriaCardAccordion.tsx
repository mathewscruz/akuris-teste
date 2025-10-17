import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  FileText, 
  ClipboardList, 
  AlertTriangle, 
  FileCheck, 
  Image as ImageIcon,
  Edit, 
  Trash2,
  Calendar,
  User,
  ChevronDown,
  Plus
} from "lucide-react";
import { capitalizeText } from "@/lib/text-utils";

interface AuditoriaCardAccordionProps {
  auditoria: any;
  counts: { trabalhos: number; achados: number; recomendacoes: number };
  onEdit: () => void;
  onDelete: () => void;
  onOpenTrabalhos: () => void;
  onOpenAchados: () => void;
  onOpenRecomendacoes: () => void;
  onOpenEvidencias: () => void;
  auditorNome?: string;
}

const getStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case 'planejamento': return 'outline';
    case 'em_andamento': return 'default';
    case 'concluida': return 'secondary';
    case 'cancelada': return 'destructive';
    default: return 'secondary';
  }
};

const getStatusCustomClass = (status: string) => {
  if (status === 'concluida') return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
  return '';
};

const getPrioridadeBadgeVariant = (prioridade: string): "default" | "destructive" | "secondary" | "outline" => {
  switch (prioridade) {
    case 'critica': return 'destructive';
    case 'alta': return 'default';
    case 'media': return 'secondary';
    case 'baixa': return 'outline';
    default: return 'secondary';
  }
};

const getPrioridadeCustomClass = (prioridade: string) => {
  switch (prioridade) {
    case 'critica': return 'bg-red-600 text-white border-red-700 hover:bg-red-700';
    case 'alta': return 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200';
    default: return '';
  }
};

export function AuditoriaCardAccordion({
  auditoria,
  counts,
  onEdit,
  onDelete,
  onOpenTrabalhos,
  onOpenAchados,
  onOpenRecomendacoes,
  onOpenEvidencias,
  auditorNome
}: AuditoriaCardAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="py-3 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h3 className="font-semibold text-base truncate">{auditoria.nome}</h3>
            </div>
            {auditoria.descricao && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {auditoria.descricao}
              </p>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 w-7 p-0">
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="h-7 w-7 p-0">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge variant="outline" className="text-xs py-0 h-5">{capitalizeText(auditoria.tipo)}</Badge>
          <Badge 
            variant={getStatusBadgeVariant(auditoria.status)}
            className={`text-xs py-0 h-5 ${getStatusCustomClass(auditoria.status)}`}
          >
            {capitalizeText(auditoria.status.replace(/_/g, ' '))}
          </Badge>
          <Badge 
            variant={getPrioridadeBadgeVariant(auditoria.prioridade)}
            className={`text-xs py-0 h-5 ${getPrioridadeCustomClass(auditoria.prioridade)}`}
          >
            {capitalizeText(auditoria.prioridade)}
          </Badge>
          {auditoria.data_inicio && (
            <Badge variant="outline" className="text-xs py-0 h-5">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(auditoria.data_inicio).toLocaleDateString('pt-BR')}
            </Badge>
          )}
          {auditorNome && (
            <Badge variant="outline" className="text-xs py-0 h-5">
              <User className="h-3 w-3 mr-1" />
              {auditorNome}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="py-2 px-4">
        <div className="flex flex-wrap gap-1.5 mb-2">
          <Badge 
            variant="secondary" 
            className="cursor-pointer hover:bg-secondary/80 text-xs py-0 h-5"
            onClick={onOpenTrabalhos}
          >
            <ClipboardList className="h-3 w-3 mr-1" />
            {counts.trabalhos} Trabalhos
          </Badge>
          <Badge 
            variant="secondary" 
            className="cursor-pointer hover:bg-secondary/80 text-xs py-0 h-5"
            onClick={onOpenAchados}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            {counts.achados} Achados
          </Badge>
          <Badge 
            variant="secondary" 
            className="cursor-pointer hover:bg-secondary/80 text-xs py-0 h-5"
            onClick={onOpenRecomendacoes}
          >
            <FileCheck className="h-3 w-3 mr-1" />
            {counts.recomendacoes} Recomendações
          </Badge>
        </div>

        <Accordion type="single" collapsible value={isExpanded ? "details" : ""} onValueChange={(value) => setIsExpanded(!!value)}>
          <AccordionItem value="details" className="border-none">
            <AccordionTrigger className="py-1 hover:no-underline">
              <span className="text-xs font-medium">
                {isExpanded ? "Ocultar Detalhes" : "Ver Detalhes e Ações"}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {/* Seção Trabalhos */}
                <div className="border rounded-md p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5 text-blue-600" />
                      <h4 className="font-semibold text-xs">Trabalhos de Auditoria</h4>
                      <Badge variant="outline" className="text-xs py-0 h-4">{counts.trabalhos}</Badge>
                    </div>
                    <Button size="sm" variant="outline" onClick={onOpenTrabalhos} className="h-6 text-xs px-2">
                      <Plus className="h-3 w-3 mr-1" />
                      Gerenciar
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Checklists, testes e análises realizadas durante a auditoria
                  </p>
                </div>

                {/* Seção Achados */}
                <div className="border rounded-md p-2.5 border-l-2 border-l-orange-500">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
                      <h4 className="font-semibold text-xs">Achados de Auditoria</h4>
                      <Badge variant="outline" className="text-xs py-0 h-4">{counts.achados}</Badge>
                    </div>
                    <Button size="sm" variant="outline" onClick={onOpenAchados} className="h-6 text-xs px-2">
                      <Plus className="h-3 w-3 mr-1" />
                      Gerenciar
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Deficiências, não conformidades e oportunidades de melhoria identificadas
                  </p>
                </div>

                {/* Seção Recomendações */}
                <div className="border rounded-md p-2.5 border-l-2 border-l-green-500">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <FileCheck className="h-3.5 w-3.5 text-green-600" />
                      <h4 className="font-semibold text-xs">Recomendações</h4>
                      <Badge variant="outline" className="text-xs py-0 h-4">{counts.recomendacoes}</Badge>
                    </div>
                    <Button size="sm" variant="outline" onClick={onOpenRecomendacoes} className="h-6 text-xs px-2">
                      <Plus className="h-3 w-3 mr-1" />
                      Gerenciar
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Ações sugeridas para tratamento dos achados identificados
                  </p>
                </div>

                {/* Seção Evidências */}
                <div className="border rounded-md p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-purple-600" />
                      <h4 className="font-semibold text-xs">Evidências</h4>
                    </div>
                    <Button size="sm" variant="outline" onClick={onOpenEvidencias} className="h-6 text-xs px-2">
                      <Plus className="h-3 w-3 mr-1" />
                      Gerenciar
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Documentos, imagens e arquivos que suportam os achados
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
