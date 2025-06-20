import { z } from 'zod';

import { CONFIG_PROFILES_ROUTES, REST_API } from '../../api';
import { getEndpointDetails } from '../../constants';
import { ConfigProfileSchema } from '../../models';

export namespace UpdateConfigProfileCommand {
    export const url = REST_API.CONFIG_PROFILES.UPDATE;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        CONFIG_PROFILES_ROUTES.UPDATE,
        'patch',
        'Update Core Config in specific config profile',
    );

    export const RequestSchema = z.object({
        uuid: z.string().uuid('UUID must be a valid UUID'),
        config: z.object({}).passthrough(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: ConfigProfileSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
