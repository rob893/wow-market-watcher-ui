import axios from 'axios';
import { User } from '@/models/entities';
import { authService } from './AuthService';
import { WoWMarketWatcherAuthenticatedBaseService } from './WoWMarketWatcherAuthenticatedBaseService';
import { CursorPaginatedResponse } from '@/models/core';
import { UpdateUserDto } from '@/models/dtos';
import { environmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';

export class UserService extends WoWMarketWatcherAuthenticatedBaseService {
  public async getUsers(): Promise<User[]> {
    const {
      data: { nodes }
    } = await this.httpClient.get<CursorPaginatedResponse<User>>('users');

    return nodes;
  }

  public async getUser(id: number): Promise<User | null> {
    const { data } = await this.httpClient.get<User | null>(`users/${id}`);

    return data;
  }

  public async updateUser(id: number, fieldsToUpdate: UpdateUserDto): Promise<User> {
    const patchDoc = Object.entries(fieldsToUpdate).map(([key, value]) => ({
      op: 'add',
      path: `/${key}`,
      value
    }));

    const { data } = await this.httpClient.patch<User>(`users/${id}`, patchDoc);

    return data;
  }
}

export const userService = new UserService(axios, authService, environmentService, loggerService);
