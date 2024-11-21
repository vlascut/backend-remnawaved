import { z } from 'zod';
import { UsersSchema } from '../../models/users.schema';

export namespace GetUserBySubscriptionUuidCommand {
    export const RequestSchema = z.object({
        subscriptionUuid: z.string(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: UsersSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
