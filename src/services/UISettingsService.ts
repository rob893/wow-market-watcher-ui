import { localStorageService, LocalStorageService } from './LocalStorageService';

export class UISettingsService {
  private readonly localStorageService: LocalStorageService;

  private readonly darkThemeSetKey: string = 'dark-theme-set';

  private cachedDarkThemeSet: boolean | null = null;

  public constructor(localStorageService: LocalStorageService) {
    this.localStorageService = localStorageService;
  }

  public get darkThemeSet(): boolean {
    if (!this.cachedDarkThemeSet) {
      const userFromLocalStorage = this.localStorageService.getItem(this.darkThemeSetKey);

      if (!userFromLocalStorage) {
        return false;
      }

      this.cachedDarkThemeSet = userFromLocalStorage === 'true';
    }

    return this.cachedDarkThemeSet;
  }

  public set darkThemeSet(value: boolean) {
    this.cachedDarkThemeSet = value;
    this.localStorageService.setItem(this.darkThemeSetKey, value);
  }
}

export const uiSettingsService = new UISettingsService(localStorageService);
