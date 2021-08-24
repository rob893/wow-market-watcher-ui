import { Indexable } from './core';

export interface UpdateUserRequest extends Indexable {
  firstName?: string;
  lastName?: string;
}

export interface EditFormField<TValue = any> {
  edited: boolean;
  value: TValue;
}

export interface RegisterUserRequest {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export interface CreateWatchListRequest {
  userId: number;
  name: string;
  description?: string;
}

export type CreateWatchListForUserRequest = Omit<CreateWatchListRequest, 'userId'>;

export interface UpdateWatchListRequest extends Indexable {
  name?: string;
  description?: string;
}

export interface AddItemToWatchListRequest {
  wowItemId: number;
  connectedRealmId: number;
}
