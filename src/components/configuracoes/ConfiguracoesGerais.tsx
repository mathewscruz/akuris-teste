import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

interface Props {
  userRole: string;
}

const ConfiguracoesGerais = ({ userRole }: Props) => {
  const { user, company, refetchProfile, forceLogoUpdate } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  // Tipos de arquivo aceitos para logos
  const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        toast.error('Erro ao carregar perfil');
      }
    };

    fetchUserProfile();
  }, [user]);

  // Reset preview quando o company logo mudar
  useEffect(() => {
    setLogoPreview(null);
  }, [company?.logo_url]);

  const validateImageFile = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return 'Formato de arquivo não suportado. Use: JPG, PNG, GIF, SVG ou WebP';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'Arquivo muito grande. Tamanho máximo: 5MB';
    }
    
    return null;
  };

  const verifyImageLoad = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const handleCompanyLogoUpload = async (file: File) => {
    if (!userProfile?.empresa_id) {
      toast.error('Empresa não encontrada');
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setUploading(true);
      
      // Criar preview imediato do arquivo
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `empresa-${userProfile.empresa_id}-${timestamp}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('empresa-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('empresa-logos')
        .getPublicUrl(filePath);

      // URL com cache busting para garantir refresh
      const logoUrlWithCacheBusting = `${urlData.publicUrl}?t=${timestamp}`;

      // Verificar se a imagem está acessível
      const isImageReady = await verifyImageLoad(logoUrlWithCacheBusting);
      if (!isImageReady) {
        throw new Error('Falha ao verificar se a imagem foi carregada corretamente');
      }

      const { error: updateError } = await supabase
        .from('empresas')
        .update({ logo_url: logoUrlWithCacheBusting })
        .eq('id', userProfile.empresa_id)
        .select();

      if (updateError) {
        throw new Error(`Erro ao atualizar banco: ${updateError.message}`);
      }

      // Forçar atualização imediata do contexto
      await refetchProfile();
      forceLogoUpdate();

      toast.success('Logo da empresa atualizado com sucesso');

    } catch (error: any) {
      console.error('Erro no upload do logo:', error);
      
      let errorMessage = 'Erro ao fazer upload do logo da empresa';
      if (error.message.includes('upload')) {
        errorMessage = 'Erro ao enviar arquivo para o servidor';
      } else if (error.message.includes('banco')) {
        errorMessage = 'Erro ao salvar informações no banco de dados';
      } else if (error.message.includes('not allowed') || error.message.includes('policy')) {
        errorMessage = 'Você não tem permissão para atualizar o logo da empresa';
      }
      
      toast.error(errorMessage);
      setLogoPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const getCurrentCompanyLogo = () => {
    // Primeiro mostra o preview se existir
    if (logoPreview) return logoPreview;
    // Depois o logo da empresa do contexto com cache busting
    if (company?.logo_url) {
      const hasTimestamp = company.logo_url.includes('?t=');
      return hasTimestamp ? company.logo_url : `${company.logo_url}?t=${Date.now()}`;
    }
    // Por último um placeholder
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Configurações da Empresa - Apenas para Admins */}
      {isAdmin && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Logo da Empresa
          </label>
          <div className="flex items-center gap-4">
            {getCurrentCompanyLogo() && (
              <div className="relative">
                <img
                  key={`company-logo-${Date.now()}`}
                  src={getCurrentCompanyLogo()!}
                  alt="Logo da empresa"
                  className={`h-16 w-auto max-w-[120px] object-contain border-2 border-border rounded ${
                    uploading ? 'opacity-50' : ''
                  }`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCompanyLogoUpload(file);
                  }}
                  disabled={uploading}
                />
                <Button variant="outline" disabled={uploading} asChild>
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Enviando...' : 'Alterar Logo'}
                  </span>
                </Button>
              </label>
              <div className="text-sm text-muted-foreground">
                <p>Será exibido no menu lateral e tela de login</p>
                <p className="text-xs">Formatos aceitos: JPG, PNG, GIF, SVG, WebP (máx. 5MB)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracoesGerais;
