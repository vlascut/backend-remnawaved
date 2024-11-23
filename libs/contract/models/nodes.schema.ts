import { z } from 'zod';

export const NodesSchema = z.object({
    uuid: z.string().uuid(),
    name: z.string(),
    address: z.string(),
    port: z.number().int().nullable(),
    isConnected: z.boolean().default(false),
    isDisabled: z.boolean().default(false),
    isConnecting: z.boolean().default(false),
    isNodeOnline: z.boolean().default(false),
    isXrayRunning: z.boolean().default(false),
    lastStatusChange: z.date().nullable(),
    lastStatusMessage: z.string().nullable(),
    xrayVersion: z.string().nullable(),
    isTrafficTrackingActive: z.boolean().default(false),
    trafficResetDay: z.number().int().nullable(),
    trafficLimitBytes: z.number().nullable(),
    trafficUsedBytes: z.number().nullable(),
    notifyPercent: z.number().int().nullable(),

    cpuCount: z.number().int().nullable(),
    cpuModel: z.string().nullable(),
    totalRam: z.string().nullable(),

    createdAt: z.date(),
    updatedAt: z.date(),
});
