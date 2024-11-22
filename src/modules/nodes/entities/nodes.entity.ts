import { Nodes } from '@prisma/client';
import { TNodesCycle } from '@contract/constants';

export class NodesEntity implements Nodes {
    public uuid: string;
    public name: string;
    public address: string;
    public port: number | null;
    public isConnected: boolean;
    public isConnecting: boolean;
    public isDisabled: boolean;
    public isNodeOnline: boolean;
    public isXrayRunning: boolean;
    public lastStatusChange: Date | null;
    public lastStatusMessage: string | null;
    public xrayVersion: string | null;

    public isBillTrackingActive: boolean;
    public billDate: Date | null;
    public billCycle: TNodesCycle | null;
    public trafficLimitBytes: number | null;
    public trafficUsedBytes: number | null;
    public notifyPercent: number | null;

    public cpuCount: number | null;
    public cpuModel: string | null;
    public totalRam: string | null;

    public createdAt: Date;
    public updatedAt: Date;

    constructor(nodes: Partial<Nodes>) {
        Object.assign(this, nodes);
        return this;
    }

    public updateStatus(status: Partial<NodesEntity>): void {
        Object.assign(this, status);
    }
}
