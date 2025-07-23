import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Categoria {
  id: string;
  nome: string;
}

interface FiltrosAvancados {
  nome: string;
  tipo: string;
  categoria: string;
  status: string;
  dataInicio?: Date;
  dataFim?: Date;
  dataVencimentoInicio?: Date;
  dataVencimentoFim?: Date;
  confidencial?: boolean;
  comArquivo?: boolean;
  tags: string;
  tamanhoMin?: number;
  tamanhoMax?: number;
}

interface BuscaAvancadaDocumentosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (filters: FiltrosAvancados) => void;
  categorias: Categoria[];
}

export function BuscaAvancadaDocumentos({ 
  open, 
  onOpenChange, 
  onSearch, 
  categorias 
}: BuscaAvancadaDocumentosProps) {
  const [filters, setFilters] = useState<FiltrosAvancados>({
    nome: '',
    tipo: '',
    categoria: '',
    status: '',
    tags: '',
  });

  const handleSearch = () => {
    // Criar filtros limpos (sem valores vazios)
    const cleanFilters: Partial<FiltrosAvancados> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        (cleanFilters as any)[key] = value;
      }
    });

    onSearch(cleanFilters as FiltrosAvancados);
    onOpenChange(false);
  };

  const handleReset = () => {
    setFilters({
      nome: '',
      tipo: '',
      categoria: '',
      status: '',
      tags: '',
    });
  };

  const updateFilter = <K extends keyof FiltrosAvancados>(key: K, value: FiltrosAvancados[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const DatePicker = ({ date, onDateChange, placeholder }: { 
    date?: Date; 
    onDateChange: (date: Date | undefined) => void;
    placeholder: string;
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Busca Avançada de Documentos</DialogTitle>
          <DialogDescription>
            Use os filtros abaixo para encontrar documentos específicos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Documento</Label>
                <Input
                  id="nome"
                  value={filters.nome}
                  onChange={(e) => updateFilter('nome', e.target.value)}
                  placeholder="Nome do documento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={filters.tipo} onValueChange={(value) => updateFilter('tipo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="politica">Política</SelectItem>
                    <SelectItem value="procedimento">Procedimento</SelectItem>
                    <SelectItem value="instrucao">Instrução</SelectItem>
                    <SelectItem value="formulario">Formulário</SelectItem>
                    <SelectItem value="certificado">Certificado</SelectItem>
                    <SelectItem value="contrato">Contrato</SelectItem>
                    <SelectItem value="relatorio">Relatório</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={filters.categoria} onValueChange={(value) => updateFilter('categoria', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.nome}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                id="tags"
                value={filters.tags}
                onChange={(e) => updateFilter('tags', e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          {/* Filtros de Data */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Filtros de Data</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Data de Criação - Início</Label>
                <DatePicker
                  date={filters.dataInicio}
                  onDateChange={(date) => updateFilter('dataInicio', date)}
                  placeholder="Selecione a data"
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Criação - Fim</Label>
                <DatePicker
                  date={filters.dataFim}
                  onDateChange={(date) => updateFilter('dataFim', date)}
                  placeholder="Selecione a data"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Data de Vencimento - Início</Label>
                <DatePicker
                  date={filters.dataVencimentoInicio}
                  onDateChange={(date) => updateFilter('dataVencimentoInicio', date)}
                  placeholder="Selecione a data"
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento - Fim</Label>
                <DatePicker
                  date={filters.dataVencimentoFim}
                  onDateChange={(date) => updateFilter('dataVencimentoFim', date)}
                  placeholder="Selecione a data"
                />
              </div>
            </div>
          </div>

          {/* Filtros de Arquivo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Filtros de Arquivo</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tamanhoMin">Tamanho Mínimo (MB)</Label>
                <Input
                  id="tamanhoMin"
                  type="number"
                  value={filters.tamanhoMin || ''}
                  onChange={(e) => updateFilter('tamanhoMin', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tamanhoMax">Tamanho Máximo (MB)</Label>
                <Input
                  id="tamanhoMax"
                  type="number"
                  value={filters.tamanhoMax || ''}
                  onChange={(e) => updateFilter('tamanhoMax', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confidencial"
                  checked={filters.confidencial || false}
                  onCheckedChange={(checked) => updateFilter('confidencial', checked as boolean)}
                />
                <Label htmlFor="confidencial">Apenas documentos confidenciais</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="comArquivo"
                  checked={filters.comArquivo || false}
                  onCheckedChange={(checked) => updateFilter('comArquivo', checked as boolean)}
                />
                <Label htmlFor="comArquivo">Apenas com arquivo anexado</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Limpar Filtros
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSearch}>
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}