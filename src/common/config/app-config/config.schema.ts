import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const configSchema = z.object({
    DATABASE_URL: z.string(),
    APP_PORT: z
        .string()
        .default('3000')
        .transform((port) => parseInt(port, 10)),
    SUPERADMIN_USERNAME: z.string(),
    SUPERADMIN_PASSWORD: z.string(),
    JWT_AUTH_SECRET: z.string(),
    TELEGRAM_BOT_TOKEN: z.string(),
    TELEGRAM_ADMIN_ID: z.string(),
    NODES_NOTIFY_CHAT_ID: z.string(),
    FRONT_END_DOMAIN: z.string(),
    IS_DOCS_ENABLED: z.string().default('false'),
    SCALAR_PATH: z.string().default('/scalar'),
    SWAGGER_PATH: z.string().default('/docs'),
    JWT_API_TOKENS_SECRET: z.string(),
    EXPIRED_USER_REMARKS: z.string().transform((str) => {
        try {
            return JSON.parse(str) as string[];
        } catch {
            throw new Error('EXPIRED_USER_REMARKS must be a valid JSON array of strings');
        }
    }),
    DISABLED_USER_REMARKS: z.string().transform((str) => {
        try {
            return JSON.parse(str) as string[];
        } catch {
            throw new Error('DISABLED_USER_REMARKS must be a valid JSON array of strings');
        }
    }),
    LIMITED_USER_REMARKS: z.string().transform((str) => {
        try {
            return JSON.parse(str) as string[];
        } catch {
            throw new Error('LIMITED_USER_REMARKS must be a valid JSON array of strings');
        }
    }),
    METRICS_USER: z.string(),
    METRICS_PASS: z.string(),
    METRICS_ENDPOINT: z.string().default('/metrics'),
});

export type ConfigSchema = z.infer<typeof configSchema>;
export class Env extends createZodDto(configSchema) {}
