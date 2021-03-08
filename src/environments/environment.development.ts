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
  wowMarketWatcherBaseUrl: 'http://localhost:5003/api'
};
