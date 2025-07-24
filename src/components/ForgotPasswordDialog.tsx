import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, digite seu e-mail');
      return;
    }

    setIsLoading(true);

    try {
      // Buscar o usuário pelo email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, nome, email')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        toast.error('E-mail não encontrado no sistema');
        return;
      }

      // Chamar a edge function para enviar o reset
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: { userId: profile.user_id }
      });

      if (error) {
        console.error('Erro ao enviar reset:', error);
        toast.error('Erro ao enviar e-mail de recuperação');
        return;
      }

      toast.success('E-mail de recuperação enviado com sucesso!');
      setEmail('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error('Erro interno. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Recuperar Senha
          </DialogTitle>
          <DialogDescription>
            Digite seu e-mail para receber instruções de recuperação de senha.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}