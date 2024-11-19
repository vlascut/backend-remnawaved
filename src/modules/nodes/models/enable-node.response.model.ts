import { NodesEntity } from '../entities/nodes.entity';

export class EnableNodeResponseModel {
    public uuid: string;
    public name: string;
    public address: string;
    public port: number | null;
    public isConnected: boolean;
    public isConnecting: boolean;
    public isDisabled: boolean;
    public lastStatusChange: Date | null;
    public lastStatusMessage: string | null;
    public xrayVersion: string | null;
    public isBillTrackingActive: boolean;
    public billDate: Date | null;
    public billCycle: string | null;

    public trafficLimitBytes: number | null;
    public trafficUsedBytes: number | null;
    public notifyPercent: number | null;

    public createdAt: Date;
    public updatedAt: Date;

    constructor(data: NodesEntity) {
        this.uuid = data.uuid;
        this.isDisabled = data.isDisabled;
    }
}
