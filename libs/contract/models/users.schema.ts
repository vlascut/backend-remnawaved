import { z } from 'zod';

import { RESET_PERIODS_VALUES, USERS_STATUS_VALUES } from '../constants';
import { InboundsSchema } from './inbounds.schema';

export const UsersSchema = z.object({
    uuid: z.string().uuid(),
    subscriptionUuid: z.string().uuid(),
    shortUuid: z.string(),
    username: z.string(),

    status: z
        .enum([USERS_STATUS_VALUES[0], ...USERS_STATUS_VALUES])
        .default(USERS_STATUS_VALUES[0]),

    usedTrafficBytes: z.number(),
    lifetimeUsedTrafficBytes: z.number(),
    trafficLimitBytes: z.number().int().default(0),
    trafficLimitStrategy: z
        .enum([RESET_PERIODS_VALUES[0], ...RESET_PERIODS_VALUES], {
            description: 'Available reset periods',
        })
        .default(RESET_PERIODS_VALUES[0]),
    subLastUserAgent: z.nullable(z.string()),
    subLastOpenedAt: z.nullable(z.string().transform((str) => new Date(str))),

    expireAt: z.nullable(z.string().transform((str) => new Date(str))),
    onlineAt: z.nullable(z.string().transform((str) => new Date(str))),
    subRevokedAt: z.nullable(z.string().transform((str) => new Date(str))),
    lastTrafficResetAt: z.nullable(z.string().transform((str) => new Date(str))),

    trojanPassword: z.string(),
    vlessUuid: z.string().uuid(),
    ssPassword: z.string(),

    description: z.nullable(z.string()),

    createdAt: z.string().transform((str) => new Date(str)),
    updatedAt: z.string().transform((str) => new Date(str)),

    activeUserInbounds: z.array(InboundsSchema),
});
