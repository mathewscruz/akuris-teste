import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TestesList from "./TestesList";

interface TestesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  controleId?: string;
  controleNome?: string;
}

export default function TestesDialog({ 
  open, 
  onOpenChange, 
  controleId, 
  controleNome 
}: TestesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Testes do Controle: {controleNome}
          </DialogTitle>
        </DialogHeader>
        {controleId && controleNome && (
          <TestesList 
            controleId={controleId} 
            controleNome={controleNome} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
