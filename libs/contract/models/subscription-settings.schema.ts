import { z } from 'zod';

export const SubscriptionSettingsSchema = z.object({
    uuid: z.string().uuid(),

    profileTitle: z.string(),
    supportLink: z.string(),
    profileUpdateInterval: z.number().int(),
    isProfileWebpageUrlEnabled: z.boolean(),

    happAnnounce: z.string().nullable(),
    happRouting: z.string().nullable(),

    expiredUsersRemarks: z.array(z.string()),
    limitedUsersRemarks: z.array(z.string()),
    disabledUsersRemarks: z.array(z.string()),

    createdAt: z
        .string()
        .datetime()
        .transform((str) => new Date(str)),
    updatedAt: z
        .string()
        .datetime()
        .transform((str) => new Date(str)),
});
