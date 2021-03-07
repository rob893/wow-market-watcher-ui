import { TypeGuards } from '@/utilities/TypeGuards';
import { HttpVerb, Logger } from '@/models/core';
import { AxiosInstance, AxiosStatic } from 'axios';
import { EnvironmentService } from './EnvironmentService';

export abstract class WoWMarketWatcherBaseService {
  protected readonly logger: Logger;

  protected readonly httpClient: AxiosInstance;

  public constructor(axiosStatic: AxiosStatic, environmentService: EnvironmentService, logger: Logger) {
    const { wowMarketWatcherBaseUrl: baseURL } = environmentService;

    if (!baseURL) {
      throw new Error('No wowMarketWatcherBaseUrl variable set.');
    }

    this.logger = logger;
    this.httpClient = axiosStatic.create({ baseURL });
    this.httpClient.interceptors.response.use(
      response => response,
      error => {
        if (
          TypeGuards.isAxiosError(error) &&
          error.config.method?.toUpperCase() === HttpVerb.Get &&
          error.response?.status === 404
        ) {
          const { response } = error;
          response.data = null;

          return Promise.resolve(response);
        }

        return Promise.reject(error);
      }
    );
  }
}
