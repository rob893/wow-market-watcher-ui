import { JSONPatchDocument, Logger } from '@/models/core';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosStatic } from 'axios';
import { EnvironmentService } from './EnvironmentService';
import { HttpInterceptors } from '@/utilities/HttpInterceptors';
import { HttpMethod } from '@/models';

export abstract class WoWMarketWatcherBaseService {
  protected readonly logger: Logger;

  protected readonly httpClient: AxiosInstance;

  private readonly inProgressRequestMap: Map<string, Promise<AxiosResponse>> = new Map();

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
