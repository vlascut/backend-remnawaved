import { z } from 'zod';

import { NodesSchema } from '../../models';
import { REST_API } from '../../api';

export namespace ReorderNodeCommand {
    export const url = REST_API.NODES.REORDER;
    export const TSQ_url = url;

    export const RequestSchema = z.object({
        nodes: z.array(
            NodesSchema.pick({
                viewPosition: true,
                uuid: true,
            }),
        ),
    });
    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.array(NodesSchema),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
