import { z } from 'zod';
import { REST_API } from '../../api';
export namespace RestartAllNodesCommand {
    export const url = REST_API.NODES.RESTART_ALL;

    export const ResponseSchema = z.object({
        response: z.object({
            eventSent: z.boolean(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
