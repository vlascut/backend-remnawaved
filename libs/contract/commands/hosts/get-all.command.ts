import { z } from 'zod';

import { HostsSchema } from '../../models';
import { REST_API } from '../../api';

export namespace GetAllHostsCommand {
    export const url = REST_API.HOSTS.GET_ALL;
    export const TSQ_url = url;

    export const ResponseSchema = z.object({
        response: z.array(HostsSchema),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
