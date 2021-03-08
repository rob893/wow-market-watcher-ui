import { AxiosRequestConfigWithMetadata } from '@/models';
import { AxiosError } from 'axios';

export class TypeGuards {
  public static isAxiosError(error: unknown): error is AxiosError & { config: AxiosRequestConfigWithMetadata } {
    return (error as AxiosError).isAxiosError === true;
  }
}
