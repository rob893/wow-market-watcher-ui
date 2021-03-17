import querystring from 'query-string';
import axios, { AxiosStatic } from 'axios';
import { LRUCache } from 'typescript-lru-cache';
import { CursorPaginatedResponse, Logger, OrderByOptions, Realm } from '@/models';
import { authService, AuthService } from './AuthService';
import { environmentService, EnvironmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';
import { WoWMarketWatcherAuthenticatedBaseService } from './WoWMarketWatcherAuthenticatedBaseService';
import { RealmQueryParameters } from '@/models/queryParameters';
import { ArrayUtilities } from '@/utilities';

export class RealmService extends WoWMarketWatcherAuthenticatedBaseService {
  private readonly cache: LRUCache<string, Realm | Realm[]>;

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

  public async getRealms(queryParams: RealmQueryParameters, orderByOptions?: OrderByOptions<Realm>): Promise<Realm[]> {
    queryParams.includeEdges = false;
    const query = querystring.stringify(queryParams);
    const url = `wow/realms?${query}`;

    const cachedEntry = this.cache.get(url);

    if (cachedEntry && Array.isArray(cachedEntry)) {
      if (orderByOptions) {
        ArrayUtilities.orderBy(cachedEntry, orderByOptions);
      }

      return cachedEntry;
    }

    const {
      data: { nodes = [] }
    } = await this.get<CursorPaginatedResponse<Realm>>(url);

    this.cache.set(url, nodes);

    if (orderByOptions) {
      ArrayUtilities.orderBy(nodes, orderByOptions);
    }

    return nodes;
  }

  public async getRealm(realmId: number): Promise<Realm | null> {
    const url = `wow/realms/${realmId}`;

    const cachedEntry = this.cache.get(url);

    if (cachedEntry && !Array.isArray(cachedEntry)) {
      return cachedEntry;
    }

    const { data } = await this.get<Realm | null>(url);

    if (data) {
      this.cache.set(url, data);
    }

    return data;
  }
}

export const realmService = new RealmService(
  axios,
  authService,
  environmentService,
  new LRUCache({
    maxSize: 25
  }),
  loggerService
);
