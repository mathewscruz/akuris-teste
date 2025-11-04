import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEmpresaId } from '@/hooks/useEmpresaId';
import { Loader2, FileText, Shield } from 'lucide-react';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';

interface AdherenceAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AdherenceAssessmentDialog({ open, onOpenChange, onSuccess }: AdherenceAssessmentDialogProps) {
  const { toast } = useToast();
  const { empresaId, loading: loadingEmpresa } = useEmpresaId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome_analise: '',
    descricao: '',
    framework_id: '',
    documento_id: ''
  });

  // Buscar frameworks disponíveis
  const { data: frameworks, loading: loadingFrameworks } = useOptimizedQuery(
    async () => {
      const { data, error } = await supabase
        .from('gap_analysis_frameworks')
        .select('id, nome, versao')
        .order('nome');
      
      if (error) throw error;
      return { data, error: null };
    },
    [],
    { cacheKey: 'frameworks-for-adherence', cacheDuration: 60000 }
  );

  // Buscar documentos disponíveis (políticas e procedimentos)
  const { data: documentos, loading: loadingDocumentos } = useOptimizedQuery(
    async () => {
      const { data, error } = await supabase
        .from('documentos')
        .select('id, nome, tipo, arquivo_nome')
        .in('tipo', ['politica', 'procedimento', 'documento', 'norma'])
        .not('arquivo_url', 'is', null)
        .order('nome');
      
      if (error) throw error;
      return { data, error: null };
    },
    [],
    { cacheKey: 'documents-for-adherence', cacheDuration: 60000 }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_analise || !formData.framework_id || !formData.documento_id) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Buscar informações do framework e documento para cache
      const framework = frameworks?.find(f => f.id === formData.framework_id);
      const documento = documentos?.find(d => d.id === formData.documento_id);

      // Criar registro inicial com status "processando"
      const { data: assessment, error: insertError } = await supabase
        .from('gap_analysis_adherence_assessments')
        .insert([{
          empresa_id: empresaId,
          framework_id: formData.framework_id,
          documento_id: formData.documento_id,
          nome_analise: formData.nome_analise,
          descricao: formData.descricao || null,
          status: 'processando',
          framework_nome: framework?.nome,
          framework_versao: framework?.versao,
          documento_nome: documento?.nome,
          documento_tipo: documento?.tipo,
          created_by: user?.id
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Chamar edge function para processar a análise
      const { error: functionError } = await supabase.functions.invoke('analyze-document-adherence', {
        body: {
          assessmentId: assessment.id,
          frameworkId: formData.framework_id,
          documentId: formData.documento_id,
          empresaId
        }
      });

      if (functionError) throw functionError;

      toast({
        title: "Análise iniciada",
        description: "A avaliação de aderência está sendo processada. Isso pode levar alguns minutos.",
      });

      setFormData({
        nome_analise: '',
        descricao: '',
        framework_id: '',
        documento_id: ''
      });

      onSuccess();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Error creating adherence assessment:', error);
      toast({
        title: "Erro ao iniciar análise",
        description: error.message || "Ocorreu um erro ao iniciar a avaliação.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Avaliação de Aderência</DialogTitle>
          <DialogDescription>
            Compare um documento interno com os requisitos de um framework regulatório usando IA
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome_analise">Nome da Avaliação *</Label>
            <Input
              id="nome_analise"
              value={formData.nome_analise}
              onChange={(e) => setFormData({ ...formData, nome_analise: e.target.value })}
              placeholder="Ex: Análise Política de Segurança vs ISO 27001"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o objetivo desta avaliação..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="framework_id">Framework *</Label>
            <Select
              value={formData.framework_id}
              onValueChange={(value) => setFormData({ ...formData, framework_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o framework" />
              </SelectTrigger>
              <SelectContent>
                {loadingFrameworks ? (
                  <SelectItem value="loading" disabled>Carregando...</SelectItem>
                ) : frameworks && frameworks.length > 0 ? (
                  frameworks.map((framework: any) => (
                    <SelectItem key={framework.id} value={framework.id}>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {framework.nome} {framework.versao && `(${framework.versao})`}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>Nenhum framework cadastrado</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="documento_id">Documento *</Label>
            <Select
              value={formData.documento_id}
              onValueChange={(value) => setFormData({ ...formData, documento_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o documento" />
              </SelectTrigger>
              <SelectContent>
                {loadingDocumentos ? (
                  <SelectItem value="loading" disabled>Carregando...</SelectItem>
                ) : documentos && documentos.length > 0 ? (
                  documentos.map((doc: any) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {doc.nome} <span className="text-xs text-muted-foreground">({doc.tipo})</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>Nenhum documento com arquivo anexado</SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Apenas documentos com arquivos anexados podem ser analisados
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || loadingFrameworks || loadingDocumentos}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Análise
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}