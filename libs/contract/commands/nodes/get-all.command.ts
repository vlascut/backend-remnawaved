import { z } from 'zod';
import { REST_API } from '../../api';
import { NodesSchema } from '../../models';

export namespace GetAllNodesCommand {
    export const url = REST_API.NODES.GET_ALL;
    export const TSQ_url = url;

    export const ResponseSchema = z.object({
        response: z.array(NodesSchema),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
