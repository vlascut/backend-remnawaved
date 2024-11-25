import { z } from 'zod';
import { REST_API } from '../../api';
import { NodesSchema } from '../../models';

export namespace CreateNodeCommand {
    export const url = REST_API.NODES.CREATE;

    export const RequestSchema = NodesSchema.pick({}).extend({
        name: z.string().min(5, 'Name is required'),
        address: z.string().min(2, 'Address is required'),
        port: z.number().int().min(1, 'Port is required').optional(),
        isTrafficTrackingActive: z.boolean().optional().default(false),
        trafficLimitBytes: z
            .number()
            .int()
            .min(0, 'Traffic limit must be greater than 0')
            .optional(),
        notifyPercent: z
            .number()
            .int()
            .min(0, 'Notify percent must be greater than 0')
            .max(100, 'Notify percent must be less than 100')
            .optional(),
        trafficResetDay: z
            .number()
            .int()
            .min(1, 'Traffic reset day must be greater than 0')
            .max(31, 'Traffic reset day must be less than 31')
            .optional(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: NodesSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
