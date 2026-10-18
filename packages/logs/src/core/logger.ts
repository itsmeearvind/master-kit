
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
type LogContext = Record<string, any>;

export class Logger {
  constructor(private opts: { service: string; level?: LogLevel; redact?: string[]; transport?: 'console' | 'json' } = { service: 'app' }) {}

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug','info','warn','error','fatal'];
    const min = this.opts.level || 'info';
    return levels.indexOf(level) >= levels.indexOf(min);
  }

  private redact(obj: any): any {
    if (!this.opts.redact?.length) return obj;
    const cloned = JSON.parse(JSON.stringify(obj));
    for (const key of this.opts.redact) {
      if (key in cloned) cloned[key] = '[REDACTED]';
      // deep redact for nested
      const deep = (o: any) => {
        if (!o || typeof o !== 'object') return;
        for (const k in o) {
          if (this.opts.redact!.includes(k)) o[k] = '[REDACTED]';
          else if (typeof o[k] === 'object') deep(o[k]);
        }
      };
      deep(cloned);
    }
    return cloned;
  }

  private write(level: LogLevel, message: string, context?: LogContext) {
    if (!this.shouldLog(level)) return;
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.opts.service,
      message,
      ...this.redact(context || {}),
      requestId: (global as any).__requestId,
    };
    if (this.opts.transport === 'json' || process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(entry));
    } else {
      const colors: any = { debug: '\x1b[90m', info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m', fatal: '\x1b[35m' };
      console.log(`${colors[level] || ''}[${entry.timestamp}] ${level.toUpperCase()} (${entry.service}): ${message}\x1b[0m`, context ? this.redact(context) : '');
    }
  }

  debug(msg: string, ctx?: LogContext) { this.write('debug', msg, ctx); }
  info(msg: string, ctx?: LogContext) { this.write('info', msg, ctx); }
  warn(msg: string, ctx?: LogContext) { this.write('warn', msg, ctx); }
  error(msg: string, ctx?: LogContext) { this.write('error', msg, ctx); }
  fatal(msg: string, ctx?: LogContext) { this.write('fatal', msg, ctx); }

  child(bindings: LogContext) {
    return {
      debug: (msg: string, ctx?: LogContext) => this.debug(msg, { ...bindings, ...ctx }),
      info: (msg: string, ctx?: LogContext) => this.info(msg, { ...bindings, ...ctx }),
      warn: (msg: string, ctx?: LogContext) => this.warn(msg, { ...bindings, ...ctx }),
      error: (msg: string, ctx?: LogContext) => this.error(msg, { ...bindings, ...ctx }),
      fatal: (msg: string, ctx?: LogContext) => this.fatal(msg, { ...bindings, ...ctx }),
    };
  }
}

export const createLogger = (opts: { service: string; level?: LogLevel; redact?: string[] }) => new Logger(opts);

export const requestLogger = (logger: Logger) => {
  return (req: any, res: any, next: any) => {
    const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(2, 10);
    (global as any).__requestId = requestId;
    req.requestId = requestId;
    const start = Date.now();
    logger.info('request_started', { method: req.method, url: req.url, requestId });
    res.on?.('finish', () => {
      logger.info('request_completed', { method: req.method, url: req.url, status: res.statusCode, duration: Date.now() - start, requestId });
    });
    next?.();
  };
};
