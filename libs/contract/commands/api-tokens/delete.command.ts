import { z } from 'zod';

import { REST_API } from '../../api';

export namespace DeleteApiTokenCommand {
    export const url = REST_API.API_TOKENS.DELETE;
    export const TSQ_url = url(':uuid');

    export const RequestSchema = z.object({
        uuid: z.string().uuid(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.boolean(),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
