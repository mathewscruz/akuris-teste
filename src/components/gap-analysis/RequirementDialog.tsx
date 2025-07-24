import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Requirement } from './types';
import { logger } from '@/lib/logger';

interface RequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frameworkId: string;
  requirement?: Requirement | null;
  onSuccess: () => void;
}

export const RequirementDialog = ({
  open,
  onOpenChange,
  frameworkId,
  requirement,
  onSuccess
}: RequirementDialogProps) => {
  const [formData, setFormData] = useState({
    codigo: '',
    titulo: '',
    descricao: '',
    categoria: '',
    peso: 1,
    obrigatorio: false,
    ordem: 1
  });

  // Atualizar o formData quando o requirement mudar
  useEffect(() => {
    if (requirement) {
      setFormData({
        codigo: requirement.codigo || '',
        titulo: requirement.titulo || '',
        descricao: requirement.descricao || '',
        categoria: requirement.categoria || '',
        peso: requirement.peso || 1,
        obrigatorio: requirement.obrigatorio || false,
        ordem: requirement.ordem || 1
      });
    } else {
      // Reset form para novo requisito
      setFormData({
        codigo: '',
        titulo: '',
        descricao: '',
        categoria: '',
        peso: 1,
        obrigatorio: false,
        ordem: 1
      });
    }
  }, [requirement, open]);
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, session, profile, debugAuthState } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug do estado de autenticação
    debugAuthState();
    
    logger.info('Attempting to save requirement', {
      frameworkId,
      requirementId: requirement?.id,
      hasUser: !!user,
      hasSession: !!session,
      hasProfile: !!profile,
      profileRole: profile?.role,
      module: 'gap-analysis'
    });

    if (!user || !session) {
      logger.error('Authentication required for requirement save', {
        hasUser: !!user,
        hasSession: !!session,
        module: 'gap-analysis'
      });
      
      toast({
        title: "Erro de autenticação",
        description: "Sessão expirada. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Para super-admin, permitir sem empresa_id
      let empresaId = null;
      
      if (profile?.role === 'super_admin') {
        logger.info('Super admin detected, bypassing empresa_id requirement', {
          userId: user.id,
          role: profile.role,
          module: 'gap-analysis'
        });
      } else {
        // Verificar se temos empresa_id válida para outros usuários
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('empresa_id, role')
          .eq('user_id', user.id)
          .single();

        logger.debug('Profile data retrieved', {
          userId: user.id,
          profileData,
          profileError: profileError?.message,
          module: 'gap-analysis'
        });

        if (profileError) {
          logger.error('Error fetching profile', {
            error: profileError.message,
            userId: user.id,
            module: 'gap-analysis'
          });
          throw new Error('Erro ao verificar perfil do usuário');
        }

        if (!profileData?.empresa_id && profileData?.role !== 'super_admin') {
          logger.error('User without empresa_id trying to save requirement', {
            userId: user.id,
            role: profileData?.role,
            module: 'gap-analysis'
          });
          throw new Error('Usuário não possui empresa associada');
        }
        
        empresaId = profileData.empresa_id;
      }

      const requirementData = {
        ...formData,
        framework_id: frameworkId,
      };

      logger.debug('Saving requirement with data', {
        requirementData,
        isUpdate: !!requirement,
        userId: user.id,
        empresaId,
        module: 'gap-analysis'
      });

      if (requirement) {
        const { error } = await supabase
          .from('gap_analysis_requirements')
          .update(requirementData)
          .eq('id', requirement.id);
        
        if (error) {
          logger.error('Error updating requirement', {
            error: error.message,
            requirementId: requirement.id,
            requirementData,
            module: 'gap-analysis'
          });
          throw error;
        }
        
        logger.info('Requirement updated successfully', {
          requirementId: requirement.id,
          module: 'gap-analysis'
        });
        
        toast({
          title: "Requisito atualizado",
          description: "O requisito foi atualizado com sucesso.",
        });
      } else {
        const { data, error } = await supabase
          .from('gap_analysis_requirements')
          .insert([requirementData])
          .select();
        
        if (error) {
          logger.error('Error inserting requirement', {
            error: error.message,
            requirementData,
            module: 'gap-analysis'
          });
          throw error;
        }
        
        logger.info('Requirement created successfully', {
          requirementId: data?.[0]?.id,
          module: 'gap-analysis'
        });
        
        toast({
          title: "Requisito criado",
          description: "O requisito foi criado com sucesso.",
        });
      }

      onSuccess();
    } catch (error: any) {
      logger.error('Error saving requirement', {
        error: error.message || String(error),
        frameworkId,
        userId: user.id,
        requirementId: requirement?.id,
        module: 'gap-analysis'
      });
      
      let errorMessage = "Ocorreu um erro ao salvar o requisito.";
      
      if (error.message?.includes('row-level security')) {
        errorMessage = "Erro de permissão: verifique se você tem acesso a este framework.";
      } else if (error.message?.includes('empresa associada')) {
        errorMessage = "Usuário não possui empresa associada. Entre em contato com o administrador.";
      } else if (error.message?.includes('violates check constraint') || error.message?.includes('invalid input')) {
        errorMessage = "Dados inválidos. Verifique os campos preenchidos.";
      } else if (error.message?.includes('Authentication')) {
        errorMessage = "Sessão expirada. Faça login novamente.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categorias = [
    'Governança',
    'Segurança',
    'Operações',
    'Conformidade',
    'Gestão de Riscos',
    'Controles Internos',
    'Auditoria',
    'Monitoramento'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {requirement ? 'Editar Requisito' : 'Novo Requisito'}
          </DialogTitle>
          <DialogDescription>
            {requirement 
              ? 'Edite as informações do requisito selecionado.' 
              : 'Adicione um novo requisito ao framework.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                placeholder="Ex: REQ-001"
                required
              />
            </div>
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Digite o título do requisito"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva detalhadamente o requisito"
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="peso">Peso</Label>
              <Input
                id="peso"
                type="number"
                min="1"
                max="10"
                value={formData.peso}
                onChange={(e) => setFormData(prev => ({ ...prev, peso: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div>
              <Label htmlFor="ordem">Ordem</Label>
              <Input
                id="ordem"
                type="number"
                min="1"
                value={formData.ordem}
                onChange={(e) => setFormData(prev => ({ ...prev, ordem: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <Switch
                id="obrigatorio"
                checked={formData.obrigatorio}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, obrigatorio: checked }))}
              />
              <Label htmlFor="obrigatorio">Obrigatório</Label>
            </div>
          </div>


          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : requirement ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};