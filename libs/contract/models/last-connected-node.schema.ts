import { z } from 'zod';

export const LastConnectedNodeSchema = z
    .object({
        connectedAt: z.string().transform((str) => new Date(str)),
        nodeName: z.string(),
    })
    .nullable();
