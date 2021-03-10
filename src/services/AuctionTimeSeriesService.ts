import axios from 'axios';
import querystring from 'query-string';
import { AuctionTimeSeriesEntry } from '@/models/entities';
import { authService } from './AuthService';
import { WoWMarketWatcherAuthenticatedBaseService } from './WoWMarketWatcherAuthenticatedBaseService';
import { CursorPaginatedResponse } from '@/models/core';
import { environmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';
import { AuctionTimeSeriesQueryParameters } from '@/models/queryParameters';

export class AuctionTimeSeriesService extends WoWMarketWatcherAuthenticatedBaseService {
  public async getAuctionTimeSeries(queryParams: AuctionTimeSeriesQueryParameters): Promise<AuctionTimeSeriesEntry[]> {
    const query = querystring.stringify(queryParams);

    const {
      data: { nodes }
    } = await this.httpClient.get<CursorPaginatedResponse<AuctionTimeSeriesEntry>>(`wow/auctionTimeSeries?${query}`);

    return nodes ?? [];
  }
}

export const auctionTimeSeriesService = new AuctionTimeSeriesService(
  axios,
  authService,
  environmentService,
  loggerService
);
