import { Environment, EnvironmentMode, LogLevel } from '@/models/core';
import { commonEnvironment } from './environment.common';

export const developmentEnvironment: Environment = {
  ...commonEnvironment,
  logging: {
    logLevel: {
      default: LogLevel.Debug
    },
    providers: {
      console: {
        logLevel: {
          default: LogLevel.Debug
        }
      }
    }
  },
  production: false,
  env: EnvironmentMode.Development,
  wowMarketWatcherBaseUrl: 'https://rwherber.com/wow-market-watcher/api/v1'
  //wowMarketWatcherBaseUrl: 'http://localhost:5003/api/v1'
};
