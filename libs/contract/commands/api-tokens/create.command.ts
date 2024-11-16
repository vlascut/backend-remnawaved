import { z } from 'zod';

export namespace CreateApiTokenCommand {
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
