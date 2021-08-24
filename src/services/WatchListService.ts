import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { WatchList } from '@/models/entities';
import { AuthService, authService } from './AuthService';
import { WoWMarketWatcherAuthenticatedBaseService } from './WoWMarketWatcherAuthenticatedBaseService';
import { CursorPaginatedResponse, HttpClientFactory, Logger } from '@/models/core';
import { EnvironmentService, environmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';
import { AddItemToWatchListRequest, CreateWatchListForUserRequest, UpdateWatchListRequest } from '@/models';
import { LRUCache } from 'typescript-lru-cache';
import { cloneDeep } from 'lodash';

export class WatchListService extends WoWMarketWatcherAuthenticatedBaseService {
  private readonly cache: LRUCache<string, WatchList | WatchList[]>;

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
      this.cache.set(this.getWatchListCacheKey(userId, list.id), list);
    }

    return nodes;
  }

  public async getWatchListForUser(userId: number, watchListId: number): Promise<WatchList | null> {
    const cacheKey = this.getWatchListCacheKey(userId, watchListId);
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

    this.updateCachedUserWatchLists(userId, data);

    return data;
  }

  public async addItemToWatchListForUser(
    userId: number,
    watchListId: number,
    addItemRequest: AddItemToWatchListRequest
  ): Promise<WatchList> {
    const { data } = await this.post<WatchList>(`users/${userId}/watchLists/${watchListId}/items`, addItemRequest);

    this.updateCachedUserWatchLists(userId, data);

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

    this.updateCachedUserWatchLists(userId, data);

    return data;
  }

  public async deleteWatchListForUser(userId: number, watchListId: number): Promise<void> {
    await this.delete(`users/${userId}/watchLists/${watchListId}`);
    this.cache.delete(this.getWatchListCacheKey(userId, watchListId));

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

  public async deleteItemFromWatchListForUser(
    userId: number,
    watchListId: number,
    watchedItemId: number
  ): Promise<WatchList> {
    const { data } = await this.delete<WatchList>(`users/${userId}/watchLists/${watchListId}/items/${watchedItemId}`);

    this.updateCachedUserWatchLists(userId, data);

    return data;
  }

  private updateCachedUserWatchLists(userId: number, updatedOrNewWatchList: WatchList): void {
    const { id: watchListId } = updatedOrNewWatchList;
    this.cache.set(this.getWatchListCacheKey(userId, watchListId), updatedOrNewWatchList);

    const cacheKey = this.getUserWatchListsCacheKey(userId);
    const cachedUserWatchLists = this.cache.get(cacheKey);

    if (cachedUserWatchLists) {
      if (Array.isArray(cachedUserWatchLists)) {
        const indexToReplace = cachedUserWatchLists.findIndex(list => list.id === watchListId);

        if (indexToReplace >= 0) {
          cachedUserWatchLists[indexToReplace] = updatedOrNewWatchList;
        } else {
          cachedUserWatchLists.push(updatedOrNewWatchList);
        }

        this.cache.set(cacheKey, cachedUserWatchLists);
      } else {
        this.cache.delete(cacheKey);
      }
    }
  }

  private getWatchListCacheKey(userId: number, watchListId: number): string {
    return `users/${userId}/watchLists/${watchListId}`;
  }

  private getUserWatchListsCacheKey(userId: number): string {
    return `users/${userId}/watchLists`;
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
