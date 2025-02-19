import { z } from 'zod';

import { UsersSchema, LastConnectedNodeSchema } from '../../models';
import { REST_API } from '../../api';

export namespace GetUserByUsernameCommand {
    export const url = REST_API.USERS.GET_BY_USERNAME;
    export const TSQ_url = url(':username');

    export const RequestSchema = z.object({
        username: z.string(),
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
