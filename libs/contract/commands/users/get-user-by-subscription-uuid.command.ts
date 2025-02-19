import { z } from 'zod';

import { UsersSchema } from '../../models/users.schema';
import { REST_API } from '../../api';
import { LastConnectedNodeSchema } from '../../models';

export namespace GetUserBySubscriptionUuidCommand {
    export const url = REST_API.USERS.GET_BY_SUBSCRIPTION_UUID;
    export const TSQ_url = url(':subscriptionUuid');

    export const RequestSchema = z.object({
        subscriptionUuid: z.string(),
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
