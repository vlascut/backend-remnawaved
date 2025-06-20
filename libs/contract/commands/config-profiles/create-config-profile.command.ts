import { z } from 'zod';

import { CONFIG_PROFILES_ROUTES, REST_API } from '../../api';
import { getEndpointDetails } from '../../constants';
import { ConfigProfileSchema } from '../../models';

export namespace CreateConfigProfileCommand {
    export const url = REST_API.CONFIG_PROFILES.CREATE;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        CONFIG_PROFILES_ROUTES.CREATE,
        'post',
        'Create config profile',
    );

    export const RequestSchema = z.object({
        name: z
            .string()
            .min(6, 'Name must be at least 6 characters')
            .max(16, 'Name must be less than 16 characters')
            .regex(
                /^[A-Za-z0-9_-]+$/,
                'Name can only contain letters, numbers, underscores and dashes',
            ),
        config: z.object({}).passthrough(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: ConfigProfileSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
