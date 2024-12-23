import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { AxiosService } from '@common/axios';

import { NodesRepository } from '../../repositories/nodes.repository';
import { StopNodeEvent } from './stop-node.event';

@EventsHandler(StopNodeEvent)
export class StopNodeHandler implements IEventHandler<StopNodeEvent> {
    public readonly logger = new Logger(StopNodeHandler.name);

    constructor(
        private readonly axios: AxiosService,
        private readonly nodesRepository: NodesRepository,
    ) {}
    async handle(event: StopNodeEvent) {
        try {
            const nodeEntity = event.node;

            await this.axios.stopXray(nodeEntity.address, nodeEntity.port);

            await this.nodesRepository.update({
                uuid: nodeEntity.uuid,
                isXrayRunning: false,
                isNodeOnline: false,
                lastStatusMessage: null,
                lastStatusChange: new Date(),
                isConnected: false,
                isConnecting: false,
                isDisabled: true,
            });
            return;
        } catch (error) {
            this.logger.error(`Error in Event StopNodeHandler: ${error}`);
        }
    }
}
