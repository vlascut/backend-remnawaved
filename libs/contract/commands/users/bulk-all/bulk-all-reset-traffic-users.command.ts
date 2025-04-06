import { z } from 'zod';

import { REST_API } from '../../../api';

export namespace BulkAllResetTrafficUsersCommand {
    export const url = REST_API.USERS.BULK.ALL.RESET_TRAFFIC;
    export const TSQ_url = url;

    export const ResponseSchema = z.object({
        response: z.object({
            eventSent: z.boolean(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
