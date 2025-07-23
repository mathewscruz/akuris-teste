import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function DenunciaExternaRedirect() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarEmpresaPorToken = async () => {
      if (!token) {
        navigate('/404', { replace: true });
        return;
      }

      try {
        const SUPABASE_URL = "https://lnlkahtugwmkznasapfd.supabase.co";
        const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxubGthaHR1Z3dta3puYXNhcGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxOTk4MjcsImV4cCI6MjA2ODc3NTgyN30.DRHZ_55_8aH8fEDghoY84fl3rChFNgVyPA9UM3y-KCY";
        
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/empresas?token_publico=eq.${token}&ativo=eq.true&select=slug`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Erro na requisição');
        }

        const data = await response.json();

        if (data && data.length > 0) {
          navigate(`/${data[0].slug}/denuncia`, { replace: true });
        } else {
          console.error('Empresa não encontrada para token:', token);
          navigate('/404', { replace: true });
        }
      } catch (error) {
        console.error('Erro ao buscar empresa:', error);
        navigate('/404', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    buscarEmpresaPorToken();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return null;
}