import { z } from 'zod';

import { INTERNAL_SQUADS_ROUTES, REST_API } from '../../api';
import { getEndpointDetails } from '../../constants';
import { InternalSquadSchema } from '../../models';

export namespace UpdateInternalSquadCommand {
    export const url = REST_API.INTERNAL_SQUADS.UPDATE;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        INTERNAL_SQUADS_ROUTES.UPDATE,
        'patch',
        'Update internal squad',
    );

    export const RequestSchema = z.object({
        uuid: z.string().uuid(),
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(20, 'Name must be less than 20 characters')
            .regex(
                /^[A-Za-z0-9_-]+$/,
                'Name can only contain letters, numbers, underscores and dashes',
            )
            .optional(),
        inbounds: z.array(z.string().uuid()).optional(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: InternalSquadSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
