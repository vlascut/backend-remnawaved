import { z } from 'zod';
import { NodesSchema } from '../../models';

export namespace EnableNodeCommand {
    export const RequestSchema = z.object({
        uuid: z.string().uuid(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: NodesSchema.pick({
            uuid: true,
            isDisabled: true,
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
