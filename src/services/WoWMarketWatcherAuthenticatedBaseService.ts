import { AxiosStatic } from 'axios';
import { WoWMarketWatcherBaseService } from './WoWMarketWatcherBaseService';
import { AuthService } from './AuthService';
import { TypeGuards } from '@/utilities/TypeGuards';
import { EnvironmentService } from './EnvironmentService';
import { Logger } from '@/models';

export abstract class WoWMarketWatcherAuthenticatedBaseService extends WoWMarketWatcherBaseService {
  public constructor(
    axiosStatic: AxiosStatic,
    authService: AuthService,
    environmentService: EnvironmentService,
    logger: Logger
  ) {
    super(axiosStatic, environmentService, logger);

    this.httpClient.interceptors.request.use(async config => {
      const token = await authService.getAccessToken();
      config.headers.authorization = `Bearer ${token}`;

      return config;
    });

    this.httpClient.interceptors.response.use(
      response => response,
      async error => {
        if (TypeGuards.isAxiosError(error) && error.response?.status === 401) {
          const { config, response: { headers, status } = {} } = error;

          if (headers['x-token-expired'] || headers['X-Token-Expired']) {
            this.logger.debug('x-token-expired header present with 401 auth code. Attempting to refresh token...');

            const { token } = await authService.refreshAccessToken();
            config.headers.authorization = `Bearer ${token}`;

            return this.httpClient(config);
          }

          authService.unauthorizedActionAttempted.next(status);
        }

        return Promise.reject(error);
      }
    );
  }
}
