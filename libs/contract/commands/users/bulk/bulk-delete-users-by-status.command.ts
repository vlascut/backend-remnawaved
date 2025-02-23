import { z } from 'zod';

import { UsersSchema } from '../../../models';
import { REST_API } from '../../../api';

export namespace BulkDeleteUsersByStatusCommand {
    export const url = REST_API.USERS.BULK.DELETE_BY_STATUS;
    export const TSQ_url = url;

    export const RequestSchema = z.object({
        status: UsersSchema.shape.status,
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            affectedRows: z.number(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
