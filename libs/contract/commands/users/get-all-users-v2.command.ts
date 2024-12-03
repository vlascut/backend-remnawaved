import { z } from 'zod';
import { REST_API } from '../../api';
import { UsersSchema } from '../../models/users.schema';

export namespace GetAllUsersV2Command {
    export const url = REST_API.USERS.GET_ALL;

    export const RequestQuerySchema = z.object({
        start: z.number().optional(),
        size: z.number().optional(),
        filters: z
            .array(
                z.object({
                    id: z.string(),
                    value: z.string(),
                }),
            )
            .optional(),
        filterModes: z
            .record(z.string(), z.enum(['contains', 'startsWith', 'endsWith']))
            .optional(),
        globalFilterMode: z.string().optional(),
        sorting: z.array(z.object({ id: z.string(), desc: z.boolean() })).optional(),
    });

    export type RequestQuery = z.infer<typeof RequestQuerySchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            users: z.array(
                UsersSchema.extend({
                    totalUsedBytes: z.string(),
                }),
            ),

            total: z.number(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
