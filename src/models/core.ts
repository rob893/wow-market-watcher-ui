export interface Environment {
  appTitle: string;
  production: boolean;
  loggingOptions: LoggingOptions;
  env: EnvironmentMode;
  localStoragePrefix: string;
  wowMarketWatcherBaseUrl: string;
  googleAuthClientId: string;
  retryOptions: RetryOptions;
}

export enum EnvironmentMode {
  Development = 'development',
  Production = 'production'
}

export interface LoggingOptions {
  logLevel: LogLevel;
  console: {
    logLevel: LogLevel;
  };
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
}

export interface LoggingProvider {
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

export enum LogLevel {
  Debug,
  Info,
  Warn,
  Error,
  Off
}

export type JSONPrimitive = string | number | boolean | null;

export type JSONArray = (JSONObject | JSONArray | JSONPrimitive)[];

export type JSONObject = {
  [key: string]: JSONObject | JSONPrimitive | JSONArray;
};

export interface CursorPaginatedResponse<TEntity> {
  edges: CursorPaginatedResponseEdge<TEntity>;
  nodes: TEntity[];
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

export enum HttpVerb {
  Get = 'GET',
  Post = 'POST',
  Patch = 'PATCH',
  Delete = 'DELETE',
  Put = 'PUT',
  Options = 'OPTIONS'
}

export enum WoWMarketWatcherServiceHeaders {
  CorrelationId = 'x-correlation-id',
  TokenExpired = 'x-token-expired'
}
