import querystring from 'query-string';
import axios, { AxiosStatic } from 'axios';
import { LRUCache } from 'typescript-lru-cache';
import { CursorPaginatedResponse, Logger, OrderByOptions, WoWItem } from '@/models';
import { authService, AuthService } from './AuthService';
import { environmentService, EnvironmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';
import { WoWMarketWatcherAuthenticatedBaseService } from './WoWMarketWatcherAuthenticatedBaseService';
import { WoWItemQueryParameters } from '@/models/queryParameters';
import { ArrayUtilities } from '@/utilities';

export class WoWItemService extends WoWMarketWatcherAuthenticatedBaseService {
  private readonly cache: LRUCache<string, WoWItem | WoWItem[]>;

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

  public async getItems(
    queryParams: WoWItemQueryParameters,
    orderByOptions?: OrderByOptions<WoWItem>
  ): Promise<WoWItem[]> {
    queryParams.includeEdges = false;
    const query = querystring.stringify(queryParams);
    const url = `wow/items?${query}`;

    const cachedEntry = this.cache.get(url);

    if (cachedEntry && Array.isArray(cachedEntry)) {
      if (orderByOptions) {
        ArrayUtilities.orderBy(cachedEntry, orderByOptions);
      }

      return cachedEntry;
    }

    const {
      data: { nodes = [] }
    } = await this.httpClient.get<CursorPaginatedResponse<WoWItem>>(url);

    this.cache.set(url, nodes);

    if (orderByOptions) {
      ArrayUtilities.orderBy(nodes, orderByOptions);
    }

    return nodes;
  }

  public async getItem(itemId: number): Promise<WoWItem | null> {
    const url = `wow/items/${itemId}`;

    const cachedEntry = this.cache.get(url);

    if (cachedEntry && !Array.isArray(cachedEntry)) {
      return cachedEntry;
    }

    const { data } = await this.httpClient.get<WoWItem | null>(url);

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
    maxSize: 100
  }),
  loggerService
);
