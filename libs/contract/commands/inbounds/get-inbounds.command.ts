import { z } from 'zod';
import { REST_API } from '../../api';
import { InboundsSchema } from '../../models/inbounds.schema';

export namespace GetInboundsCommand {
    export const url = REST_API.INBOUNDS.GET_INBOUNDS;

    export const ResponseSchema = z.object({
        response: z.array(InboundsSchema),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
