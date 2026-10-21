import { registerAs } from '@nestjs/config';

export const reniecConfig = registerAs('reniec', () => ({
  baseUrl: process.env.RENIEC_BASE_URL ?? 'https://reniec.nuiti.org/api/pacientes',
  token: process.env.RENIEC_TOKEN ?? '',
}));
