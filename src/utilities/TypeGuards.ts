import { AxiosRequestConfigWithMetadata, ConnectedRealm, Realm } from '@/models';
import { AxiosError } from 'axios';

export class TypeGuards {
  public static isAxiosError(error: unknown): error is AxiosError & { config: AxiosRequestConfigWithMetadata } {
    return (error as AxiosError).isAxiosError === true;
  }

  public static isConnectedRealm(realm: unknown): realm is ConnectedRealm {
    return (
      (realm as ConnectedRealm).id !== undefined &&
      (realm as ConnectedRealm).realms !== undefined &&
      Array.isArray((realm as ConnectedRealm).realms)
    );
  }

  public static isConnectedRealmArray(realms: unknown): realms is ConnectedRealm[] {
    if (!Array.isArray(realms)) {
      return false;
    }

    return realms.length === 0 || this.isConnectedRealm(realms[0]);
  }

  public static isRealm(realm: unknown): realm is Realm {
    return (realm as Realm).id !== undefined && (realm as Realm).connectedRealmId !== undefined;
  }

  public static isRealmArray(realms: unknown): realms is Realm[] {
    if (!Array.isArray(realms)) {
      return false;
    }

    return realms.length === 0 || this.isRealm(realms[0]);
  }
}
