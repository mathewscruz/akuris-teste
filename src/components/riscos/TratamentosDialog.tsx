import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TratamentosList } from './TratamentosList';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TratamentosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risco: any;
  onSuccess: () => void;
}

export function TratamentosDialog({ open, onOpenChange, risco, onSuccess }: TratamentosDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            Tratamentos do Risco: {risco?.nome}
          </DialogTitle>
          <DialogDescription>
            Gerencie os tratamentos associados a este risco. Adicione, edite ou remova ações de mitigação.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <TratamentosList 
            riscoId={risco?.id} 
            riscoNome={risco?.nome}
            riscoData={{
              nome: risco?.nome,
              descricao: risco?.descricao || '',
              categoria: risco?.categoria?.nome,
              nivel_risco_inicial: risco?.nivel_risco_inicial
            }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
