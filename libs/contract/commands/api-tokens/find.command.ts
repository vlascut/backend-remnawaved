import { z } from 'zod';

import { ApiTokensSchema } from '../../models/api-tokens.schema';
import { REST_API } from '../../api';

export namespace FindAllApiTokensCommand {
    export const url = REST_API.API_TOKENS.GET_ALL;
    export const TSQ_url = url;

    export const ResponseSchema = z.object({
        response: z.object({
            apiKeys: z.array(ApiTokensSchema),
            docs: z.object({
                isDocsEnabled: z.boolean(),
                scalarPath: z.string().nullable(),
                swaggerPath: z.string().nullable(),
            }),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
