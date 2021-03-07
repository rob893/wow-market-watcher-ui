import { Logger } from '@/models';
import { AuthService, authService } from './AuthService';
import { environmentService } from './EnvironmentService';
import { loggerService } from './LoggerService';

export class GoogleAuthService {
  private readonly gapiScriptId = 'gapi-script';
  private readonly googleAuthConfig: gapi.auth2.ClientConfig;
  private readonly logger: Logger;

  private googleAuth: gapi.auth2.GoogleAuth | null = null;

  public constructor(googleAuthConfig: gapi.auth2.ClientConfig, authService: AuthService, logger: Logger) {
    this.googleAuthConfig = googleAuthConfig;
    this.logger = logger;

    authService.authChanged.subscribe(async isLoggedIn => {
      if (!isLoggedIn) {
        await this.signOut();
      }
    });

    this.initializeAuth2();
  }

  public get gapiScriptCreated(): boolean {
    return !!document.getElementById(this.gapiScriptId);
  }

  public get gapiLoaded(): boolean {
    return this.gapiScriptCreated && !!gapi;
  }

  public get gapiAuth2Loaded(): boolean {
    return this.gapiLoaded && !!gapi.auth2;
  }

  public get gapiAuth2Initialized(): boolean {
    return this.gapiAuth2Loaded && !!this.googleAuth;
  }

  public get isSignedIn(): boolean {
    if (!this.googleAuth) {
      return false;
    }

    return this.googleAuth.isSignedIn.get();
  }

  public get currentUser(): gapi.auth2.GoogleUser | null {
    if (!this.googleAuth) {
      return null;
    }

    return this.googleAuth.currentUser.get();
  }

  public get currentUserIdToken(): string | null {
    return this.currentUser?.getAuthResponse()?.id_token || null;
  }

  public installClient(): Promise<void> {
    this.logger.debug('Installing gapi client...');

    return new Promise(resolve => {
      if (!this.gapiScriptCreated) {
        const apiUrl = 'https://apis.google.com/js/api.js';
        const script = document.createElement('script');
        script.id = this.gapiScriptId;
        script.src = apiUrl;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
          this.logger.debug('gapi client installation complete.');
          resolve();
        };
      } else {
        this.logger.debug('gapi client already installed.');
        resolve();
      }
    });
  }

  public async loadGapiAuth2(): Promise<void> {
    this.logger.debug('Loading gapi auth2 library...');
    if (this.gapiAuth2Loaded) {
      this.logger.debug('gapi auth2 library already loaded.');
      return;
    }

    if (!this.gapiLoaded) {
      await this.installClient();
    }

    return new Promise(resolve => {
      gapi.load('auth2', () => {
        this.logger.debug('gapi auth2 library loaded.');
        resolve();
      });
    });
  }

  public async initializeAuth2(): Promise<void> {
    this.logger.debug('Initializing gapi auth2 client');

    if (this.gapiAuth2Initialized) {
      this.logger.debug('gapi auth2 client already initialized.');
      return;
    }

    if (!this.gapiAuth2Loaded) {
      await this.loadGapiAuth2();
    }

    gapi.auth2.init(this.googleAuthConfig).then(googleAuth => {
      this.logger.debug('gapi auth2 client initialized.');
      this.googleAuth = googleAuth;
    });
  }

  public async signOut(): Promise<void> {
    this.logger.debug('Signing out of google auth');

    if (!this.gapiAuth2Initialized) {
      await this.initializeAuth2();
    }

    if (!this.googleAuth) {
      throw new Error('Google auth not initialized.');
    }

    return this.googleAuth.signOut();
  }

  public async signIn(): Promise<gapi.auth2.GoogleUser> {
    this.logger.debug('Signing into google auth');

    if (!this.gapiAuth2Initialized) {
      await this.initializeAuth2();
    }

    if (!this.googleAuth) {
      throw new Error('Google auth not initialized.');
    }

    return this.googleAuth.signIn();
  }
}

export const googleAuthService = new GoogleAuthService(
  { client_id: environmentService.googleAuthClientId },
  authService,
  loggerService
);
