export interface User {
  id: number;
  userName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  preferences: UserPreferences;
  created: string;
  roles: string[];
  linkedAccounts: LinkedAccount[];
}

export interface UserPreferences {
  id: number;
  userId: number;
  uiTheme: UITheme;
}

export enum UITheme {
  Dark = 'Dark',
  Light = 'Light'
}

export interface LinkedAccount {
  id: string;
  linkedAccountType: LinkedAccountType;
  userId: number;
}

export enum LinkedAccountType {
  Google = 'Google'
}

export interface AuctionTimeSeriesEntry {
  id: number;
  wowItemId: number;
  connectedRealmId: number;
  timestamp: string;
  totalAvailableForAuction: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  price25Percentile: number;
  price50Percentile: number;
  price75Percentile: number;
  price95Percentile: number;
  price99Percentile: number;
}

export interface WoWItem {
  id: number;
  name: string;
  quality: string;
}

export interface WatchList {
  id: number;
  userId: number;
  name: string;
  description?: string;
  watchedItems: WatchedItem[];
}

export interface WatchedItem {
  id: number;
  watchListId: number;
  connectedRealmId: number;
  wowItemId: number;
  wowItem: WoWItem;
}

export interface Realm {
  id: number;
  name: string;
  connectedRealmId: number;
  isTournament: boolean;
  locale: string;
  timezone: string;
  slug: string;
  region: string;
  category: string;
  type: string;
}

export interface ConnectedRealm {
  id: number;
  population: string;
  realms: Realm[];
}

export interface Alert {
  id: number;
  userId: number;
  name: string;
  description?: string;
  conditions: AlertCondition[];
  actions: AlertAction[];
  state: AlertState;
  lastEvaluated: string;
  lastFired?: string;
}

export interface AlertAction {
  id: number;
  alertId: number;
  actionOn: AlertActionOnType;
  type: AlertActionType;
  target: string;
}

export interface AlertCondition {
  id: number;
  alertId: number;
  wowItemId: number;
  connectedRealmId: number;
  metric: AlertConditionMetric;
  operator: AlertConditionOperator;
  aggregationType: AlertConditionAggregationType;
  aggregationTimeGranularityInHours: number;
  threshold: number;
}

export enum AlertActionOnType {
  AlertActivated = 'AlertActivated',
  AlertDeactivated = 'AlertDeactivated'
}

export enum AlertActionType {
  Email = 'Email'
}

export enum AlertConditionAggregationType {
  Sum = 'Sum',
  Count = 'Count',
  Average = 'Average',
  Min = 'Min',
  Max = 'Max'
}

export enum AlertConditionMetric {
  TotalAvailableForAuction = 'TotalAvailableForAuction',
  AveragePrice = 'AveragePrice',
  MinPrice = 'MinPrice',
  MaxPrice = 'MaxPrice',
  Price25Percentile = 'Price25Percentile',
  Price50Percentile = 'Price50Percentile',
  Price75Percentile = 'Price75Percentile',
  Price95Percentile = 'Price95Percentile',
  Price99Percentile = 'Price99Percentile'
}

export enum AlertConditionOperator {
  GreaterThan = 'GreaterThan',
  GreaterThanOrEqualTo = 'GreaterThanOrEqualTo',
  LessThan = 'LessThan',
  LessThanOrEqualTo = 'LessThanOrEqualTo'
}

export enum AlertState {
  InsufficientData = 'InsufficientData',
  Alarm = 'Alarm',
  Ok = 'Ok'
}
