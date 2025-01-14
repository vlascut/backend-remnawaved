import { z } from 'zod';

import { NodesSchema } from '../../models';
import { REST_API } from '../../api';

export namespace UpdateNodeCommand {
    export const url = REST_API.NODES.UPDATE;
    export const TSQ_url = url;

    export const RequestSchema = NodesSchema.pick({
        uuid: true,
    }).extend({
        name: z.optional(z.string().min(5, 'Min. 5 characters')),
        address: z.optional(z.string().min(2, 'Min. 2 characters')),
        port: z.optional(z.number()),
        isTrafficTrackingActive: z.optional(z.boolean()),
        trafficLimitBytes: z.optional(z.number().min(0, 'Traffic limit must be greater than 0')),
        notifyPercent: z.optional(
            z
                .number()
                .min(0, 'Notify percent must be greater than 0')
                .max(100, 'Notify percent must be less than 100'),
        ),
        trafficResetDay: z.optional(
            z
                .number()
                .min(1, 'Traffic reset day must be greater than 0')
                .max(31, 'Traffic reset day must be less than 31'),
        ),
        excludedInbounds: z.optional(
            z.array(z.string().uuid(), {
                invalid_type_error: 'Excluded inbounds must be an array of UUIDs',
            }),
        ),
        countryCode: z.optional(
            z.string().max(2, 'Country code must be 2 characters').toUpperCase(),
        ),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: NodesSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
