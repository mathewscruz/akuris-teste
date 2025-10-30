import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export function useEmpresaId() {
  const { user } = useAuth();
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmpresaId() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('empresa_id')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setEmpresaId(data?.empresa_id || null);
      } catch (error) {
        console.error('Erro ao buscar empresa_id:', error);
        setEmpresaId(null);
      } finally {
        setLoading(false);
      }
    }

    fetchEmpresaId();
  }, [user?.id]);

  return { empresaId, loading };
}
