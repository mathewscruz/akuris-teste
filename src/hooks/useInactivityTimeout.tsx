import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos
const WARNING_TIMEOUT = 14 * 60 * 1000; // 14 minutos (1 min antes)

export const useInactivityTimeout = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();

  const logout = useCallback(async () => {
    await signOut();
    toast.error('Sessão encerrada por inatividade', {
      description: 'Sua sessão foi encerrada após 15 minutos de inatividade.',
    });
    navigate('/auth');
  }, [signOut, navigate]);

  const showWarning = useCallback(() => {
    toast.warning('Sessão prestes a expirar', {
      description: 'Sua sessão será encerrada em 1 minuto por inatividade.',
      duration: 60000, // 1 minuto
    });
  }, []);

  const resetTimer = useCallback(() => {
    // Limpar timers existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Criar novos timers
    warningTimeoutRef.current = setTimeout(showWarning, WARNING_TIMEOUT);
    timeoutRef.current = setTimeout(logout, INACTIVITY_TIMEOUT);
  }, [logout, showWarning]);

  useEffect(() => {
    if (!user) return;

    // Eventos que resetam o timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    // Adicionar listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Iniciar timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [user, resetTimer]);
};
