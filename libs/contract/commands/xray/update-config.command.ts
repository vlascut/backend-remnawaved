import { z } from 'zod';

import { REST_API } from '../../api';

export namespace UpdateXrayConfigCommand {
    export const url = REST_API.XRAY.UPDATE_CONFIG;
    export const TSQ_url = url;

    export const RequestSchema = z.object({}).passthrough();

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            config: z.unknown(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
