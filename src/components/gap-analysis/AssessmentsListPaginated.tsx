import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Search } from 'lucide-react';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AssessmentFromList {
  id: string;
  name: string;
  description?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  framework_name: string;
  framework_version: string;
  framework_type: string;
}

interface AssessmentsListProps {
  onSelectAssessment: (assessment: AssessmentFromList) => void;
  onEditAssessment: (assessment: AssessmentFromList) => void;
}

export const AssessmentsList: React.FC<AssessmentsListProps> = ({ 
  onSelectAssessment, 
  onEditAssessment 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'nao_iniciada':
        return 'bg-secondary';
      case 'em_andamento':
        return 'bg-blue-500 text-white';
      case 'pausada':
        return 'bg-yellow-500 text-black';
      case 'concluida':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getBadgeText = (status: string) => {
    switch (status) {
      case 'nao_iniciada':
        return 'Não Iniciada';
      case 'em_andamento':
        return 'Em Andamento';
      case 'pausada':
        return 'Pausada';
      case 'concluida':
        return 'Concluída';
      default:
        return 'Desconhecido';
    }
  };

  const { data: assessments, loading } = useOptimizedQuery(
    async () => {
      const { data, error } = await supabase
        .from('gap_analysis_assessments')
        .select(`
          id,
          name,
          description,
          status,
          start_date,
          end_date,
          gap_analysis_frameworks (
            id,
            name,
            version,
            type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(assessment => ({
        ...assessment,
        framework_name: assessment.gap_analysis_frameworks?.name || '',
        framework_version: assessment.gap_analysis_frameworks?.version || '',
        framework_type: assessment.gap_analysis_frameworks?.type || ''
      })) || [];

      return { data: formattedData, error: null };
    },
    [],
    {
      cacheKey: 'gap-assessments-list',
      cacheDuration: 5
    }
  ) as { data: AssessmentFromList[], loading: boolean };

  // Filtrar assessments
  const filteredAssessments = assessments?.filter(assessment => {
    const matchesSearch = assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.framework_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Cálculos para paginação
  const totalItems = filteredAssessments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssessments = filteredAssessments.slice(startIndex, startIndex + itemsPerPage);

  // Reset página quando filtros mudam
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  const badgeColor = (status: string) => {
    switch (status) {
      case 'nao_iniciada':
        return 'bg-secondary';
      case 'em_andamento':
        return 'bg-blue-500 text-white';
      case 'pausada':
        return 'bg-yellow-500 text-black';
      case 'concluida':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const badgeText = (status: string) => {
    switch (status) {
      case 'nao_iniciada':
        return 'Não Iniciada';
      case 'em_andamento':
        return 'Em Andamento';
      case 'pausada':
        return 'Pausada';
      case 'concluida':
        return 'Concluída';
      default:
        return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Avaliações de Gap Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliações de Gap Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar avaliações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="nao_iniciada">Não Iniciada</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="pausada">Pausada</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
            </SelectContent>
          </Select>

          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 itens</SelectItem>
              <SelectItem value="20">20 itens</SelectItem>
              <SelectItem value="50">50 itens</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} de {totalItems} avaliações
        </div>

        {paginatedAssessments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Nome</th>
                  <th className="text-left p-2 font-medium">Framework</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-left p-2 font-medium">Data Início</th>
                  <th className="text-left p-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssessments.map((assessment) => (
                  <tr key={assessment.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{assessment.name}</div>
                        {assessment.description && (
                          <div className="text-sm text-muted-foreground">{assessment.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{assessment.framework_name}</div>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            v{assessment.framework_version}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{assessment.status}</Badge>
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {assessment.start_date ? format(new Date(assessment.start_date), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectAssessment(assessment)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditAssessment(assessment)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm || statusFilter !== 'all' 
              ? 'Nenhuma avaliação encontrada com os filtros aplicados.' 
              : 'Nenhuma avaliação cadastrada ainda.'}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
