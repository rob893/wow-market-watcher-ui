import querystring from 'query-string';
import axios, { AxiosStatic } from 'axios';
import { cloneDeep } from 'lodash';
import { LRUCache } from 'typescript-lru-cache';
import { ConnectedRealm, CursorPaginatedResponse, Logger, OrderByOptions, Realm } from '@/models';
import { authService, AuthService } from './AuthService';
import { environmentService, EnvironmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';
import { WoWMarketWatcherAuthenticatedBaseService } from './WoWMarketWatcherAuthenticatedBaseService';
import { CursorPaginationParameters, RealmQueryParameters } from '@/models/queryParameters';
import { ArrayUtilities, TypeGuards } from '@/utilities';

export class RealmService extends WoWMarketWatcherAuthenticatedBaseService {
  private readonly cache: LRUCache<string, Realm | Realm[] | ConnectedRealm | ConnectedRealm[]>;

  public constructor(
    axiosStatic: AxiosStatic,
    authService: AuthService,
    environmentService: EnvironmentService,
    cache: LRUCache,
    logger: Logger
  ) {
    super(axiosStatic, authService, environmentService, logger);
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
        const clone = cloneDeep(cachedEntry);

        if (orderByOptions) {
          ArrayUtilities.orderBy(clone, orderByOptions);
        }

        return clone;
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

    const clone = cloneDeep(nodes);

    if (orderByOptions) {
      ArrayUtilities.orderBy(clone, orderByOptions);
    }

    return clone;
  }

  public async getRealm(realmId: number): Promise<Realm | null> {
    const cacheKey = this.getRealmCacheKey(realmId);

    const cachedEntry = this.cache.get(cacheKey);

    if (cachedEntry) {
      if (TypeGuards.isRealm(cachedEntry)) {
        return cloneDeep(cachedEntry);
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
        const clone = cloneDeep(cachedEntry);

        if (orderByOptions) {
          ArrayUtilities.orderBy(clone, orderByOptions);
        }

        return clone;
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

    const clone = cloneDeep(nodes);

    if (orderByOptions) {
      ArrayUtilities.orderBy(clone, orderByOptions);
    }

    return clone;
  }

  public async getConnectedRealm(realmId: number): Promise<ConnectedRealm | null> {
    const cacheKey = this.getConnectedRealmCacheKey(realmId);

    const cachedEntry = this.cache.get(cacheKey);

    if (cachedEntry) {
      if (TypeGuards.isConnectedRealm(cachedEntry)) {
        return cloneDeep(cachedEntry);
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
    maxSize: 500
  }),
  loggerService
);
