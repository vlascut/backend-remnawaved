import { z } from 'zod';

import { REST_API } from '../../api';
export namespace GetStatusCommand {
    export const url = REST_API.AUTH.GET_STATUS;
    export const TSQ_url = url;

    export const ResponseSchema = z.object({
        response: z.object({
            isLoginAllowed: z.boolean(),
            isRegisterAllowed: z.boolean(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
