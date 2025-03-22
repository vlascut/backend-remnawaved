import { z } from 'zod';

import { LastConnectedNodeSchema, UsersSchema } from '../../models';
import { RESET_PERIODS } from '../../constants';
import { REST_API } from '../../api';

export namespace UpdateUserCommand {
    export const url = REST_API.USERS.UPDATE;
    export const TSQ_url = url;

    export const RequestSchema = UsersSchema.pick({
        uuid: true,
    }).extend({
        status: UsersSchema.shape.status.optional(),
        trafficLimitBytes: z
            .number({
                invalid_type_error: 'Traffic limit must be a number',
            })
            .int('Traffic limit must be an integer')
            .min(0, 'Traffic limit must be greater than 0')
            .describe('Traffic limit in bytes. 0 - unlimited')
            .optional(),
        trafficLimitStrategy: UsersSchema.shape.trafficLimitStrategy
            .describe('Traffic limit reset strategy')
            .superRefine((val, ctx) => {
                if (val && !Object.values(RESET_PERIODS).includes(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.invalid_enum_value,
                        message: 'Invalid traffic limit strategy',
                        path: ['trafficLimitStrategy'],
                        received: val,
                        options: Object.values(RESET_PERIODS),
                    });
                }
            })
            .optional(),
        activeUserInbounds: z
            .array(z.string().uuid(), {
                invalid_type_error: 'Enabled inbounds must be an array of UUIDs',
            })
            .optional(),
        expireAt: z
            .string()
            .datetime({ local: true, offset: true, message: 'Invalid date format' })
            .transform((str) => new Date(str))
            .refine((date) => date > new Date(), {
                message: 'Expiration date cannot be in the past',
            })
            .describe('Expiration date: 2025-01-17T15:38:45.065Z')
            .optional(),
        description: z.optional(z.string().nullable()),
        telegramId: z.optional(z.number().int().nullable()),
        email: z.optional(z.string().email('Invalid email format').nullable()),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: UsersSchema.extend({
            subscriptionUrl: z.string(),
            lastConnectedNode: LastConnectedNodeSchema,
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
