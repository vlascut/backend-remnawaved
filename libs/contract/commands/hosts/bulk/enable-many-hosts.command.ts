import { z } from 'zod';

import { HostsSchema } from '../../../models';
import { REST_API } from '../../../api';

export namespace BulkEnableHostsCommand {
    export const url = REST_API.HOSTS.BULK.ENABLE_HOSTS;
    export const TSQ_url = url;

    export const RequestSchema = z.object({
        uuids: z.array(z.string().uuid()),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.array(HostsSchema),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
