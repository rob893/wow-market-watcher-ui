import axios from 'axios';
import { User } from '@/models/entities';
import { authService } from './AuthService';
import { WoWMarketWatcherAuthenticatedBaseService } from './WoWMarketWatcherAuthenticatedBaseService';
import { CursorPaginatedResponse, JSONPatchDocument } from '@/models/core';
import { UpdateUserRequest } from '@/models/requests';
import { environmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';
import { List } from 'typescript-extended-linq';

export class UserService extends WoWMarketWatcherAuthenticatedBaseService {
  public async getUsers(): Promise<List<User>> {
    const {
      data: { nodes = [] }
    } = await this.get<CursorPaginatedResponse<User>>('users');

    return new List(nodes);
  }

  public async getUser(id: number): Promise<User | null> {
    const { data } = await this.get<User | null>(`users/${id}`);

    return data;
  }

  public async updateUser(id: number, fieldsToUpdate: UpdateUserRequest): Promise<User> {
    const patchDoc: JSONPatchDocument[] = Object.entries(fieldsToUpdate).map(([key, value]) => ({
      op: 'add',
      path: `/${key}`,
      value
    }));

    const { data } = await this.patch<User>(`users/${id}`, patchDoc);

    return data;
  }

  public async deleteUser(id: number): Promise<void> {
    await this.delete<void>(`users/${id}`);
  }

  public async test(status: number, delay: number = 0, statusAfter: number = 200, per: number = 0): Promise<unknown> {
    const { data } = await this.get<unknown>(
      `test?status=${status}&delay=${delay}&statusAfter=${statusAfter}&per=${per}`
    );

    return data;
  }
}

export const userService = new UserService(axios, authService, environmentService, loggerService);
