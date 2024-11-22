import { TNodesCycle } from '@libs/contracts/constants';
import { NodesEntity } from '../entities/nodes.entity';

export class EnableNodeResponseModel implements Omit<NodesEntity, 'updateStatus'> {
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

    constructor(data: NodesEntity) {
        this.uuid = data.uuid;
        this.isDisabled = data.isDisabled;
    }

    public updateStatus(status: Partial<NodesEntity>): void {
        Object.assign(this, status);
    }

    //! TODO: remove this
}
