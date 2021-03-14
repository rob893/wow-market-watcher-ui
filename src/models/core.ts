export type Environment = Readonly<{
  appTitle: string;
  production: boolean;
  logging: LoggingOptions;
  env: EnvironmentMode;
  localStoragePrefix: string;
  wowMarketWatcherBaseUrl: string;
  googleAuthClientId: string;
  retryOptions: RetryOptions;
}>;

export enum EnvironmentMode {
  Development = 'development',
  Production = 'production'
}

export interface LoggingOptions {
  logLevel: LogLevelOptions;
  providers?: {
    [key: string]: LoggingProviderOptions | undefined;
  };
}

export interface LoggingProviderOptions {
  logLevel: LogLevelOptions;
}

export interface LogLevelOptions {
  default: LogLevel;
  [key: string]: LogLevel | undefined;
}

export interface RetryOptions {
  maxRetryAttempts: number;
  enabled: boolean;
  delayTimeInMs: number;
}

export interface Logger {
  debug(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
  group(label: string, collapsed?: boolean): void;
  groupEnd(): void;
}

export interface LoggingProvider {
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  group(label: string, collapsed?: boolean): void;
  groupEnd(): void;
}

export enum LogLevel {
  Debug,
  Info,
  Warn,
  Error,
  Off
}

export interface OrderByOptions<T> {
  orderBy: keyof T;
  comparer?: (a: T[OrderByOptions<T>['orderBy']], b: T[OrderByOptions<T>['orderBy']]) => number;
  direction?: 'Ascending' | 'Descending';
}

export type JSONPrimitive = string | number | boolean | null;

export type JSONArray = (JSONObject | JSONArray | JSONPrimitive)[];

export type JSONObject = {
  [key: string]: JSONObject | JSONPrimitive | JSONArray;
};

export interface CursorPaginatedResponse<TEntity> {
  edges?: CursorPaginatedResponseEdge<TEntity>;
  nodes?: TEntity[];
  pageInfo: CursorPaginatedResponsePageInfo;
  totalCount?: number;
}

export interface CursorPaginatedResponseEdge<TEntity> {
  cursor: string;
  node: TEntity;
}

export interface CursorPaginatedResponsePageInfo {
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface JSONPatchDocument {
  op: 'add' | 'replace';
  path: string;
  value: JSONObject | JSONArray | JSONPrimitive;
}

export interface Indexable<TValue = any> {
  [key: string]: TValue;
}

export enum WoWMarketWatcherServiceHeaders {
  CorrelationId = 'x-correlation-id',
  TokenExpired = 'x-token-expired'
}
