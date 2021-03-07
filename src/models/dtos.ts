import { Indexable } from './core';

export interface UpdateUserDto extends Indexable {
  firstName?: string;
  lastName?: string;
}

export interface EditFormField<TValue = any> {
  edited: boolean;
  value: TValue;
}

export interface RegisterUserDto {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
}
