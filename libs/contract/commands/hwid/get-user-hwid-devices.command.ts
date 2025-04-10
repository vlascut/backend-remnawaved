import { z } from 'zod';

import { HwidUserDeviceSchema } from '../../models';
import { REST_API } from '../../api';

export namespace GetUserHwidDevicesCommand {
    export const url = REST_API.HWID.GET_USER_HWID_DEVICES;
    export const TSQ_url = url(':userUuid');

    export const RequestSchema = z.object({
        userUuid: z.string().uuid(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.array(HwidUserDeviceSchema),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
