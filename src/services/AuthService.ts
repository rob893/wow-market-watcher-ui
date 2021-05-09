import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { v4 as uuid } from 'uuid';
import { Subject } from 'rxjs';
import { LoginResponse, RefreshTokenResponse, RegisterResponse } from '@/models/responses';
import { LocalStorageService, localStorageService as localStorageServiceInstance } from './LocalStorageService';
import { User } from '@/models/entities';
import { WoWMarketWatcherBaseService } from './WoWMarketWatcherBaseService';
import { HttpClientFactory, Logger, RegisterUserRequest } from '@/models';
import { loggerService } from './LoggerService';
import { environmentService, EnvironmentService } from './EnvironmentService';

export class AuthService extends WoWMarketWatcherBaseService {
  public readonly authChanged: Subject<boolean> = new Subject();

  public readonly unauthorizedActionAttempted: Subject<number | void> = new Subject();

  private readonly localStorageService: LocalStorageService;

  private readonly accessTokenStorageKey: string = 'access-token';

  private readonly refreshTokenStorageKey: string = 'refresh-token';

  private readonly deviceIdStorageKey: string = 'device-id';

  private readonly userStorageKey: string = 'user';

  private cachedAccessToken: string | null = null;

  private cachedRefreshToken: string | null = null;

  private cachedDeviceId: string | null = null;

  private cachedLoggedInUser: User | null = null;

  public constructor(
    httpClientFactory: HttpClientFactory<AxiosInstance, AxiosRequestConfig>,
    localStorageService: LocalStorageService,
    environmentService: EnvironmentService,
    logger: Logger
  ) {
    super(httpClientFactory, environmentService, logger);
    this.localStorageService = localStorageService;
  }

  public get isUserLoggedIn(): boolean {
    return this.loggedInUser !== null;
  }

  public get loggedInUser(): User | null {
    if (!this.cachedLoggedInUser) {
      const userFromLocalStorage = this.localStorageService.getParsedItem<User>(this.userStorageKey);

      if (!userFromLocalStorage) {
        return null;
      }

      this.cachedLoggedInUser = userFromLocalStorage;
    }

    return { ...this.cachedLoggedInUser };
  }

  private get accessToken(): string | null {
    if (!this.cachedAccessToken) {
      const tokenFromLocalStorage = this.localStorageService.getItem(this.accessTokenStorageKey);

      if (!tokenFromLocalStorage) {
        return null;
      }

      this.cachedAccessToken = tokenFromLocalStorage;
    }

    return this.cachedAccessToken;
  }

  private get refreshToken(): string | null {
    if (!this.cachedRefreshToken) {
      const tokenFromLocalStorage = this.localStorageService.getItem(this.refreshTokenStorageKey);

      if (!tokenFromLocalStorage) {
        return null;
      }

      this.cachedRefreshToken = tokenFromLocalStorage;
    }

    return this.cachedRefreshToken;
  }

  private get deviceId(): string {
    if (!this.cachedDeviceId) {
      const deviceIdFromLocalStorage = this.localStorageService.getItem(this.deviceIdStorageKey);

      if (!deviceIdFromLocalStorage) {
        this.cachedDeviceId = uuid();
        this.localStorageService.setItem(this.deviceIdStorageKey, this.cachedDeviceId);
      } else {
        this.cachedDeviceId = deviceIdFromLocalStorage;
      }
    }

    return this.cachedDeviceId;
  }

  public async registerUser(registerUserDto: RegisterUserRequest): Promise<RegisterResponse> {
    this.logger.debug(`${AuthService.name}.${this.registerUser.name}: Registering user.`);

    const { data } = await this.post<RegisterResponse>('auth/register', {
      ...registerUserDto,
      deviceId: this.deviceId
    });

    this.handleLoginOrRegisterResponse(data);

    this.logger.info(`${AuthService.name}.${this.registerUser.name}: Registering user account complete.`);

    return data;
  }

  public async registerUserUsingGoogleAccount(username: string, idToken: string): Promise<RegisterResponse> {
    this.logger.debug(
      `${AuthService.name}.${this.registerUserUsingGoogleAccount.name}: Registering user using Google account.`
    );

    const { data } = await this.post<RegisterResponse>('auth/register/google', {
      username,
      idToken,
      deviceId: this.deviceId
    });

    this.handleLoginOrRegisterResponse(data);

    this.logger.info(
      `${AuthService.name}.${this.registerUserUsingGoogleAccount.name}: Register user using Google account complete.`
    );

    return data;
  }

  public async login(username: string, password: string): Promise<LoginResponse> {
    this.logger.debug(`${AuthService.name}.${this.login.name}: Logging the user in.`);

    const { data } = await this.post<LoginResponse>('auth/login', {
      username,
      password,
      deviceId: this.deviceId
    });

    this.handleLoginOrRegisterResponse(data);

    this.logger.info(`${AuthService.name}.${this.login.name}: User login complete.`);

    return data;
  }

  public async loginGoogle(idToken: string): Promise<LoginResponse> {
    this.logger.debug(`${AuthService.name}.${this.loginGoogle.name}: Logging the user in using Google.`);

    const { data } = await this.post<LoginResponse>('auth/login/google', {
      idToken,
      deviceId: this.deviceId
    });

    this.handleLoginOrRegisterResponse(data);

    this.logger.info(`${AuthService.name}.${this.loginGoogle.name}: User Google login complete.`);

    return data;
  }

  public logout(): void {
    this.logger.debug(`${AuthService.name}.${this.logout.name}: Logging the user out.`);

    this.localStorageService.clear();
    this.cachedDeviceId = null;
    this.cachedAccessToken = null;
    this.cachedRefreshToken = null;
    this.cachedLoggedInUser = null;
    this.authChanged.next(false);

    this.logger.info(`${AuthService.name}.${this.logout.name}: User has been logged out.`);
  }

  public async getAccessToken(): Promise<string | null> {
    if (!this.accessToken) {
      this.logger.debug(`${AuthService.name}.${this.getAccessToken.name}: Access token is null.`);
      return null;
    }

    if (this.isTokenExpired(this.accessToken)) {
      this.logger.debug(`${AuthService.name}.${this.getAccessToken.name}: Access token is expired. Refreshing.`);
      await this.refreshAccessToken();
    }

    this.logger.debug(`${AuthService.name}.${this.getAccessToken.name}: Returning cached access token.`);

    return this.accessToken;
  }

  public async refreshAccessToken(): Promise<RefreshTokenResponse> {
    this.logger.debug(`${AuthService.name}.${this.refreshAccessToken.name}: Refreshing access token.`);

    const { data } = await this.post<RefreshTokenResponse>('auth/refreshToken', {
      token: this.accessToken,
      refreshToken: this.refreshToken,
      deviceId: this.deviceId
    });

    const { token, refreshToken } = data;

    this.cachedAccessToken = token;
    this.cachedRefreshToken = refreshToken;

    this.localStorageService.setItem(this.accessTokenStorageKey, token);
    this.localStorageService.setItem(this.refreshTokenStorageKey, refreshToken);

    this.logger.info(`${AuthService.name}.${this.refreshAccessToken.name}: Access token refreshed.`);

    return data;
  }

  public isTokenExpired(token: string, expOffsetInSeconds: number = 300): boolean {
    const { exp } = jwtDecode<JwtPayload>(token);

    if (!exp) {
      throw new Error('Token is missing exp claim');
    }

    const nowUTCSeconds = Date.now() / 1000;

    return nowUTCSeconds >= exp - expOffsetInSeconds;
  }

  public async confirmEmail(email: string, token: string): Promise<void> {
    await this.post<void>('auth/confirmEmail', { email, token });
  }

  private handleLoginOrRegisterResponse({ token, refreshToken, user }: LoginResponse | RegisterResponse): void {
    this.cachedAccessToken = token;
    this.cachedRefreshToken = refreshToken;
    this.cachedLoggedInUser = user;

    this.localStorageService.setItem(this.accessTokenStorageKey, token);
    this.localStorageService.setItem(this.refreshTokenStorageKey, refreshToken);
    this.localStorageService.setItem(this.userStorageKey, user);

    this.authChanged.next(true);
  }
}

export const authService = new AuthService(axios, localStorageServiceInstance, environmentService, loggerService);
