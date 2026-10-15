import { ValidationError } from './validation-error';

export function fail(message: string): never {
  throw new ValidationError(message);
}