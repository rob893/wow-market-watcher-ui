import { AxiosInstance } from 'axios';
import { v4 as uuid } from 'uuid';
import { AuthService } from '@/services';
import { TypeGuards } from './TypeGuards';
import {
  AxiosRequestConfigWithMetadata,
  HttpStatusCode,
  HttpMethod,
  Logger,
  RetryOptions,
  WoWMarketWatcherServiceHeader
} from '@/models';
import { Utilities } from './Utilities';

export class HttpInterceptors {
  public static useLoggingInterceptor(httpClient: AxiosInstance, logger: Logger): void {
    httpClient.interceptors.request.use(
      (config: AxiosRequestConfigWithMetadata) => {
        if (!config.metadata) {
          config.metadata = {};
        }

        config.metadata.startTime = new Date();

        logger.info(
          `${HttpInterceptors.name}.${
            this.useLoggingInterceptor.name
          }: Sending ${config.method?.toLocaleUpperCase()} request to ${config.baseURL}/${config.url}.`
        );

        return config;
      },
      error => {
        logger.error(
          `${HttpInterceptors.name}.${this.useLoggingInterceptor.name}: Encountered error during request pipeline: ${error.message}.`,
          error
        );

        Promise.reject(error);
      }
    );

    httpClient.interceptors.response.use(
      response => {
        const {
          config: { method, url, baseURL, metadata = {} }
        }: { config: AxiosRequestConfigWithMetadata } = response;

        metadata.endTime = new Date();
        metadata.duration = (metadata.endTime.getTime() ?? 0) - (metadata.startTime?.getTime() ?? 0);

        logger.info(
          `${HttpInterceptors.name}.${this.useLoggingInterceptor.name}: Recieved response ${response.status} ${
            response.statusText
          } from ${method?.toLocaleUpperCase()} ${baseURL}/${url} in ${metadata.duration}ms.`
        );

        return response;
      },
      error => {
        if (TypeGuards.isAxiosError(error) && error.response) {
          const {
            response: { status, statusText },
            config: { method, url, baseURL, metadata = {} }
          } = error;

          metadata.endTime = new Date();
          metadata.duration = (metadata.endTime.getTime() ?? 0) - (metadata.startTime?.getTime() ?? 0);

          const message = `${HttpInterceptors.name}.${
            this.useLoggingInterceptor.name
          }: Recieved response ${status} ${statusText} from ${method?.toLocaleUpperCase()} ${baseURL}/${url} in ${
            metadata.duration
          }ms.`;

          if (status < HttpStatusCode.InternalServerError) {
            logger.warn(message);
          } else {
            logger.error(message);
          }

          return Promise.reject(error);
        }

        logger.error(
          `${HttpInterceptors.name}.${this.useLoggingInterceptor.name}: An unexpected error occurred during response pipeline: ${error.message}.`,
          error
        );

        return Promise.reject(error);
      }
    );
  }

  public static useRetryInterceptor(httpClient: AxiosInstance, options: RetryOptions, logger: Logger): void {
    httpClient.interceptors.response.use(
      response => response,
      async error => {
        const { maxRetryAttempts, enabled, delayTimeInMs } = options;

        if (!enabled) {
          logger.debug(`${HttpInterceptors.name}.${this.useRetryInterceptor.name}: Retry not enabled.`);
          return Promise.reject(error);
        }

        if (TypeGuards.isAxiosError(error)) {
          const { response, config } = error;

          const { method, url, baseURL, metadata = {} } = config;

          const operation = `${method?.toLocaleUpperCase()} ${baseURL}/${url}`;

          if (!metadata.retryNumber) {
            metadata.retryNumber = 0;
          }

          if (metadata.retryNumber && metadata.retryNumber >= maxRetryAttempts) {
            logger.info(
              `${HttpInterceptors.name}.${this.useRetryInterceptor.name}: Max retries of ${maxRetryAttempts} reached. No longer attempting retries for ${operation}.`
            );
            return Promise.reject(error);
          }

          const shouldRetry = (): boolean => {
            if (!response) {
              logger.info(
                `${HttpInterceptors.name}.${this.useRetryInterceptor.name}: Network error: ${error.message}. Request for ${operation} should be retried.`
              );
              return true;
            }

            const httpMethodsToRetry: string[] = [
              HttpMethod.Get,
              HttpMethod.Put,
              HttpMethod.Options,
              HttpMethod.Delete,
              HttpMethod.Head
            ];

            if (!method || !httpMethodsToRetry.includes(method.toUpperCase())) {
              logger.info(
                `${HttpInterceptors.name}.${
                  this.useRetryInterceptor.name
                }: Request method ${method?.toLocaleUpperCase()} is not eligible for retry. Request for ${operation} should not be retried.`
              );
              return false;
            }

            const retryStatusCodeRanges: [number, number][] = [
              // https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
              // 1xx - Retry (Informational, request still processing)
              // 2xx - Do not retry (Success)
              // 3xx - Do not retry (Redirect)
              // 4xx - Do not retry (Client errors)
              // 429 - Retry ("Too Many Requests")
              // 5xx - Retry (Server errors)
              [100, 199],
              [429, 429],
              [500, 599]
            ];

            const { status } = response;

            for (const [min, max] of retryStatusCodeRanges) {
              if (status >= min && status <= max) {
                logger.info(
                  `${HttpInterceptors.name}.${this.useRetryInterceptor.name}: Response status ${status} meets retry eligibility. Request for ${operation} should be retried.`
                );
                return true;
              }
            }

            logger.info(
              `${HttpInterceptors.name}.${this.useRetryInterceptor.name}: Request for ${operation} should not be retried.`
            );
            return false;
          };

          if (!shouldRetry()) {
            return Promise.reject(error);
          }

          metadata.retryNumber++;

          const timeToDelay = metadata.retryNumber <= 1 ? 0 : delayTimeInMs * 2 ** (metadata.retryNumber - 1);

          logger.info(
            `${HttpInterceptors.name}.${this.useRetryInterceptor.name}: Retry number ${metadata.retryNumber} of ${maxRetryAttempts} after ${timeToDelay}ms for ${operation}.`
          );

          await Utilities.wait(timeToDelay);

          return httpClient(config);
        }

        logger.warn(
          `${HttpInterceptors.name}.${this.useRetryInterceptor.name}: Unable to identify error. The request will not be retried.`,
          error
        );

        return Promise.reject(error);
      }
    );
  }

  public static useCorrelationIdInterceptor(httpClient: AxiosInstance, logger: Logger): void {
    httpClient.interceptors.request.use((config: AxiosRequestConfigWithMetadata) => {
      if (!config.metadata) {
        config.metadata = {};
      }

      if (config.headers[WoWMarketWatcherServiceHeader.CorrelationId]) {
        logger.debug(
          `${HttpInterceptors.name}.${this.useCorrelationIdInterceptor.name}: Correlation id already attached to request.`
        );

        config.metadata.correlationId = config.headers[WoWMarketWatcherServiceHeader.CorrelationId];

        return config;
      }

      config.headers[WoWMarketWatcherServiceHeader.CorrelationId] = uuid();
      config.metadata.correlationId = config.headers[WoWMarketWatcherServiceHeader.CorrelationId];

      logger.info(
        `${HttpInterceptors.name}.${this.useCorrelationIdInterceptor.name}: Correlation id generated and attached to request.`
      );

      return config;
    });
  }

  public static useAuthorizationInterceptor(httpClient: AxiosInstance, authService: AuthService, logger: Logger): void {
    httpClient.interceptors.request.use(async config => {
      logger.debug(
        `${HttpInterceptors.name}.${
          this.useAuthorizationInterceptor.name
        }: Attaching authorization token to request ${config.method?.toLocaleUpperCase()}: ${config.baseURL}/${
          config.url
        }.`
      );

      const token = await authService.getAccessToken();
      config.headers.authorization = `Bearer ${token}`;

      logger.info(
        `${HttpInterceptors.name}.${
          this.useAuthorizationInterceptor.name
        }: Authorization token attached to request ${config.method?.toLocaleUpperCase()}: ${config.baseURL}/${
          config.url
        }.`
      );

      return config;
    });
  }

  public static useGetNotFoundNullInterceptor(httpClient: AxiosInstance, logger: Logger): void {
    httpClient.interceptors.response.use(
      response => response,
      error => {
        if (
          TypeGuards.isAxiosError(error) &&
          error.config.method?.toUpperCase() === HttpMethod.Get &&
          error.response?.status === HttpStatusCode.NotFound
        ) {
          const { response } = error;
          response.data = null;

          logger.info(
            `${HttpInterceptors.name}.${this.useGetNotFoundNullInterceptor.name}: Error response eligible for null interception. Response body set to null and resolving promise.`
          );

          return Promise.resolve(response);
        }

        logger.info(
          `${HttpInterceptors.name}.${this.useGetNotFoundNullInterceptor.name}: Error response not eligible for null interception. Rejecting promise.`
        );

        return Promise.reject(error);
      }
    );
  }

  public static useHandleUnauthorizedInterceptor(
    httpClient: AxiosInstance,
    authService: AuthService,
    logger: Logger
  ): void {
    httpClient.interceptors.response.use(
      response => response,
      async error => {
        if (TypeGuards.isAxiosError(error)) {
          const { response: { headers, status } = {} } = error;
          const config: AxiosRequestConfigWithMetadata = error.config;

          if (
            status === HttpStatusCode.Unauthorized &&
            headers[WoWMarketWatcherServiceHeader.TokenExpired] &&
            !config.metadata?.refreshRetryAttempted
          ) {
            logger.debug(
              `${HttpInterceptors.name}.${this.useHandleUnauthorizedInterceptor.name}: ${WoWMarketWatcherServiceHeader.TokenExpired} header present with 401 status code. Attempting to refresh token...`
            );

            const { token } = await authService.refreshAccessToken();
            config.headers.authorization = `Bearer ${token}`;

            if (config.metadata) {
              config.metadata.refreshRetryAttempted = true;
            } else {
              config.metadata = {
                refreshRetryAttempted: true
              };
            }

            logger.info(
              `${HttpInterceptors.name}.${this.useHandleUnauthorizedInterceptor.name}: Auth token successfully refreshed. Retrying original request.`
            );

            return httpClient(config);
          }

          if (status === HttpStatusCode.Unauthorized || status === HttpStatusCode.Forbidden) {
            logger.warn(
              `${HttpInterceptors.name}.${this.useHandleUnauthorizedInterceptor.name}: Unauthorized action attempted.`
            );

            authService.unauthorizedActionAttempted.next(status);
          }
        }

        return Promise.reject(error);
      }
    );
  }
}
