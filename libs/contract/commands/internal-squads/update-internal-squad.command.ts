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
        inbounds: z.array(z.string().uuid()),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: InternalSquadSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
