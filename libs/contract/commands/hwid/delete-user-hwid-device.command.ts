import { z } from 'zod';

import { HwidUserDeviceSchema } from '../../models';
import { REST_API } from '../../api';

export namespace DeleteUserHwidDeviceCommand {
    export const url = REST_API.HWID.DELETE_USER_HWID_DEVICE;
    export const TSQ_url = url;

    export const RequestSchema = z.object({
        userUuid: z.string().uuid(),
        hwid: z.string(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.array(HwidUserDeviceSchema),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
