export interface CursorPaginationParameters {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  includeTotal?: boolean;
  includeNodes?: boolean;
  includeEdges?: boolean;
}

export interface AuctionTimeSeriesQueryParameters extends CursorPaginationParameters {
  wowItemId?: number;
  connectedRealmId?: number;
  startDate: string;
  endDate?: string;
}

export interface RealmQueryParameters extends CursorPaginationParameters {
  name?: string;
  nameLike?: string;
  timezone?: string;
  region?: string;
}

export interface WoWItemQueryParameters extends CursorPaginationParameters {
  quality?: string;
  itemClass?: string;
  itemSubclass?: string;
  inventoryType?: string;
  nameLike?: string;
  name?: string;
}
