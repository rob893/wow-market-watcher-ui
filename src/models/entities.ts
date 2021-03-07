export interface User {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  created: string;
  roles: string[];
  linkedAccounts: LinkedAccount[];
}

export interface LinkedAccount {
  id: string;
  linkedAccountType: LinkedAccountType;
  userId: number;
}

export enum LinkedAccountType {
  Google = 'Google'
}
