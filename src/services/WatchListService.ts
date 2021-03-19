import axios, { AxiosStatic } from 'axios';
import { WatchList } from '@/models/entities';
import { AuthService, authService } from './AuthService';
import { WoWMarketWatcherAuthenticatedBaseService } from './WoWMarketWatcherAuthenticatedBaseService';
import { CursorPaginatedResponse, Logger } from '@/models/core';
import { EnvironmentService, environmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';
import { AddItemToWatchListRequest, CreateWatchListForUserRequest, UpdateWatchListRequest } from '@/models';
import { LRUCache } from 'typescript-lru-cache';
import { cloneDeep } from 'lodash';

export class WatchListService extends WoWMarketWatcherAuthenticatedBaseService {
  private readonly cache: LRUCache<string, WatchList | WatchList[]>;

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

  public async getWatchListsForUser(userId: number): Promise<WatchList[]> {
    const cacheKey = this.getUserWatchListsCacheKey(userId);
    const cachedLists = this.cache.get(cacheKey);

    if (cachedLists) {
      if (Array.isArray(cachedLists)) {
        return cachedLists;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    const {
      data: { nodes = [] }
    } = await this.get<CursorPaginatedResponse<WatchList>>(`users/${userId}/watchLists`);

    this.cache.set(cacheKey, nodes);

    for (const list of nodes) {
      this.cache.set(this.getWatchListCacheKey(list.id), list);
    }

    return nodes;
  }

  public async getWatchListForUser(userId: number, watchListId: number): Promise<WatchList | null> {
    const cacheKey = this.getWatchListCacheKey(watchListId);
    const cachedList = this.cache.get(cacheKey);

    if (cachedList) {
      if (Array.isArray(cachedList)) {
        this.cache.delete(cacheKey);
      } else {
        return cachedList;
      }
    }

    const { data } = await this.get<WatchList | null>(`users/${userId}/watchLists/${watchListId}`);

    if (data) {
      this.cache.set(cacheKey, data);
    }

    return data;
  }

  public async createWatchListForUser(
    userId: number,
    createWatchListRequest: CreateWatchListForUserRequest
  ): Promise<WatchList> {
    const { data } = await this.post<WatchList>(`users/${userId}/watchLists`, createWatchListRequest);

    const newWatchListCacheKey = this.getWatchListCacheKey(data.id);
    const userWatchListsCacheKey = this.getUserWatchListsCacheKey(userId);

    const cachedUserWatchLists = this.cache.get(userWatchListsCacheKey);

    if (!Array.isArray(cachedUserWatchLists)) {
      this.cache.delete(userWatchListsCacheKey);
    }

    this.cache.set(newWatchListCacheKey, data);
    this.cache.set(userWatchListsCacheKey, [
      ...(Array.isArray(cachedUserWatchLists) ? cachedUserWatchLists : []),
      data
    ]);

    return data;
  }

  public async addItemToWatchListForUser(
    userId: number,
    watchListId: number,
    addItemRequest: AddItemToWatchListRequest
  ): Promise<WatchList> {
    const { data } = await this.post<WatchList>(`users/${userId}/watchLists/${watchListId}/items`, addItemRequest);

    this.cache.set(this.getWatchListCacheKey(watchListId), data);

    return data;
  }

  public async updateWatchListForUser(
    userId: number,
    watchListId: number,
    updateWatchListRequest: UpdateWatchListRequest
  ): Promise<WatchList> {
    const patchDoc = Object.entries(updateWatchListRequest).map(([key, value]) => ({
      op: 'add',
      path: `/${key}`,
      value
    }));

    const { data } = await this.patch<WatchList>(`users/${userId}/watchLists/${watchListId}`, patchDoc);

    this.cache.set(this.getWatchListCacheKey(watchListId), data);

    return data;
  }

  public async deleteWatchListForUser(userId: number, watchListId: number): Promise<void> {
    await this.delete(`users/${userId}/watchLists/${watchListId}`);
    this.cache.delete(this.getWatchListCacheKey(watchListId));

    const cacheKey = this.getUserWatchListsCacheKey(userId);
    const cachedUserWatchLists = this.cache.get(cacheKey);

    if (cachedUserWatchLists) {
      if (Array.isArray(cachedUserWatchLists)) {
        this.cache.set(
          cacheKey,
          cachedUserWatchLists.filter(list => list.id !== watchListId)
        );
      } else {
        this.cache.delete(cacheKey);
      }
    }
  }

  public async deleteItemFromWatchListForUser(userId: number, watchListId: number, itemId: number): Promise<void> {
    const { data } = await this.delete<WatchList>(`users/${userId}/watchLists/${watchListId}/items/${itemId}`);

    this.cache.set(this.getWatchListCacheKey(watchListId), data);

    const cacheKey = this.getUserWatchListsCacheKey(userId);
    const cachedUserWatchLists = this.cache.get(cacheKey);

    if (cachedUserWatchLists) {
      if (Array.isArray(cachedUserWatchLists)) {
        this.cache.set(cacheKey, [...cachedUserWatchLists.filter(list => list.id !== watchListId), data]);
      } else {
        this.cache.delete(cacheKey);
      }
    }
  }

  private getWatchListCacheKey(watchListId: number): string {
    return `watchList:${watchListId}`;
  }

  private getUserWatchListsCacheKey(userId: number): string {
    return `userWatchLists:${userId}`;
  }
}

export const watchListService = new WatchListService(
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
