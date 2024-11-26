import { z } from 'zod';
import { REST_API } from '../../api';
import { UsersSchema } from '../../models/users.schema';

export namespace GetAllUsersCommand {
    export const url = REST_API.USERS.GET_ALL;

    export const SortableFields = [
        'username',
        'status',
        'expireAt',
        'createdAt',
        'onlineAt',
        'usedTrafficBytes',
        'trafficLimitBytes',
    ] as const;

    export const SearchableFields = [
        'username',
        'shortUuid',
        'subscriptionUuid',
        'uuid',
        'status',
    ] as const;

    export type SortableField = (typeof SortableFields)[number];
    export type SearchableField = (typeof SearchableFields)[number];

    export const RequestQuerySchema = z.object({
        limit: z
            .string()
            .default('10')
            .transform((val) => parseInt(val)),
        offset: z
            .string()
            .default('0')
            .transform((val) => parseInt(val)),
        orderBy: z.enum(SortableFields).default('createdAt'),
        orderDir: z.enum(['asc', 'desc']).default('desc'),
        search: z.string().optional(),
        searchBy: z.enum(SearchableFields).default('username'),
    });

    // !TODO: add searchBy validation

    export type RequestQuery = z.infer<typeof RequestQuerySchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            users: z.array(UsersSchema),
            total: z.number(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
