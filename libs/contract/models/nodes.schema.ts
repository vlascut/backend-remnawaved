import { z } from 'zod';
import { NODES_CYCLE_VALUES } from '../constants';

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
    isBillTrackingActive: z.boolean().default(false),
    billDate: z.date().nullable(),
    billCycle: z.enum([NODES_CYCLE_VALUES[0], ...NODES_CYCLE_VALUES]).nullable(),
    trafficLimitBytes: z.number().int().nullable(),
    trafficUsedBytes: z.number().int().nullable(),
    notifyPercent: z.number().int().nullable(),

    cpuCount: z.number().int().nullable(),
    cpuModel: z.string().nullable(),
    totalRam: z.string().nullable(),

    createdAt: z.date(),
    updatedAt: z.date(),
});
