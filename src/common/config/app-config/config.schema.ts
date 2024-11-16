import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const configSchema = z.object({
    DATABASE_URL: z.string(),
    APP_PORT: z
        .string()
        .default('3000')
        .transform((port) => parseInt(port, 10)),
    SUPERADMIN_USERNAME: z.string(),
    SUPERADMIN_PASSWORD: z.string(),
    API_PREFIX: z.string().default('api/v1'),
    NODE_ENV: z.string(),
    JWT_AUTH_SECRET: z.string(),
    TELEGRAM_BOT_TOKEN: z.string(),
    TELEGRAM_HEADERS_SECRET: z.string(),
    TELEGRAM_SECRET_PATH: z.string(),
    FRONT_END_DOMAIN: z.string(),
    REDIS_URL: z.string(),
    IS_SWAGGER_ENABLED: z.string().default('false'),
    SWAGGER_PATH: z.string().default('/docs'),
    JWT_API_TOKENS_SECRET: z.string(),
});

export type ConfigSchema = z.infer<typeof configSchema>;
export class Env extends createZodDto(configSchema) {}
