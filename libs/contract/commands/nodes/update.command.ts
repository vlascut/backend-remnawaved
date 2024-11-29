import { z } from 'zod';
import { REST_API } from '../../api';
import { NodesSchema } from '../../models';

export namespace UpdateNodeCommand {
    export const url = REST_API.NODES.UPDATE;

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
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: NodesSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
