import { Injectable } from '@nestjs/common';
import { UniversalConverter } from '@common/converter/universalConverter';
import { Nodes } from '@prisma/client';
import { NodesEntity } from './entities/nodes.entity';

const modelToEntity = (model: Nodes): NodesEntity => {
    return new NodesEntity(model);
};

const entityToModel = (entity: NodesEntity): Nodes => {
    return {
        uuid: entity.uuid,
        name: entity.name,
        address: entity.address,
        port: entity.port,
        isConnected: entity.isConnected,
        isConnecting: entity.isConnecting,
        isDisabled: entity.isDisabled,
        isNodeOnline: entity.isNodeOnline,
        isXrayRunning: entity.isXrayRunning,
        lastStatusChange: entity.lastStatusChange,
        lastStatusMessage: entity.lastStatusMessage,
        xrayVersion: entity.xrayVersion,
        isBillTrackingActive: entity.isBillTrackingActive,
        billDate: entity.billDate,
        billCycle: entity.billCycle,
        trafficLimitBytes: entity.trafficLimitBytes,
        trafficUsedBytes: entity.trafficUsedBytes,
        notifyPercent: entity.notifyPercent,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
    };
};

@Injectable()
export class NodesConverter extends UniversalConverter<NodesEntity, Nodes> {
    constructor() {
        super(modelToEntity, entityToModel);
    }
}
