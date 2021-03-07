import { User } from './entities';

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export type RegisterResponse = LoginResponse;

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}
