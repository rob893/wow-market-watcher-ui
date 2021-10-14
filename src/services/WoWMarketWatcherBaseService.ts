import { CursorPaginatedResponse, HttpClientFactory, JSONPatchDocument, Logger } from '@/models/core';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { EnvironmentService } from './EnvironmentService';
import { HttpInterceptors } from '@/utilities/HttpInterceptors';
import { HttpMethod } from '@/models';
import { CursorPaginationParameters } from '@/models/queryParameters';
import { List } from 'typescript-extended-linq';

export abstract class WoWMarketWatcherBaseService {
  protected readonly logger: Logger;

  protected readonly httpClient: AxiosInstance;

  private readonly inProgressRequestMap: Map<string, Promise<AxiosResponse<any, any>>> = new Map();

  public constructor(
    httpClientFactory: HttpClientFactory<AxiosInstance, AxiosRequestConfig>,
    environmentService: EnvironmentService,
    logger: Logger
  ) {
    const { wowMarketWatcherBaseUrl: baseURL, retryOptions } = environmentService;

    if (!baseURL) {
      throw new Error('No wowMarketWatcherBaseUrl variable set.');
    }

    this.logger = logger;
    this.httpClient = httpClientFactory.create({ baseURL });

    HttpInterceptors.useLoggingInterceptor(this.httpClient, logger);
    HttpInterceptors.useCorrelationIdInterceptor(this.httpClient, logger);
    HttpInterceptors.useGetNotFoundNullInterceptor(this.httpClient, logger);
    HttpInterceptors.useRetryInterceptor(this.httpClient, retryOptions, logger);
  }

  protected async getAllPages<T = unknown, TParams extends CursorPaginationParameters = CursorPaginationParameters>(
    getPage: (queryParams: TParams) => Promise<CursorPaginatedResponse<T>>,
    queryParams: Omit<TParams, 'after' | 'before' | 'last' | 'includeEdges'>
  ): Promise<List<T>> {
    const params = { ...queryParams } as TParams;
    params.first ??= 100;
    params.includeEdges = false;

    let results: T[] = [];

    const { nodes = [], pageInfo } = await getPage(params);

    results = [...results, ...nodes];
    let prevPage = pageInfo;

    while (prevPage.hasNextPage && prevPage.endCursor) {
      params.after = prevPage.endCursor;
      const { nodes: nextNodes = [], pageInfo: nextPageInfo } = await getPage(params);
      prevPage = nextPageInfo;
      results = [...results, ...nextNodes];
    }

    return new List(results);
  }

  protected async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
    allowSimultaneousDuplicates: boolean = false
  ): Promise<AxiosResponse<T>> {
    const key = this.getInProgressCacheKey(HttpMethod.Get, url);
    let inProgress = this.inProgressRequestMap.get(key);

    if (!inProgress || allowSimultaneousDuplicates) {
      inProgress = this.httpClient.get<T>(url, config);
      this.inProgressRequestMap.set(key, inProgress);
    } else {
      this.logger.debug(
        `${WoWMarketWatcherBaseService.name}.${this.get.name}: Returning in progess promise for ${key}.`
      );
    }

    try {
      return await inProgress;
    } finally {
      this.inProgressRequestMap.delete(key);
    }
  }

  protected async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
    allowSimultaneousDuplicates: boolean = false
  ): Promise<AxiosResponse<T>> {
    const key = this.getInProgressCacheKey(HttpMethod.Delete, url);
    let inProgress = this.inProgressRequestMap.get(key);

    if (!inProgress || allowSimultaneousDuplicates) {
      inProgress = this.httpClient.delete<T>(url, config);
      this.inProgressRequestMap.set(key, inProgress);
    } else {
      this.logger.debug(
        `${WoWMarketWatcherBaseService.name}.${this.get.name}: Returning in progess promise for ${key}.`
      );
    }

    try {
      return await inProgress;
    } finally {
      this.inProgressRequestMap.delete(key);
    }
  }

  protected async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
    allowSimultaneousDuplicates: boolean = false
  ): Promise<AxiosResponse<T>> {
    const key = this.getInProgressCacheKey(HttpMethod.Post, url);
    let inProgress = this.inProgressRequestMap.get(key);

    if (!inProgress || allowSimultaneousDuplicates) {
      inProgress = this.httpClient.post<T>(url, data, config);
      this.inProgressRequestMap.set(key, inProgress);
    } else {
      this.logger.debug(
        `${WoWMarketWatcherBaseService.name}.${this.get.name}: Returning in progess promise for ${key}.`
      );
    }

    try {
      return await inProgress;
    } finally {
      this.inProgressRequestMap.delete(key);
    }
  }

  protected async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
    allowSimultaneousDuplicates: boolean = false
  ): Promise<AxiosResponse<T>> {
    const key = this.getInProgressCacheKey(HttpMethod.Put, url);
    let inProgress = this.inProgressRequestMap.get(key);

    if (!inProgress || allowSimultaneousDuplicates) {
      inProgress = this.httpClient.put<T>(url, data, config);
      this.inProgressRequestMap.set(key, inProgress);
    } else {
      this.logger.debug(
        `${WoWMarketWatcherBaseService.name}.${this.get.name}: Returning in progess promise for ${key}.`
      );
    }

    try {
      return await inProgress;
    } finally {
      this.inProgressRequestMap.delete(key);
    }
  }

  protected async patch<T = unknown>(
    url: string,
    data?: JSONPatchDocument[] | unknown,
    config?: AxiosRequestConfig,
    allowSimultaneousDuplicates: boolean = false
  ): Promise<AxiosResponse<T>> {
    const key = this.getInProgressCacheKey(HttpMethod.Patch, url);
    let inProgress = this.inProgressRequestMap.get(key);

    if (!inProgress || allowSimultaneousDuplicates) {
      inProgress = this.httpClient.patch<T>(url, data, config);
      this.inProgressRequestMap.set(key, inProgress);
    } else {
      this.logger.debug(
        `${WoWMarketWatcherBaseService.name}.${this.get.name}: Returning in progess promise for ${key}.`
      );
    }

    try {
      return await inProgress;
    } finally {
      this.inProgressRequestMap.delete(key);
    }
  }

  private getInProgressCacheKey(method: HttpMethod, url: string): string {
    return `${method}:${url}`;
  }
}
