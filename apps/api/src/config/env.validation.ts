import * as Joi from 'joi';

/**
 * Environment variable validation schema. The application refuses to boot if
 * required secrets are missing, which prevents insecure misconfiguration in
 * production.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  API_PORT: Joi.number().default(4000),
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_TTL: Joi.number().default(900),
  JWT_REFRESH_TTL: Joi.number().default(604800),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
  ENCRYPTION_KEY: Joi.string().min(16).optional(),
});
