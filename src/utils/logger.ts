/**
 * Logger Utility
 * Centralized logging with different log levels and colors for better debugging
 */

type LogLevel = 'info' | 'error' | 'warn' | 'debug';

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = this.getTimestamp();
    const levelUpper = level.toUpperCase().padEnd(5);
    
    const colors: Record<LogLevel, string> = {
      info: '\x1b[36m',    // Cyan
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      debug: '\x1b[35m',   // Magenta
    };

    const reset = '\x1b[0m';
    const color = colors[level] || reset;

    return `${color}[${timestamp}] ${levelUpper}${reset} ${message}`;
  }

  info(message: string, ...args: unknown[]): void {
    console.log(this.formatMessage('info', message), ...args);
  }

  error(message: string, error?: Error | unknown, ...args: unknown[]): void {
    console.error(this.formatMessage('error', message), ...args);
    if (error instanceof Error) {
      console.error('Error Stack:', error.stack);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(this.formatMessage('warn', message), ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('debug', message), ...args);
    }
  }
}

export const logger = new Logger();

