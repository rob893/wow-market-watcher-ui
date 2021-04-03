import { Subject } from 'rxjs';

export class LoadingService {
  public readonly loadingStateChanged = new Subject<boolean>();

  public startLoading(): void {
    this.loadingStateChanged.next(true);
  }

  public stopLoading(): void {
    this.loadingStateChanged.next(false);
  }
}

export const loadingService = new LoadingService();
