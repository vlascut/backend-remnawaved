import { z } from 'zod';

import { getEndpointDetails } from '../../constants';
import { REST_API, SYSTEM_ROUTES } from '../../api';

export namespace GetRemnawaveHealthCommand {
    export const url = REST_API.SYSTEM.HEALTH;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        SYSTEM_ROUTES.HEALTH,
        'get',
        'Get Remnawave Health',
    );

    export const ResponseSchema = z.object({
        response: z.object({
            pm2Stats: z.array(
                z.object({
                    name: z.string(),
                    memory: z.string(),
                    cpu: z.string(),
                }),
            ),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
