import { z } from 'zod';
import { REST_API } from '../../api';
import { UsersSchema } from '../../models/users.schema';

export namespace GetAllUsersCommand {
    export const url = REST_API.USERS.GET_ALL;

    export const RequestQuerySchema = z.object({
        limit: z
            .string()
            .default('10')
            .transform((val) => parseInt(val)),
        offset: z
            .string()
            .default('0')
            .transform((val) => parseInt(val)),
    });

    export type RequestQuery = z.infer<typeof RequestQuerySchema>;

    export const ResponseSchema = z.object({
        response: z.array(UsersSchema),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
