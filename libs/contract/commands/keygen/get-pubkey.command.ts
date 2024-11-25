import { z } from 'zod';
import { REST_API } from '../../api';

export namespace GetPubKeyCommand {
    export const url = REST_API.KEYGEN.GET;

    export const ResponseSchema = z.object({
        response: z.object({
            pubKey: z.string(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
