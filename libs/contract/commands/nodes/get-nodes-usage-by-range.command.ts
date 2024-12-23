import { z } from 'zod';

import { REST_API } from '../../api';

export namespace GetNodesUsageByRangeCommand {
    export const url = REST_API.NODES.STATS.USAGE_BY_RANGE;
    export const TSQ_url = url;

    export const RequestQuerySchema = z.object({
        start: z.string().transform((str) => new Date(str)),
        end: z.string().transform((str) => new Date(str)),
    });

    export type RequestQuery = z.infer<typeof RequestQuerySchema>;

    export const ResponseSchema = z.object({
        response: z.array(
            z.object({
                nodeUuid: z.string().uuid(),
                nodeName: z.string(),
                total: z.number(),
                totalDownload: z.number(),
                totalUpload: z.number(),
                humanReadableTotal: z.string(),
                humanReadableTotalDownload: z.string(),
                humanReadableTotalUpload: z.string(),
            }),
        ),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
