import { z } from 'zod';
import { NodesSchema } from '../../models';

export namespace GetAllNodesCommand {
    export const ResponseSchema = z.object({
        response: z.array(NodesSchema),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
