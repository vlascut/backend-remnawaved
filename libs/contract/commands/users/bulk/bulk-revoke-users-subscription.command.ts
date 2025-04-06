import { z } from 'zod';

import { REST_API } from '../../../api';

export namespace BulkRevokeUsersSubscriptionCommand {
    export const url = REST_API.USERS.BULK.REVOKE_SUBSCRIPTION;
    export const TSQ_url = url;

    export const RequestSchema = z.object({
        uuids: z.array(z.string().uuid()),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            affectedRows: z.number(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
