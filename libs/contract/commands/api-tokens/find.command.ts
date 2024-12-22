import { z } from 'zod';

import { ApiTokensSchema } from '../../models/api-tokens.schema';
import { REST_API } from '../../api';

export namespace FindAllApiTokensCommand {
    export const url = REST_API.API_TOKENS.GET_ALL;
    export const TSQ_url = url;

    export const ResponseSchema = z.object({
        response: z.array(ApiTokensSchema),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
