import axios from 'axios';
import querystring from 'query-string';
import { AuctionTimeSeriesEntry } from '@/models/entities';
import { authService } from './AuthService';
import { WoWMarketWatcherAuthenticatedBaseService } from './WoWMarketWatcherAuthenticatedBaseService';
import { CursorPaginatedResponse, OrderByOptions } from '@/models/core';
import { environmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';
import { AuctionTimeSeriesQueryParameters } from '@/models/queryParameters';
import { ArrayUtilities } from '@/utilities';

export class AuctionTimeSeriesService extends WoWMarketWatcherAuthenticatedBaseService {
  public async getAuctionTimeSeries(
    queryParams: AuctionTimeSeriesQueryParameters,
    orderByOptions?: OrderByOptions<AuctionTimeSeriesEntry>
  ): Promise<AuctionTimeSeriesEntry[]> {
    queryParams.includeEdges = false;
    const query = querystring.stringify(queryParams);

    const {
      data: { nodes }
    } = await this.httpClient.get<CursorPaginatedResponse<AuctionTimeSeriesEntry>>(`wow/auctionTimeSeries?${query}`);

    // if (orderByOptions && nodes) {
    //   const { orderBy, comparer, direction } = orderByOptions;

    //   if (comparer) {
    //     nodes.sort((a, b) => comparer(a[orderBy], b[orderBy]));
    //   } else {
    //     nodes.sort((a, b) => {
    //       if (direction === 'Ascending') {
    //         return b[orderBy] - a[orderBy];
    //       }
    //     })
    //   }
    // }

    return ArrayUtilities.shuffle(nodes ?? []);
  }
}

export const auctionTimeSeriesService = new AuctionTimeSeriesService(
  axios,
  authService,
  environmentService,
  loggerService
);
