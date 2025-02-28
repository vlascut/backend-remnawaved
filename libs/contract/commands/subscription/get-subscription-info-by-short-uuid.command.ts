import { z } from 'zod';

import { RESET_PERIODS, USERS_STATUS } from '../../constants';
import { REST_API } from '../../api';

export namespace GetSubscriptionInfoByShortUuidCommand {
    export const url = REST_API.SUBSCRIPTION.GET_INFO;
    export const TSQ_url = url(':shortUuid');

    export const RequestSchema = z.object({
        shortUuid: z.string(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            isFound: z.boolean(),
            user: z.object({
                shortUuid: z.string(),
                daysLeft: z.number(),
                trafficUsed: z.string(),
                trafficLimit: z.string(),
                username: z.string(),
                expiresAt: z
                    .string()
                    .datetime()
                    .transform((str) => new Date(str)),
                isActive: z.boolean(),
                userStatus: z.nativeEnum(USERS_STATUS),
                trafficLimitStrategy: z.nativeEnum(RESET_PERIODS),
            }),
            links: z.array(z.string()),
            ssConfLinks: z.record(z.string(), z.string()),
            subscriptionUrl: z.string(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
