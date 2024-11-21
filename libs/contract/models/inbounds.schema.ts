import { z } from 'zod';

export const InboundsSchema = z.object({
    uuid: z.string().uuid(),
    tag: z.string(),
    type: z.string(),
});
