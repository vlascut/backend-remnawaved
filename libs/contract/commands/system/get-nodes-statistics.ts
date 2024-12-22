import { z } from 'zod';

import { REST_API } from '../../api';

export namespace GetNodesStatisticsCommand {
    export const url = REST_API.SYSTEM.NODES_STATISTIC;
    export const TSQ_url = url;

    export const RequestQuerySchema = z.object({
        tz: z.string().optional(),
    });

    export type Request = z.infer<typeof RequestQuerySchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            lastSevenDays: z.array(
                z.object({
                    nodeName: z.string(),
                    date: z.string(),
                    totalBytes: z.string(),
                }),
            ),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
