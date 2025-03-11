import { z } from 'zod';

import { SubscriptionSettingsSchema } from '../../models';
import { REST_API } from '../../api';

export namespace GetSubscriptionSettingsCommand {
    export const url = REST_API.SUBSCRIPTION_SETTINGS.GET_SETTINGS;

    export const ResponseSchema = z.object({
        response: SubscriptionSettingsSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
