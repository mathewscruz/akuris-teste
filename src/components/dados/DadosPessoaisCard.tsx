import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Link2, FileText, ArrowRightLeft, Shield, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DadosPessoaisCardProps {
  dado: any;
  onEdit: () => void;
  onDelete: () => void;
  onMapear: () => void;
  onCriarRopa: () => void;
  onViewDetalhes: () => void;
}

export function DadosPessoaisCard({ 
  dado, 
  onEdit, 
  onDelete, 
  onMapear, 
  onCriarRopa,
  onViewDetalhes 
}: DadosPessoaisCardProps) {
  const [stats, setStats] = useState({ mapeamentos: 0, ropas: 0, fluxos: 0 });

  useEffect(() => {
    loadStats();
  }, [dado.id]);

  const loadStats = async () => {
    try {
      const [mapeamentosRes, ropasRes, fluxosRes] = await Promise.all([
        supabase.from('dados_mapeamento').select('id').eq('dados_pessoais_id', dado.id),
        supabase.from('ropa_dados_vinculados').select('id').eq('dados_pessoais_id', dado.id),
        supabase.from('dados_fluxos').select('id').eq('dados_pessoais_id', dado.id)
      ]);

      setStats({
        mapeamentos: mapeamentosRes.data?.length || 0,
        ropas: ropasRes.data?.length || 0,
        fluxos: fluxosRes.data?.length || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const getSensibilidadeBadge = () => {
    if (dado.tipo_dados === 'sensivel' || dado.sensibilidade === 'muito_sensivel') {
      return <Badge variant="destructive"><Shield className="h-3 w-3 mr-1" />Sensível</Badge>;
    }
    if (dado.sensibilidade === 'sensivel') {
      return <Badge variant="secondary"><Shield className="h-3 w-3 mr-1" />Moderado</Badge>;
    }
    return <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Comum</Badge>;
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onViewDetalhes}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">{dado.nome}</h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{dado.descricao || "Sem descrição"}</p>
          </div>
          <div className="flex gap-1 ml-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline">{dado.categoria_dados}</Badge>
          {getSensibilidadeBadge()}
          <Badge variant="outline">{dado.base_legal}</Badge>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge 
            variant="secondary" 
            className="cursor-pointer hover:bg-secondary/80"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <Link2 className="h-3 w-3 mr-1" />
            {stats.mapeamentos} Ativos
          </Badge>
          <Badge 
            variant="secondary" 
            className="cursor-pointer hover:bg-secondary/80"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <FileText className="h-3 w-3 mr-1" />
            {stats.ropas} ROPAs
          </Badge>
          <Badge 
            variant="secondary" 
            className="cursor-pointer hover:bg-secondary/80"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <ArrowRightLeft className="h-3 w-3 mr-1" />
            {stats.fluxos} Fluxos
          </Badge>
        </div>

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onMapear}
          >
            <Link2 className="h-3 w-3 mr-1" />
            Mapear
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onCriarRopa}
          >
            <FileText className="h-3 w-3 mr-1" />
            ROPA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
