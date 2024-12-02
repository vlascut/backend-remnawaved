import { z } from 'zod';
import { REST_API } from '../../api';

export namespace GetBandwidthStatsCommand {
    export const url = REST_API.SYSTEM.BANDWIDTH;

    export const RequestQuerySchema = z.object({
        tz: z.string().optional(),
    });

    export type Request = z.infer<typeof RequestQuerySchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            bandwidthLastTwoDays: z.object({
                current: z.string(),
                previous: z.string(),
                difference: z.string(),
            }),
            bandwidthLastSevenDays: z.object({
                current: z.string(),
                previous: z.string(),
                difference: z.string(),
            }),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
