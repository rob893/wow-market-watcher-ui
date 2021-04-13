import axios, { AxiosStatic } from 'axios';
import querystring from 'query-string';
import { LRUCache } from 'typescript-lru-cache';
import { AuctionTimeSeriesEntry } from '@/models/entities';
import { AuthService, authService } from './AuthService';
import { WoWMarketWatcherAuthenticatedBaseService } from './WoWMarketWatcherAuthenticatedBaseService';
import { Logger, OrderByOptions } from '@/models/core';
import { EnvironmentService, environmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';
import { AuctionTimeSeriesQueryParameters } from '@/models/queryParameters';
import { ArrayUtilities } from '@/utilities';

export class AuctionTimeSeriesService extends WoWMarketWatcherAuthenticatedBaseService {
  private readonly cache: LRUCache<string, AuctionTimeSeriesEntry[]>;

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

  public async getAuctionTimeSeries(
    queryParams: Omit<AuctionTimeSeriesQueryParameters, 'first' | 'after' | 'before' | 'last' | 'includeEdges'>,
    orderByOptions?: OrderByOptions<AuctionTimeSeriesEntry>
  ): Promise<AuctionTimeSeriesEntry[]> {
    const query = querystring.stringify(queryParams);
    const url = `wow/auctionTimeSeries?${query}`;

    const cachedEntry = this.cache.get(url);

    if (cachedEntry) {
      if (orderByOptions) {
        ArrayUtilities.orderBy(cachedEntry, orderByOptions);
      }

      return cachedEntry;
    }

    const nodes = await this.getAll<AuctionTimeSeriesEntry>(url, { first: 250 });

    this.cache.set(url, nodes, { onEntryEvicted: ({ key }) => this.logger.info(`Entry with key ${key} has expired.`) });

    if (orderByOptions) {
      ArrayUtilities.orderBy(nodes, orderByOptions);
    }

    return nodes;
  }
}

export const auctionTimeSeriesService = new AuctionTimeSeriesService(
  axios,
  authService,
  environmentService,
  new LRUCache({
    maxSize: 100,
    entryExpirationTimeInMS: 900000
  }),
  loggerService
);
