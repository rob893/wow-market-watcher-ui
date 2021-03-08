import { AxiosStatic } from 'axios';
import { WoWMarketWatcherBaseService } from './WoWMarketWatcherBaseService';
import { AuthService } from './AuthService';
import { EnvironmentService } from './EnvironmentService';
import { Logger } from '@/models';
import { HttpInterceptors } from '@/utilities/HttpInterceptors';

export abstract class WoWMarketWatcherAuthenticatedBaseService extends WoWMarketWatcherBaseService {
  public constructor(
    axiosStatic: AxiosStatic,
    authService: AuthService,
    environmentService: EnvironmentService,
    logger: Logger
  ) {
    super(axiosStatic, environmentService, logger);

    HttpInterceptors.useAuthorizationInterceptor(this.httpClient, authService, logger);
    HttpInterceptors.useHandleUnauthorizedInterceptor(this.httpClient, authService, logger);
  }
}
