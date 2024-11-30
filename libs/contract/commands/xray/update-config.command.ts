import { z } from 'zod';
import { REST_API } from '../../api';

export namespace UpdateXrayConfigCommand {
    export const url = REST_API.XRAY.UPDATE_CONFIG;

    export const RequestSchema = z.record(z.any());

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            config: z.record(z.any()),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
