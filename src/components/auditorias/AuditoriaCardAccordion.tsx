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
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg">{auditoria.nome}</h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {auditoria.descricao || "Sem descrição"}
            </p>
          </div>
          <div className="flex gap-1 ml-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline">{capitalizeText(auditoria.tipo)}</Badge>
          <Badge 
            variant={getStatusBadgeVariant(auditoria.status)}
            className={getStatusCustomClass(auditoria.status)}
          >
            {capitalizeText(auditoria.status.replace(/_/g, ' '))}
          </Badge>
          <Badge 
            variant={getPrioridadeBadgeVariant(auditoria.prioridade)}
            className={getPrioridadeCustomClass(auditoria.prioridade)}
          >
            {capitalizeText(auditoria.prioridade)}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
          {auditoria.data_inicio && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(auditoria.data_inicio).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
          {auditorNome && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{auditorNome}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge 
            variant="secondary" 
            className="cursor-pointer hover:bg-secondary/80"
            onClick={onOpenTrabalhos}
          >
            <ClipboardList className="h-3 w-3 mr-1" />
            {counts.trabalhos} Trabalhos
          </Badge>
          <Badge 
            variant="secondary" 
            className="cursor-pointer hover:bg-secondary/80"
            onClick={onOpenAchados}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            {counts.achados} Achados
          </Badge>
          <Badge 
            variant="secondary" 
            className="cursor-pointer hover:bg-secondary/80"
            onClick={onOpenRecomendacoes}
          >
            <FileCheck className="h-3 w-3 mr-1" />
            {counts.recomendacoes} Recomendações
          </Badge>
        </div>

        <Accordion type="single" collapsible value={isExpanded ? "details" : ""} onValueChange={(value) => setIsExpanded(!!value)}>
          <AccordionItem value="details" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline">
              <span className="text-sm font-medium">
                {isExpanded ? "Ocultar Detalhes" : "Ver Detalhes e Ações"}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {/* Seção Trabalhos */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-sm">Trabalhos de Auditoria</h4>
                      <Badge variant="outline">{counts.trabalhos}</Badge>
                    </div>
                    <Button size="sm" variant="outline" onClick={onOpenTrabalhos}>
                      <Plus className="h-3 w-3 mr-1" />
                      Gerenciar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Checklists, testes e análises realizadas durante a auditoria
                  </p>
                </div>

                {/* Seção Achados */}
                <div className="border rounded-lg p-4 border-l-4 border-l-orange-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <h4 className="font-semibold text-sm">Achados de Auditoria</h4>
                      <Badge variant="outline">{counts.achados}</Badge>
                    </div>
                    <Button size="sm" variant="outline" onClick={onOpenAchados}>
                      <Plus className="h-3 w-3 mr-1" />
                      Gerenciar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Deficiências, não conformidades e oportunidades de melhoria identificadas
                  </p>
                  {counts.achados > 0 && (
                    <div className="mt-3 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={onOpenRecomendacoes}
                        className="text-xs"
                      >
                        <FileCheck className="h-3 w-3 mr-1" />
                        Ver Recomendações ({counts.recomendacoes})
                      </Button>
                    </div>
                  )}
                </div>

                {/* Seção Recomendações */}
                <div className="border rounded-lg p-4 border-l-4 border-l-green-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-green-600" />
                      <h4 className="font-semibold text-sm">Recomendações</h4>
                      <Badge variant="outline">{counts.recomendacoes}</Badge>
                    </div>
                    <Button size="sm" variant="outline" onClick={onOpenRecomendacoes}>
                      <Plus className="h-3 w-3 mr-1" />
                      Gerenciar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ações sugeridas para tratamento dos achados identificados
                  </p>
                </div>

                {/* Seção Evidências */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-purple-600" />
                      <h4 className="font-semibold text-sm">Evidências</h4>
                    </div>
                    <Button size="sm" variant="outline" onClick={onOpenEvidencias}>
                      <Plus className="h-3 w-3 mr-1" />
                      Gerenciar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
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
