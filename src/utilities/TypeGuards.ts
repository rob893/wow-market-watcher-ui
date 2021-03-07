import { AxiosError } from 'axios';

export class TypeGuards {
  public static isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError === true;
  }
}
