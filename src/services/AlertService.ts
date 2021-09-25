import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Alert } from '@/models/entities';
import { AuthService, authService } from './AuthService';
import { WoWMarketWatcherAuthenticatedBaseService } from './WoWMarketWatcherAuthenticatedBaseService';
import { CursorPaginatedResponse, HttpClientFactory, Logger } from '@/models/core';
import { EnvironmentService, environmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';
import { LRUCache } from 'typescript-lru-cache';
import { List } from 'typescript-extended-linq';
import { cloneDeep } from 'lodash';
import { CreateAlertForUserRequest, UpdateAlertRequest } from '@/models';

export class AlertService extends WoWMarketWatcherAuthenticatedBaseService {
  private readonly cache: LRUCache<string, Alert | Alert[]>;

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

  public async getAlertsForUser(userId: number): Promise<List<Alert>> {
    const cacheKey = this.getUserAlertsCacheKey(userId);
    const cachedAlerts = this.cache.get(cacheKey);

    if (cachedAlerts) {
      if (Array.isArray(cachedAlerts)) {
        return new List(cachedAlerts);
      } else {
        this.cache.delete(cacheKey);
      }
    }

    const {
      data: { nodes = [] }
    } = await this.get<CursorPaginatedResponse<Alert>>(`users/${userId}/alerts`);

    this.cache.set(cacheKey, nodes);

    for (const alert of nodes) {
      this.cache.set(this.getAlertCacheKey(userId, alert.id), alert);
    }

    return new List(nodes);
  }

  public async getAlertForUser(userId: number, alertId: number): Promise<Alert | null> {
    const cacheKey = this.getAlertCacheKey(userId, alertId);
    const cachedAlert = this.cache.get(cacheKey);

    if (cachedAlert) {
      if (Array.isArray(cachedAlert)) {
        this.cache.delete(cacheKey);
      } else {
        return cachedAlert;
      }
    }

    const { data } = await this.get<Alert | null>(`users/${userId}/alerts/${alertId}`);

    if (data) {
      this.cache.set(cacheKey, data);
    }

    return data;
  }

  public async createAlertForUser(userId: number, createAlertRequest: CreateAlertForUserRequest): Promise<Alert> {
    const { data } = await this.post<Alert>(`users/${userId}/alerts`, createAlertRequest);

    this.updateCachedUserAlert(userId, data);

    return data;
  }

  public async updateAlertForUser(
    userId: number,
    alertId: number,
    updateAlertRequest: UpdateAlertRequest
  ): Promise<Alert> {
    const patchDoc = Object.entries(updateAlertRequest).map(([key, value]) => ({
      op: 'add',
      path: `/${key}`,
      value
    }));

    const { data } = await this.patch<Alert>(`users/${userId}/alerts/${alertId}`, patchDoc);

    this.updateCachedUserAlert(userId, data);

    return data;
  }

  public async deleteAlertForUser(userId: number, alertId: number): Promise<void> {
    await this.delete(`users/${userId}/alerts/${alertId}`);
    this.cache.delete(this.getAlertCacheKey(userId, alertId));

    const cacheKey = this.getUserAlertsCacheKey(userId);
    const cachedUserAlerts = this.cache.get(cacheKey);

    if (cachedUserAlerts) {
      if (Array.isArray(cachedUserAlerts)) {
        this.cache.set(
          cacheKey,
          cachedUserAlerts.filter(list => list.id !== alertId)
        );
      } else {
        this.cache.delete(cacheKey);
      }
    }
  }

  private updateCachedUserAlert(userId: number, updatedOrNewAlert: Alert): void {
    const { id: alertId } = updatedOrNewAlert;
    this.cache.set(this.getAlertCacheKey(userId, alertId), updatedOrNewAlert);

    const cacheKey = this.getUserAlertsCacheKey(userId);
    const cachedUserAlerts = this.cache.get(cacheKey);

    if (cachedUserAlerts) {
      if (Array.isArray(cachedUserAlerts)) {
        const indexToReplace = cachedUserAlerts.findIndex(list => list.id === alertId);

        if (indexToReplace >= 0) {
          cachedUserAlerts[indexToReplace] = updatedOrNewAlert;
        } else {
          cachedUserAlerts.push(updatedOrNewAlert);
        }

        this.cache.set(cacheKey, cachedUserAlerts);
      } else {
        this.cache.delete(cacheKey);
      }
    }
  }

  private getAlertCacheKey(userId: number, alertId: number): string {
    return `users/${userId}/alerts/${alertId}`;
  }

  private getUserAlertsCacheKey(userId: number): string {
    return `users/${userId}/alerts`;
  }
}

export const alertService = new AlertService(
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
