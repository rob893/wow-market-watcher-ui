import { Environment, EnvironmentMode, LogLevel } from '@/models/core';
import { commonEnvironment } from './environment.common';

export const developmentEnvironment: Environment = {
  ...commonEnvironment,
  loggingOptions: {
    logLevel: LogLevel.Debug,
    console: {
      logLevel: LogLevel.Debug
    }
  },
  production: false,
  env: EnvironmentMode.Development,
  wowMarketWatcherBaseUrl: 'https://localhost:5001/api'
};
