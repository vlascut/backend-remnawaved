import { z } from 'zod';

import { RESET_PERIODS, USERS_STATUS } from '../../constants';
import { REST_API, SUBSCRIPTION_ROUTES } from '../../api';
import { getEndpointDetails } from '../../constants';

export namespace GetRawSubscriptionByShortUuidCommand {
    export const url = REST_API.SUBSCRIPTION.GET_RAW;
    export const TSQ_url = url(':shortUuid');

    export const endpointDetails = getEndpointDetails(
        SUBSCRIPTION_ROUTES.GET_RAW(':shortUuid'),
        'get',
        'Get Raw Subscription by Short UUID',
    );

    export const RequestSchema = z.object({
        shortUuid: z.string(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.object({
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
            subscriptionUrl: z.string(),
            rawHosts: z.array(
                z.object({
                    address: z.optional(z.nullable(z.string())),
                    alpn: z.optional(z.nullable(z.string())),
                    fingerprint: z.optional(z.nullable(z.string())),
                    host: z.optional(z.nullable(z.string())),
                    network: z.optional(z.nullable(z.string())),
                    password: z.optional(z.nullable(z.string())),
                    path: z.optional(z.nullable(z.string())),
                    publicKey: z.optional(z.nullable(z.string())),
                    port: z.optional(z.nullable(z.number())),
                    protocol: z.optional(z.nullable(z.string())),
                    remark: z.optional(z.nullable(z.string())),
                    shortId: z.optional(z.nullable(z.string())),
                    sni: z.optional(z.nullable(z.string())),
                    spiderX: z.optional(z.nullable(z.string())),
                    tls: z.optional(z.nullable(z.string())),
                    headerType: z.optional(z.nullable(z.string())),
                    additionalParams: z.optional(
                        z.nullable(
                            z.object({
                                mode: z.optional(z.nullable(z.string())),
                                heartbeatPeriod: z.optional(z.nullable(z.number())),
                            }),
                        ),
                    ),
                    xHttpExtraParams: z.optional(z.nullable(z.object({}))),
                    serverDescription: z.optional(z.nullable(z.string())),
                    flow: z.optional(z.nullable(z.string())),
                    protocolOptions: z.optional(
                        z.nullable(
                            z.object({
                                ss: z.optional(
                                    z.nullable(
                                        z.object({
                                            method: z.optional(z.nullable(z.string())),
                                        }),
                                    ),
                                ),
                            }),
                        ),
                    ),
                }),
            ),
            headers: z.record(z.string(), z.string()),
            isHwidLimited: z.boolean(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
