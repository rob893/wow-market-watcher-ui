import { Environment, EnvironmentMode, LogLevel } from '@/models/core';
import { commonEnvironment } from './environment.common';

export const productionEnvironment: Environment = {
  ...commonEnvironment,
  loggingOptions: {
    logLevel: LogLevel.Warn,
    console: {
      logLevel: LogLevel.Off
    }
  },
  production: true,
  env: EnvironmentMode.Production,
  wowMarketWatcherBaseUrl: 'https://localhost:5001/api'
};
