import { Indexable } from './core';
import {
  AlertActionOnType,
  AlertActionType,
  AlertConditionAggregationType,
  AlertConditionMetric,
  AlertConditionOperator
} from './entities';

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

export interface CreateOrPutAlertActionRequest {
  actionOn: AlertActionOnType;
  type: AlertActionType;
  target: string;
}

export interface CreateOrPutAlertConditionRequest {
  connectedRealmId: number;
  wowItemId: number;
  metric: AlertConditionMetric;
  operator: AlertConditionOperator;
  aggregationType: AlertConditionAggregationType;
  aggregationTimeGranularityInHours: number;
  threshold: number;
}

export interface CreateOrPutAlertForUserRequest {
  name: string;
  description?: string;
  actions: CreateOrPutAlertActionRequest[];
  conditions: CreateOrPutAlertConditionRequest[];
}

export interface PutAlertActionRequest {
  type: AlertActionType;
  target: string;
}

export interface UpdateAlertActionRequest {
  type?: AlertActionType;
  target?: string;
}

export interface UpdateAlertConditionRequest {
  connectedRealmId?: number;
  wowItemId?: number;
  metric?: AlertConditionMetric;
  operator?: AlertConditionOperator;
  aggregationType?: AlertConditionAggregationType;
  aggregationTimeGranularityInHours?: number;
  threshold?: number;
}

export interface UpdateAlertRequest {
  name?: string;
  description?: string;
}
