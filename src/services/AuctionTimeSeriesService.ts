import querystring from 'query-string';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { cloneDeep } from 'lodash';
import { LRUCache } from 'typescript-lru-cache';
import { AuctionTimeSeriesEntry } from '@/models/entities';
import { CursorPaginatedResponse, HttpClientFactory, Logger, OrderByOptions } from '@/models/core';
import { AuctionTimeSeriesQueryParameters } from '@/models/queryParameters';
import { ArrayUtilities } from '@/utilities';
import { AuthService, authService } from './AuthService';
import { WoWMarketWatcherAuthenticatedBaseService } from './WoWMarketWatcherAuthenticatedBaseService';
import { EnvironmentService, environmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';

export class AuctionTimeSeriesService extends WoWMarketWatcherAuthenticatedBaseService {
  private readonly cache: LRUCache<string, CursorPaginatedResponse<AuctionTimeSeriesEntry>>;

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

  public async getAuctionTimeSeriesPage(
    queryParams: AuctionTimeSeriesQueryParameters
  ): Promise<CursorPaginatedResponse<AuctionTimeSeriesEntry>> {
    const query = querystring.stringify(queryParams);
    const url = `wow/auctionTimeSeries?${query}`;

    const cachedEntry = this.cache.get(url);

    if (cachedEntry) {
      return cachedEntry;
    }

    const { data } = await this.get<CursorPaginatedResponse<AuctionTimeSeriesEntry>>(url);

    this.cache.set(url, data, {
      onEntryEvicted: ({ key }) => this.logger.info(`Entry with key ${key} has expired.`)
    });

    return data;
  }

  public async getAuctionTimeSeries(
    queryParams: Omit<AuctionTimeSeriesQueryParameters, 'first' | 'after' | 'before' | 'last' | 'includeEdges'>,
    orderByOptions?: OrderByOptions<AuctionTimeSeriesEntry>
  ): Promise<AuctionTimeSeriesEntry[]> {
    const nodes = await this.getAllPages<AuctionTimeSeriesEntry, AuctionTimeSeriesQueryParameters>(
      params => this.getAuctionTimeSeriesPage(params),
      { ...queryParams, first: 250 }
    );

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
    entryExpirationTimeInMS: 900000,
    clone: true,
    cloneFn: cloneDeep
  }),
  loggerService
);
