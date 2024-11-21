import { TNodesCycle } from '@libs/contracts/constants';
import { NodesEntity } from '../entities/nodes.entity';

export class CreateNodeResponseModel {
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

    public createdAt: Date;
    public updatedAt: Date;

    constructor(data: NodesEntity) {
        this.uuid = data.uuid;
        this.name = data.name;
        this.address = data.address;
        this.port = data.port;
        this.isConnected = data.isConnected;
        this.isConnecting = data.isConnecting;
        this.isDisabled = data.isDisabled;
        this.isNodeOnline = data.isNodeOnline;
        this.isXrayRunning = data.isXrayRunning;
        this.lastStatusChange = data.lastStatusChange;
        this.lastStatusMessage = data.lastStatusMessage;
        this.xrayVersion = data.xrayVersion;
        this.isBillTrackingActive = data.isBillTrackingActive;
        this.billDate = data.billDate;
        this.billCycle = data.billCycle;
        this.trafficLimitBytes = data.trafficLimitBytes;
        this.trafficUsedBytes = data.trafficUsedBytes;
        this.notifyPercent = data.notifyPercent;

        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}
