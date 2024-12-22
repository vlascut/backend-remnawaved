import { Nodes } from '@prisma/client';

export class NodesEntity implements Nodes {
    public uuid: string;
    public name: string;
    public address: string;
    public port: null | number;
    public isConnected: boolean;
    public isConnecting: boolean;
    public isDisabled: boolean;
    public isNodeOnline: boolean;
    public isXrayRunning: boolean;
    public lastStatusChange: Date | null;
    public lastStatusMessage: null | string;
    public xrayVersion: null | string;
    public usersOnline: null | number;

    public isTrafficTrackingActive: boolean;
    public trafficResetDay: null | number;
    public trafficLimitBytes: bigint | null;
    public trafficUsedBytes: bigint | null;
    public notifyPercent: null | number;

    public cpuCount: null | number;
    public cpuModel: null | string;
    public totalRam: null | string;

    public createdAt: Date;
    public updatedAt: Date;

    constructor(nodes: Partial<Nodes>) {
        Object.assign(this, nodes);
        return this;
    }
}
