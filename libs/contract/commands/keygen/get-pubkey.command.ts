import { z } from 'zod';

export namespace GetPubKeyCommand {
    export const ResponseSchema = z.object({
        response: z.object({
            pubKey: z.string(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
