import { z } from 'zod';

import { InboundsSchema } from './inbounds.schema';

export const NodesSchema = z.object({
    uuid: z.string().uuid(),
    name: z.string(),
    address: z.string(),
    port: z.nullable(z.number().int()),
    isConnected: z.boolean(),
    isDisabled: z.boolean(),
    isConnecting: z.boolean(),
    isNodeOnline: z.boolean(),
    isXrayRunning: z.boolean(),
    lastStatusChange: z.nullable(z.string().transform((str) => new Date(str))),
    lastStatusMessage: z.nullable(z.string()),
    xrayVersion: z.nullable(z.string()),
    isTrafficTrackingActive: z.boolean(),
    trafficResetDay: z.nullable(z.number().int()),
    trafficLimitBytes: z.nullable(z.number()),
    trafficUsedBytes: z.nullable(z.number()),
    notifyPercent: z.nullable(z.number().int()),
    usersOnline: z.nullable(z.number().int()),

    viewPosition: z.number().int(),
    countryCode: z.string(),

    cpuCount: z.nullable(z.number().int()),
    cpuModel: z.nullable(z.string()),
    totalRam: z.nullable(z.string()),

    createdAt: z.string().transform((str) => new Date(str)),
    updatedAt: z.string().transform((str) => new Date(str)),

    excludedInbounds: z.array(InboundsSchema),
});
