import { z } from 'zod';
import { REST_API } from '../../api';

export namespace CreateApiTokenCommand {
    export const url = REST_API.API_TOKENS.CREATE;

    export const RequestSchema = z.object({
        tokenName: z.string(),
        tokenDescription: z.string().nullable(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            token: z.string(),
            uuid: z.string(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
