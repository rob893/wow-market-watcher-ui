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
