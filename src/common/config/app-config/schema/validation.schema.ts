import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number().integer().port().default(3000),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),

  // Consulta de DNI a RENIEC (vía NUITI). Sin token la consulta queda deshabilitada y el investigador se registra a mano.
  RENIEC_BASE_URL: Joi.string().uri().default('https://reniec.nuiti.org/api/pacientes'),
  RENIEC_TOKEN: Joi.string().allow('').optional(),
});
