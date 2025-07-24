import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Framework } from "./types";

interface FrameworkVisibilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frameworks: Framework[];
  visibleFrameworks: Set<string>;
  onSave: (visibleFrameworks: Set<string>) => void;
}

export const FrameworkVisibilityDialog: React.FC<FrameworkVisibilityDialogProps> = ({
  open,
  onOpenChange,
  frameworks,
  visibleFrameworks,
  onSave
}) => {
  const [localVisible, setLocalVisible] = useState<Set<string>>(new Set(visibleFrameworks));

  useEffect(() => {
    if (open) {
      setLocalVisible(new Set(visibleFrameworks));
    }
  }, [open, visibleFrameworks]);

  const handleToggle = (frameworkId: string, checked: boolean) => {
    const newVisible = new Set(localVisible);
    if (checked) {
      newVisible.add(frameworkId);
    } else {
      newVisible.delete(frameworkId);
    }
    setLocalVisible(newVisible);
  };

  const handleSelectAll = () => {
    const allIds = new Set(frameworks.map(f => f.id));
    setLocalVisible(allIds);
  };

  const handleDeselectAll = () => {
    setLocalVisible(new Set());
  };

  const handleSave = () => {
    onSave(localVisible);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Visibilidade dos Frameworks</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
            >
              Selecionar Todos
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeselectAll}
            >
              Desmarcar Todos
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {frameworks.map((framework) => (
                  <div key={framework.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={framework.id}
                      checked={localVisible.has(framework.id)}
                      onCheckedChange={(checked) => 
                        handleToggle(framework.id, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={framework.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {framework.nome} v{framework.versao}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Configuração
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};