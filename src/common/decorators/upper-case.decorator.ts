import { Transform } from 'class-transformer';

export function UpperCase(): PropertyDecorator {
  return Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value));
}
