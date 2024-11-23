import { z } from 'zod';

export namespace GetSubscriptionByShortUuidCommand {
    export const RequestSchema = z.object({
        shortUuid: z.string(),
    });

    export type Request = z.infer<typeof RequestSchema>;
}
