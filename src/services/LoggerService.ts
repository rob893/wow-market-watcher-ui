import { consoleLoggingProvider } from '@/utilities/LoggingProviders/ConsoleLoggingProvider';
import { Logger, LoggingProvider, LogLevel } from '../models/core';

export class LoggerService implements Logger {
  private readonly loggingProviders: LoggingProvider[];

  public constructor(loggingProviders: LoggingProvider[]) {
    this.loggingProviders = [...loggingProviders];
  }

  public debug(message?: unknown, ...optionalParams: any[]): void {
    this.log(LogLevel.Debug, message, ...optionalParams);
  }

  public info(message?: unknown, ...optionalParams: any[]): void {
    this.log(LogLevel.Info, message, ...optionalParams);
  }

  public warn(message?: unknown, ...optionalParams: any[]): void {
    this.log(LogLevel.Warn, message, ...optionalParams);
  }

  public error(message?: unknown, ...optionalParams: any[]): void {
    this.log(LogLevel.Error, message, ...optionalParams);
  }

  public group(label: string, collapsed: boolean = false): void {
    this.loggingProviders.forEach(provider => provider.group(label, collapsed));
  }

  public groupEnd(): void {
    this.loggingProviders.forEach(provider => provider.groupEnd());
  }

  private log(logLevel: LogLevel, message?: unknown, ...optionalParams: any[]): void {
    this.loggingProviders.forEach(logger => {
      switch (logLevel) {
        case LogLevel.Debug:
          logger.debug(message, ...optionalParams);
          break;
        case LogLevel.Info:
          logger.info(message, ...optionalParams);
          break;
        case LogLevel.Warn:
          logger.warn(message, ...optionalParams);
          break;
        case LogLevel.Error:
          logger.error(message, ...optionalParams);
          break;
        default:
          break;
      }
    });
  }
}

export const loggerService = new LoggerService([consoleLoggingProvider]);
