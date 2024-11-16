import { z } from 'zod';
import { ApiTokensSchema } from '../../models/api-tokens.schema';

export namespace FindAllApiTokensCommand {
    export const ResponseSchema = z.object({
        response: z.array(ApiTokensSchema),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
