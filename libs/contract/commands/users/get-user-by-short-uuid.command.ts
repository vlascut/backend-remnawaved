import { z } from 'zod';
import { UsersSchema } from '../../models/users.schema';

export namespace GetUserByShortUuidCommand {
    export const RequestSchema = z.object({
        shortUuid: z.string(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: UsersSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
