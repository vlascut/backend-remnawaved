import { z } from 'zod';
import { REST_API } from '../../api';
import { UsersSchema } from '../../models/users.schema';

export namespace EnableUserCommand {
    export const url = REST_API.USERS.ENABLE_USER;

    export const RequestSchema = z.object({
        uuid: z.string().uuid(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: UsersSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
