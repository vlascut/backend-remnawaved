import { z } from 'zod';

export namespace DeleteApiTokenCommand {
    export const RequestSchema = z.object({
        uuid: z.string().uuid(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.boolean(),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
