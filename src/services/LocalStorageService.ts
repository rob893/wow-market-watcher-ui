import { Logger } from '@/models';
import { environmentService, EnvironmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';

export class LocalStorageService {
  private readonly storage: Storage;

  private readonly storagePrefix: string;

  private readonly logger: Logger;

  public constructor(storage: Storage, { localStoragePrefix, env }: EnvironmentService, logger: Logger) {
    this.storage = storage;
    this.storagePrefix = `${localStoragePrefix}-${env}-`;
    this.logger = logger;
  }

  public getItem(key: string): string | null {
    this.logger.debug(`${LocalStorageService.name}.${this.getItem.name}: Getting item for key '${key}'.`);

    const item = this.storage.getItem(this.computeKey(key));

    if (!item) {
      return null;
    }

    return item;
  }

  public getParsedItem<T = unknown>(key: string): T | null {
    this.logger.debug(`${LocalStorageService.name}.${this.getParsedItem.name}: Getting item for key '${key}'.`);

    const item = this.getItem(key);

    if (!item) {
      return null;
    }

    const parsed = JSON.parse(item);

    return parsed;
  }

  public setItem<T>(key: string, value: T): void {
    this.logger.debug(`${LocalStorageService.name}.${this.setItem.name}: Setting item for key '${key}'.`);

    if (typeof value === 'string') {
      this.storage.setItem(this.computeKey(key), value);
    } else {
      const asString = JSON.stringify(value);
      this.storage.setItem(this.computeKey(key), asString);
    }
  }

  public removeItem(key: string): void {
    this.logger.debug(`${LocalStorageService.name}.${this.removeItem.name}: Removing item for key '${key}'.`);
    this.storage.removeItem(this.computeKey(key));
  }

  public clear(): void {
    this.logger.debug(`${LocalStorageService.name}.${this.clear.name}: Clearing local storage.`);
    this.storage.clear();
  }

  private computeKey(key: string): string {
    return `${this.storagePrefix}${key}`;
  }
}

export const localStorageService = new LocalStorageService(localStorage, environmentService, loggerService);
