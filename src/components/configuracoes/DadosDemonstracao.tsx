import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database, Loader2 } from "lucide-react";

export function DadosDemonstracao() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePopularDados = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('popular_dados_demonstracao');

      if (error) throw error;

      const result = data as { success: boolean; message: string; counts?: any };

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
      } else {
        toast({
          title: "Aviso",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Erro ao popular dados:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao popular dados de demonstração",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Dados de Demonstração
        </CardTitle>
        <CardDescription>
          Popule o sistema com dados de exemplo para apresentações comerciais e demonstrações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            Esta ação criará dados de exemplo em todos os módulos principais:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
            <li>Riscos (3 registros)</li>
            <li>Controles (3 registros)</li>
            <li>Documentos (3 registros)</li>
            <li>Incidentes (3 registros)</li>
            <li>Ativos (3 registros)</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            <strong>Nota:</strong> Esta ação só pode ser executada uma vez. Se já existirem riscos cadastrados, será exibido um aviso.
          </p>
        </div>

        <Button 
          onClick={handlePopularDados} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Populando dados...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Popular Dados de Demonstração
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
