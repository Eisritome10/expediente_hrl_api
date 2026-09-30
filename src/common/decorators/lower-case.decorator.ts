import { Transform } from 'class-transformer';

export function LowerCase(): PropertyDecorator {
  return Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value));
}
