import { z } from 'zod';
import { REST_API } from '../../api';
import { NodesSchema } from '../../models';

export namespace CreateNodeCommand {
    export const url = REST_API.NODES.CREATE;
    export const TSQ_url = url;

    export const RequestSchema = z.object({
        name: z.string().min(5, 'Name is required'),
        address: z.string().min(2, 'Address is required'),
        port: z.number().int().min(1, 'Port is required').optional(),
        isTrafficTrackingActive: z.boolean().optional().default(false),
        trafficLimitBytes: z.optional(
            z.number().int().min(0, 'Traffic limit must be greater than 0'),
        ),
        notifyPercent: z.optional(
            z
                .number()
                .int()
                .min(0, 'Notify percent must be greater than 0')
                .max(100, 'Notify percent must be less than 100'),
        ),
        trafficResetDay: z.optional(
            z
                .number()
                .int()
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
