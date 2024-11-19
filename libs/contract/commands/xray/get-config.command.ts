import { z } from 'zod';

export namespace GetXrayConfigCommand {
    export const ResponseSchema = z.object({
        response: z.object({
            config: z.record(z.any()),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
