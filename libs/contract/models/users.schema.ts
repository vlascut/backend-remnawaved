import { z } from 'zod';

export const UsersSchema = z.object({
    uuid: z.string().uuid(),
    subUuid: z.string(),
    username: z.string(),

    status: z.enum(['active', 'disabled', 'limimted', 'expired']).default('active'),

    usedTrafficBytes: z.number().int().default(0),
    trafficLimitBytes: z.number().int().default(0),
    trafficLimitStrategy: z.enum(['no_reset', 'day', 'week', 'month', 'year']).default('no_reset'),
    subLastUserAgent: z.string().nullable(),
    subLastIp: z.string().nullable(),

    expireAt: z.date(),
    onlineAt: z.date().nullable(),
    subRevokedAt: z.date().nullable(),

    createdAt: z.date(),
    updatedAt: z.date(),
});
