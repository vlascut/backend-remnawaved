import { z } from 'zod';

import { HostsSchema } from '../../models';
import { REST_API } from '../../api';

export namespace GetOneHostCommand {
    export const url = REST_API.HOSTS.GET_ONE;
    export const TSQ_url = url(':uuid');

    export const RequestSchema = z.object({
        uuid: z.string().uuid(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: HostsSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
