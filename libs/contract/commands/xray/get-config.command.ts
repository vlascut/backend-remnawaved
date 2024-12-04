import { z } from 'zod';
import { REST_API } from '../../api';
export namespace GetXrayConfigCommand {
    export const url = REST_API.XRAY.GET_CONFIG;
    export const TSQ_url = url;

    export const ResponseSchema = z.object({
        response: z.object({
            config: z.record(z.any()),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
