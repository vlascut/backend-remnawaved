import { z } from 'zod';
import { InboundsSchema } from '../../models/inbounds.schema';

export namespace GetInboundsCommand {
    export const ResponseSchema = z.object({
        response: z.array(InboundsSchema.pick({ tag: true, uuid: true })),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
