export interface User {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  created: string;
  roles: string[];
  linkedAccounts: LinkedAccount[];
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
}

export interface WatchList {
  id: number;
  userId: number;
  connectedRealmId: number;
  name: string;
  description?: string;
  watchedItems: WoWItem[];
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
  realms: Realm[];
}
