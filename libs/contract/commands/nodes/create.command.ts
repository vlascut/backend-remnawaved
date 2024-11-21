import { z } from 'zod';
import { NodesSchema } from '../../models';
import { NODES_CYCLE_VALUES } from '../../constants';

export namespace CreateNodeCommand {
    export const RequestSchema = NodesSchema.pick({}).extend({
        name: z.string().min(5, 'Name is required'),
        address: z.string().min(2, 'Address is required'),
        port: z.number().int().min(1, 'Port is required').optional(),
        isBillTrackingActive: z.boolean().optional().default(false),
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
        billDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
            .transform((date) => new Date(date))
            .optional(),
        billCycle: z.nullable(
            NodesSchema.shape.billCycle
                .describe('Bill cycle')
                .optional()
                .superRefine((val, ctx) => {
                    if (val && !Object.values(NODES_CYCLE_VALUES).includes(val)) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.invalid_enum_value,
                            message: 'Invalid bill cycle',
                            path: ['billCycle'],
                            received: val,
                            options: Object.values(NODES_CYCLE_VALUES),
                        });
                    }
                }),
        ),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: NodesSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
