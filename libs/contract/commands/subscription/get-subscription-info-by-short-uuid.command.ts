import { z } from 'zod';
import { REST_API } from '../../api';
import { USERS_STATUS_VALUES } from '../../constants';

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
                expiresAt: z.string().transform((str) => new Date(str)),
                isActive: z.boolean(),
                userStatus: z.enum([USERS_STATUS_VALUES[0], ...USERS_STATUS_VALUES]),
            }),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
