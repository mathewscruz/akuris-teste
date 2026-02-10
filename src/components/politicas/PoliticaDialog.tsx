import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface PoliticaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  politica?: any;
  loading?: boolean;
}

export function PoliticaDialog({ open, onOpenChange, onSave, politica, loading }: PoliticaDialogProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('seguranca');
  const [conteudo, setConteudo] = useState('');
  const [requerAceite, setRequerAceite] = useState(true);
  const [requerQuestionario, setRequerQuestionario] = useState(false);
  const [notaMinima, setNotaMinima] = useState(70);

  useEffect(() => {
    if (politica) {
      setTitulo(politica.titulo || '');
      setDescricao(politica.descricao || '');
      setCategoria(politica.categoria || 'seguranca');
      setConteudo(politica.conteudo || '');
      setRequerAceite(politica.requer_aceite ?? true);
      setRequerQuestionario(politica.requer_questionario ?? false);
      setNotaMinima(politica.nota_minima_aprovacao || 70);
    } else {
      setTitulo(''); setDescricao(''); setCategoria('seguranca');
      setConteudo(''); setRequerAceite(true); setRequerQuestionario(false); setNotaMinima(70);
    }
  }, [politica, open]);

  const handleSave = () => {
    if (!titulo.trim()) return;
    onSave({
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      categoria,
      conteudo: conteudo.trim() || null,
      requer_aceite: requerAceite,
      requer_questionario: requerQuestionario,
      nota_minima_aprovacao: notaMinima,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{politica ? 'Editar Política' : 'Nova Política'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Nome da política" />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Breve descrição" rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="seguranca">Segurança da Informação</SelectItem>
                <SelectItem value="privacidade">Privacidade e Proteção de Dados</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="rh">Recursos Humanos</SelectItem>
                <SelectItem value="ti">Tecnologia da Informação</SelectItem>
                <SelectItem value="operacional">Operacional</SelectItem>
                <SelectItem value="outra">Outra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Conteúdo da Política</Label>
            <Textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} placeholder="Texto completo da política..." rows={8} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Requer Aceite</Label>
              <p className="text-xs text-muted-foreground">Usuários precisarão confirmar leitura</p>
            </div>
            <Switch checked={requerAceite} onCheckedChange={setRequerAceite} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Questionário de Validação</Label>
              <p className="text-xs text-muted-foreground">Perguntas após leitura para comprovar compreensão</p>
            </div>
            <Switch checked={requerQuestionario} onCheckedChange={setRequerQuestionario} />
          </div>
          {requerQuestionario && (
            <div className="space-y-2">
              <Label>Nota Mínima para Aprovação (%)</Label>
              <Input type="number" min={0} max={100} value={notaMinima} onChange={(e) => setNotaMinima(Number(e.target.value))} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!titulo.trim() || loading}>
            {loading ? 'Salvando...' : politica ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
