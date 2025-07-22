
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Settings, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import GerenciamentoEmpresas from '@/components/configuracoes/GerenciamentoEmpresas';
import GerenciamentoUsuarios from '@/components/configuracoes/GerenciamentoUsuarios';
import ConfiguracoesGerais from '@/components/configuracoes/ConfiguracoesGerais';
import { PageTransition } from '@/components/PageTransition';

const Configuracoes = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) setUserRole(data.role);
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      }
    };

    fetchUserRole();
  }, [user]);

  const isSuperAdmin = userRole === 'super_admin';

  return (
    <PageTransition>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie empresas, usuários e configurações do sistema
          </p>
        </div>

        <Tabs defaultValue="usuarios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            {isSuperAdmin && (
              <TabsTrigger value="empresas" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Empresas</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="usuarios" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="geral" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Geral</span>
            </TabsTrigger>
          </TabsList>

          {isSuperAdmin && (
            <TabsContent value="empresas">
              <PageTransition type="slide" delay={100}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Gerenciamento de Empresas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GerenciamentoEmpresas />
                  </CardContent>
                </Card>
              </PageTransition>
            </TabsContent>
          )}

          <TabsContent value="usuarios">
            <PageTransition type="scale" delay={100}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gerenciamento de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GerenciamentoUsuarios userRole={userRole} />
                </CardContent>
              </Card>
            </PageTransition>
          </TabsContent>

          <TabsContent value="geral">
            <PageTransition type="fade" delay={100}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ConfiguracoesGerais userRole={userRole} />
                </CardContent>
              </Card>
            </PageTransition>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default Configuracoes;
