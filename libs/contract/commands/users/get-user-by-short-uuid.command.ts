import { z } from 'zod';
import { REST_API } from '../../api';
import { UsersSchema } from '../../models/users.schema';

export namespace GetUserByShortUuidCommand {
    export const url = REST_API.USERS.GET_BY_SHORT_UUID;

    export const RequestSchema = z.object({
        shortUuid: z.string(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: UsersSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
