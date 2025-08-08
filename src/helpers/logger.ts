enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const createLogEntry = (level: LogLevel, message: string, error?: Error, context?: LogContext): LogEntry => {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
  };

  if (context) {
    logEntry.context = context;
  }

  if (error) {
    logEntry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return logEntry;
};

const error = (message: string, error?: Error, context?: LogContext): void => {
  console.error(JSON.stringify(createLogEntry(LogLevel.ERROR, message, error, context)));
};

const warn = (message: string, context?: LogContext): void => {
  console.warn(JSON.stringify(createLogEntry(LogLevel.WARN, message, undefined, context)));
};

const info = (message: string, context?: LogContext): void => {
  console.log(JSON.stringify(createLogEntry(LogLevel.INFO, message, undefined, context)));
};

const debug = (message: string, context?: LogContext): void => {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
    console.log(JSON.stringify(createLogEntry(LogLevel.DEBUG, message, undefined, context)));
  }
};

export const logger = {
  error,
  warn,
  info,
  debug,
};

export type { LogContext };
