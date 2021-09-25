import querystring from 'query-string';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { LRUCache } from 'typescript-lru-cache';
import { CursorPaginatedResponse, HttpClientFactory, Logger, WoWItem } from '@/models';
import { authService, AuthService } from './AuthService';
import { environmentService, EnvironmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';
import { WoWMarketWatcherAuthenticatedBaseService } from './WoWMarketWatcherAuthenticatedBaseService';
import { WoWItemQueryParameters } from '@/models/queryParameters';
import { cloneDeep } from 'lodash';
import { List } from 'typescript-extended-linq';

export class WoWItemService extends WoWMarketWatcherAuthenticatedBaseService {
  private readonly cache: LRUCache<string, WoWItem | WoWItem[]>;

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

  public async getItems(queryParams: WoWItemQueryParameters): Promise<List<WoWItem>> {
    queryParams.includeEdges = false;
    const query = querystring.stringify(queryParams);
    const url = `wow/items?${query}`;

    const cachedEntry = this.cache.get(url);

    if (cachedEntry && Array.isArray(cachedEntry)) {
      return new List(cachedEntry);
    }

    const {
      data: { nodes = [] }
    } = await this.get<CursorPaginatedResponse<WoWItem>>(url);

    this.cache.set(url, nodes);

    return new List(nodes);
  }

  public async getItem(itemId: number): Promise<WoWItem | null> {
    const url = `wow/items/${itemId}`;

    const cachedEntry = this.cache.get(url);

    if (cachedEntry && !Array.isArray(cachedEntry)) {
      return cachedEntry;
    }

    const { data } = await this.get<WoWItem | null>(url);

    if (data) {
      this.cache.set(url, data);
    }

    return data;
  }
}

export const wowItemService = new WoWItemService(
  axios,
  authService,
  environmentService,
  new LRUCache({
    maxSize: 100,
    clone: true,
    cloneFn: cloneDeep
  }),
  loggerService
);
