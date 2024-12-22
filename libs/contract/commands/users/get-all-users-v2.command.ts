import { z } from 'zod';

import { UsersSchema } from '../../models/users.schema';
import { REST_API } from '../../api';

export namespace GetAllUsersV2Command {
    export const url = REST_API.USERS.GET_ALL_V2;
    export const TSQ_url = url;

    const FilterSchema = z.object({
        id: z.string(),
        value: z.unknown(),
    });

    const SortingSchema = z.object({
        id: z.string(),
        desc: z.boolean(),
    });

    // Основная схема для запроса
    export const RequestQuerySchema = z.object({
        start: z.coerce.number().optional(),
        size: z.coerce.number().optional(),
        filters: z
            .preprocess(
                (str) => (typeof str === 'string' ? JSON.parse(str) : str),
                z.array(FilterSchema),
            )
            .optional(),

        filterModes: z
            .preprocess(
                (str) => (typeof str === 'string' ? JSON.parse(str) : str),
                z.record(z.string(), z.string()),
            )
            .optional(),

        globalFilterMode: z.string().optional(),

        sorting: z
            .preprocess(
                (str) => (typeof str === 'string' ? JSON.parse(str) : str),
                z.array(SortingSchema),
            )
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
