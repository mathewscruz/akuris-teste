import React, { useState } from 'react';
import { Plus, Users, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import ContaDialog from '@/components/contas-privilegiadas/ContaDialog';
import SistemaDialog from '@/components/contas-privilegiadas/SistemaDialog';
import ContasDashboard from '@/components/contas-privilegiadas/ContasDashboard';

interface ContaPrivilegiada {
  id: string;
  usuario_beneficiario: string;
  email_beneficiario?: string;
  tipo_acesso: string;
  nivel_privilegio: string;
  data_concessao: string;
  data_expiracao: string;
  status: string;
  justificativa_negocio: string;
  sistema_id: string;
  sistemas_privilegiados?: {
    nome_sistema: string;
    tipo_sistema: string;
    criticidade: string;
  };
}

interface SistemaPrivilegiado {
  id: string;
  nome_sistema: string;
  tipo_sistema: string;
  criticidade: string;
  responsavel_sistema?: string;
  url_sistema?: string;
  categoria?: string;
  ativo: boolean;
}

export default function ContasPrivilegiadas() {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [showContaDialog, setShowContaDialog] = useState(false);
  const [showSistemaDialog, setShowSistemaDialog] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaPrivilegiada | null>(null);
  const [selectedSistema, setSelectedSistema] = useState<SistemaPrivilegiado | null>(null);
  const { toast } = useToast();

  // Buscar contas privilegiadas
  const { data: contas = [], refetch: refetchContas } = useQuery({
    queryKey: ['contas-privilegiadas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contas_privilegiadas' as any)
        .select(`
          *,
          sistemas_privilegiados (
            nome_sistema,
            tipo_sistema,
            criticidade
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as ContaPrivilegiada[];
    },
  });

  // Buscar sistemas privilegiados
  const { data: sistemas = [], refetch: refetchSistemas } = useQuery({
    queryKey: ['sistemas-privilegiados'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sistemas_privilegiados' as any)
        .select('*')
        .eq('ativo', true)
        .order('nome_sistema');

      if (error) throw error;
      return (data || []) as unknown as SistemaPrivilegiado[];
    },
  });

  const handleEditConta = (conta: ContaPrivilegiada) => {
    setSelectedConta(conta);
    setShowContaDialog(true);
  };

  const handleEditSistema = (sistema: SistemaPrivilegiado) => {
    setSelectedSistema(sistema);
    setShowSistemaDialog(true);
  };

  const handleCloseContaDialog = () => {
    setSelectedConta(null);
    setShowContaDialog(false);
    refetchContas();
  };

  const handleCloseSistemaDialog = () => {
    setSelectedSistema(null);
    setShowSistemaDialog(false);
    refetchSistemas();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ativo': { variant: 'default' as const, label: 'Ativo', icon: CheckCircle },
      'expirado': { variant: 'destructive' as const, label: 'Expirado', icon: AlertTriangle },
      'pendente_aprovacao': { variant: 'secondary' as const, label: 'Pendente', icon: Clock },
      'revogado': { variant: 'outline' as const, label: 'Revogado', icon: Shield },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente_aprovacao;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getCriticidadeBadge = (criticidade: string) => {
    const colors = {
      'alta': 'bg-red-100 text-red-800 border-red-200',
      'media': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'baixa': 'bg-green-100 text-green-800 border-green-200',
    };

    return (
      <Badge className={colors[criticidade as keyof typeof colors] || colors.media}>
        {criticidade.charAt(0).toUpperCase() + criticidade.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contas Privilegiadas</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore acessos privilegiados aos sistemas críticos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSistemaDialog(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Novo Sistema
          </Button>
          <Button onClick={() => setShowContaDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="contas">Contas Ativas</TabsTrigger>
          <TabsTrigger value="sistemas">Sistemas</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <ContasDashboard contas={contas} sistemas={sistemas} />
        </TabsContent>

        <TabsContent value="contas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contas Privilegiadas
              </CardTitle>
              <CardDescription>
                Lista de todas as contas com acesso privilegiado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Sistema</TableHead>
                    <TableHead>Tipo de Acesso</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Data Expiração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contas.map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{conta.usuario_beneficiario}</div>
                          {conta.email_beneficiario && (
                            <div className="text-sm text-muted-foreground">{conta.email_beneficiario}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{conta.sistemas_privilegiados?.nome_sistema}</div>
                          <div className="text-sm text-muted-foreground">
                            {conta.sistemas_privilegiados?.tipo_sistema}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{conta.tipo_acesso}</TableCell>
                      <TableCell>
                        <Badge variant={conta.nivel_privilegio === 'alto' ? 'destructive' : 'secondary'}>
                          {conta.nivel_privilegio}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(conta.data_expiracao).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{getStatusBadge(conta.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditConta(conta)}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistemas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sistemas Privilegiados
              </CardTitle>
              <CardDescription>
                Sistemas que possuem contas com acesso privilegiado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Sistema</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Criticidade</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sistemas.map((sistema) => (
                    <TableRow key={sistema.id}>
                      <TableCell className="font-medium">{sistema.nome_sistema}</TableCell>
                      <TableCell>{sistema.tipo_sistema}</TableCell>
                      <TableCell>{getCriticidadeBadge(sistema.criticidade)}</TableCell>
                      <TableCell>{sistema.responsavel_sistema || '-'}</TableCell>
                      <TableCell>
                        {sistema.url_sistema ? (
                          <a 
                            href={sistema.url_sistema} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Acessar
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSistema(sistema)}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
              <CardDescription>
                Relatórios e exportações sobre contas privilegiadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Relatórios em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ContaDialog
        open={showContaDialog}
        onClose={handleCloseContaDialog}
        conta={selectedConta}
        sistemas={sistemas}
      />

      <SistemaDialog
        open={showSistemaDialog}
        onClose={handleCloseSistemaDialog}
        sistema={selectedSistema}
      />
    </div>
  );
}