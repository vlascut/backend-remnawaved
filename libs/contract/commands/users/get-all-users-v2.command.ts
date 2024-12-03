import { z } from 'zod';
import { REST_API } from '../../api';
import { UsersSchema } from '../../models/users.schema';

export namespace GetAllUsersV2Command {
    export const url = REST_API.USERS.GET_ALL_V2;

    export const RequestQuerySchema = z.object({
        start: z.coerce.number().optional(),
        size: z.coerce.number().optional(),
        filters: z
            .string()
            .transform((str) => JSON.parse(str))
            .pipe(
                z.array(
                    z.object({
                        id: z.string(),
                        value: z.string(),
                    }),
                ),
            )
            .optional(),
        filterModes: z
            .string()
            .transform((str) => JSON.parse(str))
            .pipe(z.record(z.string(), z.string()))
            .optional(),
        globalFilterMode: z.string().optional(),
        sorting: z
            .string()
            .transform((str) => JSON.parse(str))
            .pipe(z.array(z.object({ id: z.string(), desc: z.boolean() })))
            .optional(),
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
