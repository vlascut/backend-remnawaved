import { z } from 'zod';
import { REST_API } from '../../api';
import { RESET_PERIODS, USERS_STATUS } from '../../constants';
import { UsersSchema } from '../../models';

export namespace CreateUserCommand {
    export const url = REST_API.USERS.CREATE;
    export const TSQ_url = url;

    export const RequestSchema = z.object({
        username: z
            .string({
                required_error: 'Username is required',
                invalid_type_error: 'Username must be a string',
            })
            .regex(
                /^[a-zA-Z0-9_-]+$/,
                'Username can only contain letters, numbers, underscores and dashes',
            )
            .max(32, 'Username must be less than 32 characters')
            .min(6, 'Username must be at least 6 characters'),
        status: UsersSchema.shape.status.optional().default(USERS_STATUS.ACTIVE),
        subscriptionUuid: z
            .string({
                invalid_type_error: 'Subscription UUID must be a string',
            })
            .uuid('Invalid subscription UUID format')
            .optional(),
        shortUuid: z
            .string({
                invalid_type_error: 'Short UUID must be a string',
            })
            .optional(),
        trojanPassword: z
            .string({
                invalid_type_error: 'Trojan password must be a string',
            })
            .min(8, 'Trojan password must be at least 8 characters')
            .max(32, 'Trojan password must be less than 32 characters')
            .optional(),
        vlessUuid: z
            .string({
                invalid_type_error: 'Vless UUID must be a string',
            })
            .uuid('Invalid Vless UUID format')
            .optional(),
        ssPassword: z
            .string({
                invalid_type_error: 'SS password must be a string',
            })
            .min(8, 'SS password must be at least 8 characters')
            .max(32, 'SS password must be less than 32 characters')
            .optional(),
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
            .optional()
            .default(RESET_PERIODS.NO_RESET)
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
            }),
        activeUserInbounds: z
            .array(z.string().uuid(), {
                invalid_type_error: 'Enabled inbounds must be an array',
            })
            .optional(),
        expireAt: z.coerce
            .date({
                required_error: 'Expiration date is required',
                invalid_type_error: 'Invalid expiration date format',
            })
            .refine(() => new Date(), {
                message: 'Expiration date cannot be in the past',
            }),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: UsersSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
