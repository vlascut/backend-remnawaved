import { z } from 'zod';

import { FullInboundsSchema } from '../../models/full-inbounds.schema';
import { REST_API } from '../../api';

export namespace GetFullInboundsCommand {
    export const url = REST_API.INBOUNDS.GET_FULL_INBOUNDS;
    export const TSQ_url = url;

    export const ResponseSchema = z.object({
        response: z.array(FullInboundsSchema),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
