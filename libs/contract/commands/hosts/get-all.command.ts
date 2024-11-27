import { z } from 'zod';
import { REST_API } from '../../api';
import { HostsSchema } from '../../models';

export namespace GetAllHostsCommand {
    export const url = REST_API.HOSTS.GET_ALL;

    export const ResponseSchema = z.object({
        response: z.array(HostsSchema),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
