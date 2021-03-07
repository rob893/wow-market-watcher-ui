import { developmentEnvironment } from '@/environments/environment.development';
import { productionEnvironment } from '@/environments/environment.production';
import { Environment, EnvironmentMode, LoggingOptions, RetryOptions } from '../models/core';

export class EnvironmentService implements Environment {
  private readonly environment: Environment;

  public constructor(environment: Environment) {
    this.environment = environment;
  }

  public get production(): boolean {
    return this.environment.production;
  }

  public get loggingOptions(): LoggingOptions {
    return { ...this.environment.loggingOptions };
  }

  public get localStoragePrefix(): string {
    return this.environment.localStoragePrefix;
  }

  public get appTitle(): string {
    return this.environment.appTitle;
  }

  public get env(): EnvironmentMode {
    return this.environment.env;
  }

  public get wowMarketWatcherBaseUrl(): string {
    return this.environment.wowMarketWatcherBaseUrl;
  }

  public get googleAuthClientId(): string {
    return this.environment.googleAuthClientId;
  }

  public get retryOptions(): RetryOptions {
    return { ...this.environment.retryOptions };
  }
}

const env = process.env.NODE_ENV === EnvironmentMode.Production ? productionEnvironment : developmentEnvironment;

export const environmentService = new EnvironmentService(env);
