import { Nodes } from '@prisma/client';

export class NodesEntity implements Nodes {
    uuid: string;
    name: string;
    address: string;
    port: number | null;
    isConnected: boolean;
    isConnecting: boolean;
    isDisabled: boolean;
    lastStatusChange: Date | null;
    lastStatusMessage: string | null;
    xrayVersion: string | null;
    isBillTrackingActive: boolean;
    billDate: Date | null;
    billCycle: string | null;
    trafficLimitBytes: number | null;
    trafficUsedBytes: number | null;
    notifyPercent: number | null;
    createdAt: Date;
    updatedAt: Date;

    constructor(nodes: Partial<Nodes>) {
        Object.assign(this, nodes);
        return this;
    }
}
