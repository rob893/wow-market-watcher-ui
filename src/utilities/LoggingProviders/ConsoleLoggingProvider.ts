import { LoggingProvider, LogLevel } from '@/models';
import { environmentService, EnvironmentService } from '@/services/EnvironmentService';

export class ConsoleLoggingProvider implements LoggingProvider {
  private readonly logLevel: LogLevel;

  public constructor({
    loggingOptions: {
      console: { logLevel }
    }
  }: EnvironmentService) {
    this.logLevel = logLevel;
  }

  public debug(...args: any[]): void {
    this.log(LogLevel.Debug, ...args);
  }

  public info(...args: any[]): void {
    this.log(LogLevel.Info, ...args);
  }

  public warn(...args: any[]): void {
    this.log(LogLevel.Warn, ...args);
  }

  public error(...args: any[]): void {
    this.log(LogLevel.Error, ...args);
  }

  private log(logLevel: LogLevel, ...args: any[]): void {
    if (this.logLevel <= logLevel) {
      switch (logLevel) {
        case LogLevel.Debug:
          console.debug(...args);
          break;
        case LogLevel.Info:
          console.info(...args);
          break;
        case LogLevel.Warn:
          console.warn(...args);
          break;
        case LogLevel.Error:
          console.error(...args);
          break;
        default:
          break;
      }
    }
  }
}

export const consoleLoggingProvider = new ConsoleLoggingProvider(environmentService);
