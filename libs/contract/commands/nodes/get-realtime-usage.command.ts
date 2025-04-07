import { z } from 'zod';

import { REST_API } from '../../api';

export namespace GetNodesRealtimeUsageCommand {
    export const url = REST_API.NODES.STATS.USAGE_REALTIME;
    export const TSQ_url = url;

    export const ResponseSchema = z.object({
        response: z.array(
            z.object({
                nodeUuid: z.string().uuid(),
                nodeName: z.string(),
                countryCode: z.string(),
                downloadBytes: z.number(),
                uploadBytes: z.number(),
                totalBytes: z.number(),
                downloadSpeedBps: z.number(),
                uploadSpeedBps: z.number(),
                totalSpeedBps: z.number(),
            }),
        ),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
