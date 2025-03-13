import { z } from 'zod';

import { UsersSchema } from '../../models/users.schema';
import { LastConnectedNodeSchema } from '../../models';
import { REST_API } from '../../api';

export namespace GetUserByTelegramIdCommand {
    export const url = REST_API.USERS.GET_BY_TELEGRAM_ID;
    export const TSQ_url = url(':telegramId');

    export const RequestSchema = z.object({
        telegramId: z.string(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.array(
            UsersSchema.extend({
                subscriptionUrl: z.string(),
                lastConnectedNode: LastConnectedNodeSchema,
            }),
        ),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
