import { z } from 'zod';

import { HostsSchema } from '../../models';
import { REST_API } from '../../api';

export namespace ReorderHostCommand {
    export const url = REST_API.HOSTS.REORDER;
    export const TSQ_url = url;

    export const RequestSchema = z.object({
        hosts: z.array(
            HostsSchema.pick({
                viewPosition: true,
                uuid: true,
            }),
        ),
    });
    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            isUpdated: z.boolean(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
