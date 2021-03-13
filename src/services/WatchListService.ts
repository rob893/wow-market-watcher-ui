import axios from 'axios';
import { WatchList } from '@/models/entities';
import { authService } from './AuthService';
import { WoWMarketWatcherAuthenticatedBaseService } from './WoWMarketWatcherAuthenticatedBaseService';
import { CursorPaginatedResponse } from '@/models/core';
import { environmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';

export class WatchListService extends WoWMarketWatcherAuthenticatedBaseService {
  public async getWatchListsForUser(userId: number): Promise<WatchList[]> {
    const {
      data: { nodes }
    } = await this.httpClient.get<CursorPaginatedResponse<WatchList>>(`users/${userId}/watchLists`);

    return nodes ?? [];
  }
}

export const watchListService = new WatchListService(axios, authService, environmentService, loggerService);
