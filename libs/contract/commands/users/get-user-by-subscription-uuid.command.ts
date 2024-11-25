import { z } from 'zod';
import { REST_API } from '../../api';
import { UsersSchema } from '../../models/users.schema';

export namespace GetUserBySubscriptionUuidCommand {
    export const url = REST_API.USERS.GET_BY_SUBSCRIPTION_UUID;

    export const RequestSchema = z.object({
        subscriptionUuid: z.string(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: UsersSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
