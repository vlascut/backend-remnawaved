import { z } from 'zod';

import { REST_API } from '../../api';

export namespace GetInboundsCommand {
    export const url = REST_API.INBOUNDS.GET_INBOUNDS;
    export const TSQ_url = url;

    export const ResponseSchema = z.object({
        response: z.array(
            z.object({
                uuid: z.string().uuid(),
                tag: z.string(),
                type: z.string(),
                port: z.number(),
                network: z.string().nullable(),
                security: z.string().nullable(),
            }),
        ),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
