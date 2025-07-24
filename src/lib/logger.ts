// Sistema de logging estruturado para GovernAI
interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

interface LogContext {
  userId?: string;
  empresaId?: string;
  module?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private projectId = 'lnlkahtugwmkznasapfd';

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      projectId: this.projectId,
      ...context
    };
    
    return JSON.stringify(logEntry);
  }

  error(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(LOG_LEVELS.ERROR, message, context);
    console.error(formattedMessage);
    
    // Em produção, enviar para serviço de monitoramento
    if (!this.isDevelopment) {
      this.sendToMonitoring('error', message, context);
    }
  }

  warn(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(LOG_LEVELS.WARN, message, context);
    console.warn(formattedMessage);
    
    if (!this.isDevelopment) {
      this.sendToMonitoring('warn', message, context);
    }
  }

  info(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(LOG_LEVELS.INFO, message, context);
    console.info(formattedMessage);
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage(LOG_LEVELS.DEBUG, message, context);
      console.log(formattedMessage);
    }
  }

  // Logs específicos para auditoria
  audit(action: string, context: LogContext): void {
    this.info(`AUDIT: ${action}`, {
      ...context,
      type: 'audit',
      timestamp: new Date().toISOString()
    });
  }

  // Logs de performance
  performance(operation: string, duration: number, context?: LogContext): void {
    const message = `PERFORMANCE: ${operation} took ${duration}ms`;
    
    if (duration > 1000) {
      this.warn(message, { ...context, duration, type: 'performance' });
    } else {
      this.debug(message, { ...context, duration, type: 'performance' });
    }
  }

  private async sendToMonitoring(level: string, message: string, context?: LogContext): Promise<void> {
    try {
      // Implementar integração com serviço de monitoramento (Sentry, LogRocket, etc.)
      // Por enquanto, apenas armazenar localmente
      const logEntry = {
        level,
        message,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      // Em uma implementação real, enviar para API de monitoramento
      localStorage.setItem(`log_${Date.now()}`, JSON.stringify(logEntry));
      
    } catch (error) {
      console.error('Failed to send log to monitoring service:', error);
    }
  }
}

// Instância singleton do logger
export const logger = new Logger();

// Hook para logging com contexto do usuário
export const useLogger = () => {
  return logger;
};

// Utilitário para medir performance de funções
export const measurePerformance = async <T>(
  operation: string,
  fn: () => Promise<T> | T,
  context?: LogContext
): Promise<T> => {
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.performance(operation, duration, context);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`${operation} failed after ${duration}ms`, {
      ...context,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
};