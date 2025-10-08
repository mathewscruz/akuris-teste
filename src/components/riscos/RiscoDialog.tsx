
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RiscoFormWizard } from './RiscoFormWizard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RiscoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risco?: any;
  onSuccess: () => void;
}

export function RiscoDialog({ open, onOpenChange, risco, onSuccess }: RiscoDialogProps) {
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {risco ? 'Editar Risco' : 'Novo Risco'}
          </DialogTitle>
          <DialogDescription>
            {risco 
              ? 'Atualize as informações do risco conforme necessário.' 
              : 'Preencha os campos abaixo para cadastrar um novo risco. Você pode preencher na ordem que preferir.'
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <RiscoFormWizard risco={risco} onSuccess={handleSuccess} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
