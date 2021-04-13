import querystring from 'query-string';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { cloneDeep } from 'lodash';
import { LRUCache } from 'typescript-lru-cache';
import { ConnectedRealm, CursorPaginatedResponse, HttpClientFactory, Logger, OrderByOptions, Realm } from '@/models';
import { authService, AuthService } from './AuthService';
import { environmentService, EnvironmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';
import { WoWMarketWatcherAuthenticatedBaseService } from './WoWMarketWatcherAuthenticatedBaseService';
import { CursorPaginationParameters, RealmQueryParameters } from '@/models/queryParameters';
import { ArrayUtilities, TypeGuards } from '@/utilities';

export class RealmService extends WoWMarketWatcherAuthenticatedBaseService {
  private readonly cache: LRUCache<string, Realm | Realm[] | ConnectedRealm | ConnectedRealm[]>;

  public constructor(
    httpClientFactory: HttpClientFactory<AxiosInstance, AxiosRequestConfig>,
    authService: AuthService,
    environmentService: EnvironmentService,
    cache: LRUCache,
    logger: Logger
  ) {
    super(httpClientFactory, authService, environmentService, logger);
    this.cache = cache;
  }

  public async getRealms(
    queryParams: RealmQueryParameters = {},
    orderByOptions?: OrderByOptions<Realm>
  ): Promise<Realm[]> {
    queryParams.includeEdges = false;
    const query = querystring.stringify(queryParams);
    const url = `wow/realms?${query}`;

    const cachedEntry = this.cache.get(url);

    if (cachedEntry) {
      if (TypeGuards.isRealmArray(cachedEntry)) {
        if (orderByOptions) {
          ArrayUtilities.orderBy(cachedEntry, orderByOptions);
        }

        return cachedEntry;
      } else {
        this.cache.delete(url);
      }
    }

    const {
      data: { nodes = [] }
    } = await this.get<CursorPaginatedResponse<Realm>>(url);

    this.cache.set(url, nodes);

    for (const realm of nodes) {
      this.cache.set(this.getRealmCacheKey(realm.id), realm);
    }

    if (orderByOptions) {
      ArrayUtilities.orderBy(nodes, orderByOptions);
    }

    return nodes;
  }

  public async getRealm(realmId: number): Promise<Realm | null> {
    const cacheKey = this.getRealmCacheKey(realmId);

    const cachedEntry = this.cache.get(cacheKey);

    if (cachedEntry) {
      if (TypeGuards.isRealm(cachedEntry)) {
        return cachedEntry;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    const { data } = await this.get<Realm | null>(`wow/realms/${realmId}`);

    if (data) {
      this.cache.set(cacheKey, data);
    }

    return data;
  }

  public async getConnectedRealms(
    queryParams: CursorPaginationParameters = {},
    orderByOptions?: OrderByOptions<ConnectedRealm>
  ): Promise<ConnectedRealm[]> {
    queryParams.includeEdges = false;
    const query = querystring.stringify(queryParams);
    const url = `wow/connectedRealms?${query}`;

    const cachedEntry = this.cache.get(url);

    if (cachedEntry) {
      if (TypeGuards.isConnectedRealmArray(cachedEntry)) {
        if (orderByOptions) {
          ArrayUtilities.orderBy(cachedEntry, orderByOptions);
        }

        return cachedEntry;
      } else {
        this.cache.delete(url);
      }
    }

    const {
      data: { nodes = [] }
    } = await this.get<CursorPaginatedResponse<ConnectedRealm>>(url);

    this.cache.set(url, nodes);

    for (const connectedRealm of nodes) {
      this.cache.set(this.getConnectedRealmCacheKey(connectedRealm.id), connectedRealm);

      for (const realm of connectedRealm.realms) {
        this.cache.set(this.getRealmCacheKey(realm.id), realm);
      }
    }

    if (orderByOptions) {
      ArrayUtilities.orderBy(nodes, orderByOptions);
    }

    return nodes;
  }

  public async getConnectedRealm(realmId: number): Promise<ConnectedRealm | null> {
    const cacheKey = this.getConnectedRealmCacheKey(realmId);

    const cachedEntry = this.cache.get(cacheKey);

    if (cachedEntry) {
      if (TypeGuards.isConnectedRealm(cachedEntry)) {
        return cachedEntry;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    const { data } = await this.get<ConnectedRealm | null>(`wow/connectedRealms/${realmId}`);

    if (data) {
      this.cache.set(cacheKey, data);
    }

    return data;
  }

  private getRealmCacheKey(realmId: number): string {
    return `realm:${realmId}`;
  }

  private getConnectedRealmCacheKey(connectedRealmId: number): string {
    return `connectedRealm:${connectedRealmId}`;
  }
}

export const realmService = new RealmService(
  axios,
  authService,
  environmentService,
  new LRUCache({
    maxSize: 500,
    clone: true,
    cloneFn: cloneDeep
  }),
  loggerService
);
