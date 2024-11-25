import { z } from 'zod';
import { REST_API } from '../../api';
export namespace LoginCommand {
    export const url = REST_API.AUTH.LOGIN;

    export const RequestSchema = z.object({
        username: z.string(),
        password: z.string(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            accessToken: z.string(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
