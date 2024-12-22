import { z } from 'zod';

import { InboundsSchema } from '../../models/inbounds.schema';
import { REST_API } from '../../api';

export namespace GetInboundsCommand {
    export const url = REST_API.INBOUNDS.GET_INBOUNDS;
    export const TSQ_url = url;

    export const ResponseSchema = z.object({
        response: z.array(InboundsSchema),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
