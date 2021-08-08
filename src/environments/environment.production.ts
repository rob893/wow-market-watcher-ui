import { Environment, EnvironmentMode, LogLevel } from '@/models/core';
import { commonEnvironment } from './environment.common';

export const productionEnvironment: Environment = {
  ...commonEnvironment,
  logging: {
    logLevel: {
      default: LogLevel.Warn
    },
    providers: {
      console: {
        logLevel: {
          default: LogLevel.Off
        }
      }
    }
  },
  production: true,
  env: EnvironmentMode.Production,
  wowMarketWatcherBaseUrl: 'https://rwherber.com/wow-market-watcher/api/v1'
};
