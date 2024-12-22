import { z } from 'zod';

import { USERS_STATUS } from '../../constants';
import { REST_API } from '../../api';

export namespace GetStatsCommand {
    export const url = REST_API.SYSTEM.STATS;
    export const TSQ_url = url;

    export const RequestQuerySchema = z.object({
        tz: z.string().optional(),
    });

    export type Request = z.infer<typeof RequestQuerySchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            cpu: z.object({
                cores: z.number(),
                physicalCores: z.number(),
            }),
            memory: z.object({
                total: z.number(),
                free: z.number(),
                used: z.number(),
                active: z.number(),
                available: z.number(),
            }),
            uptime: z.number(),
            timestamp: z.number(),
            users: z.object({
                onlineLastMinute: z.number(),
                statusCounts: z.record(
                    z.enum(Object.values(USERS_STATUS) as [string, ...string[]]),
                    z.number(),
                ),
                totalUsers: z.number(),
                totalTrafficBytes: z.string(),
            }),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
