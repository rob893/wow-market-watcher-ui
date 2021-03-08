import { Logger } from '@/models/core';
import { AxiosInstance, AxiosStatic } from 'axios';
import { EnvironmentService } from './EnvironmentService';
import { HttpInterceptors } from '@/utilities/HttpInterceptors';

export abstract class WoWMarketWatcherBaseService {
  protected readonly logger: Logger;

  protected readonly httpClient: AxiosInstance;

  public constructor(axiosStatic: AxiosStatic, environmentService: EnvironmentService, logger: Logger) {
    const { wowMarketWatcherBaseUrl: baseURL, retryOptions } = environmentService;

    if (!baseURL) {
      throw new Error('No wowMarketWatcherBaseUrl variable set.');
    }

    this.logger = logger;
    this.httpClient = axiosStatic.create({ baseURL });

    HttpInterceptors.useLoggingInterceptor(this.httpClient, logger);
    HttpInterceptors.useCorrelationIdInterceptor(this.httpClient, logger);
    HttpInterceptors.useGetNotFoundNullInterceptor(this.httpClient, logger);
    HttpInterceptors.useRetryInterceptor(this.httpClient, retryOptions, logger);
  }
}
