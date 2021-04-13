import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { WoWMarketWatcherBaseService } from './WoWMarketWatcherBaseService';
import { AuthService } from './AuthService';
import { EnvironmentService } from './EnvironmentService';
import { HttpClientFactory, Logger } from '@/models';
import { HttpInterceptors } from '@/utilities/HttpInterceptors';

export abstract class WoWMarketWatcherAuthenticatedBaseService extends WoWMarketWatcherBaseService {
  public constructor(
    httpClientFactory: HttpClientFactory<AxiosInstance, AxiosRequestConfig>,
    authService: AuthService,
    environmentService: EnvironmentService,
    logger: Logger
  ) {
    super(httpClientFactory, environmentService, logger);

    HttpInterceptors.useAuthorizationInterceptor(this.httpClient, authService, logger);
    HttpInterceptors.useHandleUnauthorizedInterceptor(this.httpClient, authService, logger);
  }
}
